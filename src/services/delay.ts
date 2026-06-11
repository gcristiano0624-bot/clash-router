import { delayProxyByName, ProxyDelay } from 'tauri-plugin-mihomo-api'

import { debugLog } from '@/utils/debug'

const hashKey = (name: string, group: string) => `${group ?? ''}::${name}`

export type DelayStatus =
  | 'idle'
  | 'testing'
  | 'ok'
  | 'timeout'
  | 'dns-error'
  | 'tls-error'
  | 'probe-blocked'
  | 'network-error'
  | 'error'

export const DEFAULT_LATENCY_FALLBACK_URLS = [
  'https://cp.cloudflare.com/generate_204',
  'https://www.gstatic.com/generate_204',
  'https://www.apple.com/library/test/success.html',
]

const DELAY_TIMEOUT_SENTINEL = 30000
const DELAY_DNS_ERROR_SENTINEL = 100001
const DELAY_TLS_ERROR_SENTINEL = 100002
const DELAY_PROBE_BLOCKED_SENTINEL = 100003
const DELAY_NETWORK_ERROR_SENTINEL = 100004
const DELAY_GENERIC_ERROR_SENTINEL = 100005
const SUCCESS_PROTECTION_TTL = 60 * 1000

export interface DelayUpdate {
  delay: number
  status?: DelayStatus
  sourceUrl?: string
  fallbackIndex?: number
  error?: string
  elapsed?: number
  updatedAt: number
}

const CACHE_TTL = 30 * 60 * 1000

class DelayManager {
  private cache = new Map<string, DelayUpdate>()
  private successCache = new Map<string, DelayUpdate>()
  private urlMap = new Map<string, string>()

  // 每个节点的监听
  private listenerMap = new Map<string, (update: DelayUpdate) => void>()

  // 每个分组的监听
  private groupListenerMap = new Map<string, () => void>()

  private pendingItemUpdates = new Map<string, DelayUpdate[]>()
  private pendingGroupUpdates = new Set<string>()
  private itemFlushScheduled = false
  private groupFlushScheduled = false

  private scheduleOnNextFrame(run: () => void): void {
    if (typeof window !== 'undefined') {
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(run)
        return
      }
      if (typeof window.setTimeout === 'function') {
        window.setTimeout(run, 0)
        return
      }
    }

    Promise.resolve().then(run)
  }

  private scheduleItemFlush() {
    if (this.itemFlushScheduled) return
    this.itemFlushScheduled = true

    this.scheduleOnNextFrame(() => {
      this.itemFlushScheduled = false
      const updates = this.pendingItemUpdates
      this.pendingItemUpdates = new Map()

      updates.forEach((queue, key) => {
        const listener = this.listenerMap.get(key)
        if (!listener) return

        queue.forEach((update) => {
          try {
            listener(update)
          } catch (error) {
            console.error(
              `[DelayManager] 通知节点延迟监听器失败: ${key}`,
              error,
            )
          }
        })
      })
    })
  }

  private scheduleGroupFlush() {
    if (this.groupFlushScheduled) return
    this.groupFlushScheduled = true

    this.scheduleOnNextFrame(() => {
      this.groupFlushScheduled = false
      const groups = this.pendingGroupUpdates
      this.pendingGroupUpdates = new Set()

      groups.forEach((group) => {
        const listener = this.groupListenerMap.get(group)
        if (!listener) return
        try {
          listener()
        } catch (error) {
          console.error(
            `[DelayManager] 通知分组延迟监听器失败: ${group}`,
            error,
          )
        }
      })
    })
  }

  private queueGroupNotification(group: string) {
    this.pendingGroupUpdates.add(group)
    this.scheduleGroupFlush()
  }

  setUrl(group: string, url: string) {
    debugLog(`[DelayManager] 设置测试URL，组: ${group}, URL: ${url}`)
    this.urlMap.set(group, url)
  }

  getUrlCandidates(group: string) {
    const rawValue = this.urlMap.get(group) || ''
    const urls = rawValue
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)

    return urls.length > 0 ? urls : DEFAULT_LATENCY_FALLBACK_URLS
  }

  getUrl(group: string) {
    const url = this.getUrlCandidates(group)[0]
    debugLog(
      `[DelayManager] 获取测试URL，组: ${group}, URL: ${url || '未设置'}`,
    )
    return url
  }

  setListener(
    name: string,
    group: string,
    listener: (update: DelayUpdate) => void,
  ) {
    const key = hashKey(name, group)
    this.listenerMap.set(key, listener)
  }

  removeListener(name: string, group: string) {
    const key = hashKey(name, group)
    this.listenerMap.delete(key)
  }

  setGroupListener(group: string, listener: () => void) {
    this.groupListenerMap.set(group, listener)
  }

  removeGroupListener(group: string) {
    this.groupListenerMap.delete(group)
  }

  setDelay(
    name: string,
    group: string,
    delay: number,
    meta?: {
      status?: DelayStatus
      sourceUrl?: string
      fallbackIndex?: number
      error?: string
      elapsed?: number
    },
  ): DelayUpdate {
    const key = hashKey(name, group)
    const incomingStatus = meta?.status ?? this.getDelayStatus(delay)
    const protectedSuccess = this.getProtectedSuccess(key)

    if (protectedSuccess && this.isFailureStatus(incomingStatus)) {
      debugLog(
        `[DelayManager] 保留近期成功延迟，忽略短期失败，代理: ${name}, 组: ${group}, 状态: ${incomingStatus}`,
      )
      const update: DelayUpdate = {
        ...protectedSuccess,
        updatedAt: Date.now(),
      }
      this.cache.set(key, update)
      this.enqueueItemUpdate(key, update)
      return update
    }

    debugLog(
      `[DelayManager] 设置延迟，代理: ${name}, 组: ${group}, 延迟: ${delay}`,
    )
    const update: DelayUpdate = {
      delay,
      status: meta?.status,
      sourceUrl: meta?.sourceUrl,
      fallbackIndex: meta?.fallbackIndex,
      error: meta?.error,
      elapsed: meta?.elapsed,
      updatedAt: Date.now(),
    }

    this.cache.set(key, update)
    if (this.getDelayStatus(update.delay) === 'ok') {
      this.successCache.set(key, update)
    }

    this.enqueueItemUpdate(key, update)

    return update
  }

  private enqueueItemUpdate(key: string, update: DelayUpdate) {
    const queue = this.pendingItemUpdates.get(key)
    if (queue) {
      queue.push(update)
    } else {
      this.pendingItemUpdates.set(key, [update])
    }
    this.scheduleItemFlush()
  }

  private getProtectedSuccess(key: string) {
    const entry = this.successCache.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.updatedAt > SUCCESS_PROTECTION_TTL) {
      this.successCache.delete(key)
      return undefined
    }

    return entry
  }

  private isFailureStatus(status: DelayStatus) {
    return [
      'timeout',
      'dns-error',
      'tls-error',
      'probe-blocked',
      'network-error',
      'error',
    ].includes(status)
  }

  getDelayUpdate(name: string, group: string) {
    const key = hashKey(name, group)
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.updatedAt > CACHE_TTL) {
      this.cache.delete(key)
      return undefined
    }

    return { ...entry }
  }

  getDelay(name: string, group: string) {
    const update = this.getDelayUpdate(name, group)
    return update ? update.delay : -1
  }

  getDelayStatus(delay: number, timeout = 10000): DelayStatus {
    if (delay === -2) return 'testing'
    if (delay < 0) return 'idle'
    if (delay === DELAY_DNS_ERROR_SENTINEL) return 'dns-error'
    if (delay === DELAY_TLS_ERROR_SENTINEL) return 'tls-error'
    if (delay === DELAY_PROBE_BLOCKED_SENTINEL) return 'probe-blocked'
    if (delay === DELAY_NETWORK_ERROR_SENTINEL) return 'network-error'
    if (delay >= DELAY_GENERIC_ERROR_SENTINEL) return 'error'
    if (delay === 0 || (delay >= timeout && delay <= 1e5)) return 'timeout'
    return 'ok'
  }

  isTimeoutDelay(delay: number, timeout = 10000) {
    return this.getDelayStatus(delay, timeout) === 'timeout'
  }

  isErrorDelay(delay: number) {
    return [
      'dns-error',
      'tls-error',
      'probe-blocked',
      'network-error',
      'error',
    ].includes(this.getDelayStatus(delay))
  }

  private classifyError(error: unknown): DelayStatus {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

    if (
      message.includes('dns') ||
      message.includes('resolve') ||
      message.includes('no such host') ||
      message.includes('lookup')
    ) {
      return 'dns-error'
    }

    if (
      message.includes('tls') ||
      message.includes('certificate') ||
      message.includes('handshake') ||
      message.includes('x509')
    ) {
      return 'tls-error'
    }

    if (
      message.includes('forbidden') ||
      message.includes('blocked') ||
      message.includes('eof') ||
      message.includes('context canceled') ||
      message.includes('proxy connect failed')
    ) {
      return 'probe-blocked'
    }

    if (
      message.includes('timeout') ||
      message.includes('deadline exceeded') ||
      message.includes('timed out')
    ) {
      return 'timeout'
    }

    if (
      message.includes('reset') ||
      message.includes('refused') ||
      message.includes('unreachable') ||
      message.includes('network')
    ) {
      return 'network-error'
    }

    return 'error'
  }

  private statusToDelay(status: DelayStatus, timeout = 10000) {
    switch (status) {
      case 'timeout':
        return Math.max(timeout, DELAY_TIMEOUT_SENTINEL)
      case 'dns-error':
        return DELAY_DNS_ERROR_SENTINEL
      case 'tls-error':
        return DELAY_TLS_ERROR_SENTINEL
      case 'probe-blocked':
        return DELAY_PROBE_BLOCKED_SENTINEL
      case 'network-error':
        return DELAY_NETWORK_ERROR_SENTINEL
      case 'error':
        return DELAY_GENERIC_ERROR_SENTINEL
      default:
        return DELAY_GENERIC_ERROR_SENTINEL
    }
  }

  /// 暂时修复provider的节点延迟排序的问题
  getDelayFix(proxy: IProxyItem, group: string) {
    const update = this.getDelayUpdate(proxy.name, group)
    if (update && (update.delay >= 0 || update.delay === -2)) {
      return update.delay
    }

    // 添加 history 属性的安全检查
    if (proxy.history && proxy.history.length > 0) {
      // 0ms以error显示
      return proxy.history[proxy.history.length - 1].delay || 1e6
    }
    return -1
  }

  async checkDelay(
    name: string,
    group: string,
    timeout: number,
  ): Promise<DelayUpdate> {
    debugLog(
      `[DelayManager] 开始测试延迟，代理: ${name}, 组: ${group}, 超时: ${timeout}ms`,
    )

    // 先将状态设置为测试中
    this.setDelay(name, group, -2, { status: 'testing' })

    const startTime = Date.now()
    const urls = this.getUrlCandidates(group)
    const perProbeTimeout = Math.max(
      3000,
      Math.floor(timeout / Math.min(urls.length, 2)),
    )

    let lastFailure: {
      status: DelayStatus
      sourceUrl: string
      error?: string
      fallbackIndex: number
    } | null = null

    try {
      debugLog(
        `[DelayManager] 调用API测试延迟，代理: ${name}, URLs: ${urls.join(', ')}`,
      )
      // #region debug-point A:delay-start
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'company-network-timeout',
          runId: 'pre-fix',
          hypothesisId: 'A',
          location: 'src/services/delay.ts:218',
          msg: '[DEBUG] delay check start',
          data: { name, group, timeout, urls, perProbeTimeout },
          ts: Date.now(),
        }),
      }).catch(() => {})
      // #endregion

      for (const [fallbackIndex, url] of urls.entries()) {
        try {
          const timeoutPromise = new Promise<ProxyDelay>((resolve) => {
            setTimeout(
              () => resolve({ delay: this.statusToDelay('timeout', perProbeTimeout) }),
              perProbeTimeout,
            )
          })

          const result = await Promise.race([
            delayProxyByName(name, url, perProbeTimeout),
            timeoutPromise,
          ])

          const delay = result.delay
          const elapsed = Date.now() - startTime
          const status = this.getDelayStatus(delay, perProbeTimeout)

          if (status === 'ok') {
            if (elapsed < 500) {
              await new Promise((resolve) => setTimeout(resolve, 500 - elapsed))
            }

            debugLog(
              `[DelayManager] 延迟测试完成，代理: ${name}, URL: ${url}, 结果: ${delay}ms`,
            )
            // #region debug-point B:delay-result
            fetch('http://127.0.0.1:7777/event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: 'company-network-timeout',
                runId: 'pre-fix',
                hypothesisId: 'B',
                location: 'src/services/delay.ts:240',
                msg: '[DEBUG] delay check result',
                data: {
                  name,
                  group,
                  timeout,
                  url,
                  fallbackIndex,
                  delay,
                  elapsed,
                  status,
                },
                ts: Date.now(),
              }),
            }).catch(() => {})
            // #endregion

            return this.setDelay(name, group, delay, {
              status,
              sourceUrl: url,
              fallbackIndex,
              elapsed,
            })
          }

          lastFailure = { status, sourceUrl: url, fallbackIndex }
        } catch (error) {
          lastFailure = {
            status: this.classifyError(error),
            sourceUrl: url,
            fallbackIndex,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      }

      const elapsed = Date.now() - startTime
      const failedStatus = lastFailure?.status || 'timeout'
      const failedUrl = lastFailure?.sourceUrl || urls[0]
      const failedDelay = this.statusToDelay(failedStatus, timeout)

      // #region debug-point B:delay-result
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'company-network-timeout',
          runId: 'pre-fix',
          hypothesisId: 'B',
          location: 'src/services/delay.ts:286',
          msg: '[DEBUG] delay check failed after fallback',
          data: {
            name,
            group,
            timeout,
            urls,
            delay: failedDelay,
            elapsed,
            status: failedStatus,
            sourceUrl: failedUrl,
            fallbackIndex: lastFailure?.fallbackIndex ?? 0,
            error: lastFailure?.error,
          },
          ts: Date.now(),
        }),
      }).catch(() => {})
      // #endregion

      return this.setDelay(name, group, failedDelay, {
        status: failedStatus,
        sourceUrl: failedUrl,
        fallbackIndex: lastFailure?.fallbackIndex,
        error: lastFailure?.error,
        elapsed,
      })
    } catch (error) {
      // 确保至少显示500ms的加载动画
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.error(`[DelayManager] 延迟测试出错，代理: ${name}`, error)
      const status = this.classifyError(error)
      const delay = this.statusToDelay(status, timeout)
      const elapsed = Date.now() - startTime
      // #region debug-point E:delay-error
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'company-network-timeout',
          runId: 'pre-fix',
          hypothesisId: 'E',
          location: 'src/services/delay.ts:256',
          msg: '[DEBUG] delay check error',
          data: {
            name,
            group,
            timeout,
            status,
            error:
              error instanceof Error ? error.message : String(error),
            elapsed,
          },
          ts: Date.now(),
        }),
      }).catch(() => {})
      // #endregion

      return this.setDelay(name, group, delay, {
        status,
        error: error instanceof Error ? error.message : String(error),
        elapsed,
      })
    }
  }

  async checkListDelay(
    nameList: string[],
    group: string,
    timeout: number,
    concurrency = 36,
  ) {
    debugLog(
      `[DelayManager] 批量测试延迟开始，组: ${group}, 数量: ${nameList.length}, 并发数: ${concurrency}`,
    )
    const names = nameList.filter(Boolean)
    // 设置正在延迟测试中
    names.forEach((name) => this.setDelay(name, group, -2))

    let index = 0
    const startTime = Date.now()
    const listener = this.groupListenerMap.get(group)

    const help = async (): Promise<void> => {
      const currName = names[index++]
      if (!currName) return

      try {
        // 确保API调用前状态为测试中
        this.setDelay(currName, group, -2)

        // 添加一些随机延迟，避免所有请求同时发出和返回
        if (index > 1) {
          // 第一个不延迟，保持响应性
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 200),
          )
        }

        await this.checkDelay(currName, group, timeout)
        if (listener) {
          this.queueGroupNotification(group)
        }
      } catch (error) {
        console.error(
          `[DelayManager] 批量测试单个代理出错，代理: ${currName}`,
          error,
        )
        // 设置为错误状态
        const status = this.classifyError(error)
        this.setDelay(currName, group, this.statusToDelay(status, timeout), {
          status,
          error: error instanceof Error ? error.message : String(error),
        })
      }

      return help()
    }

    // 限制并发数，避免发送太多请求
    const actualConcurrency = Math.min(concurrency, names.length, 10)
    debugLog(`[DelayManager] 实际并发数: ${actualConcurrency}`)

    const promiseList: Promise<void>[] = []
    for (let i = 0; i < actualConcurrency; i++) {
      promiseList.push(help())
    }

    await Promise.all(promiseList)
    const totalTime = Date.now() - startTime
    debugLog(
      `[DelayManager] 批量测试延迟完成，组: ${group}, 总耗时: ${totalTime}ms`,
    )
  }

  formatDelay(delay: number, timeout = 10000) {
    switch (this.getDelayStatus(delay, timeout)) {
      case 'idle':
        return '-'
      case 'testing':
        return 'testing'
      case 'timeout':
        return 'Timeout'
      case 'dns-error':
        return 'DNS'
      case 'tls-error':
        return 'TLS'
      case 'probe-blocked':
        return 'Blocked'
      case 'network-error':
        return 'Network'
      case 'error':
        return 'Error'
      default:
        return `${delay}`
    }
  }

  formatDelayColor(delay: number, timeout = 10000) {
    switch (this.getDelayStatus(delay, timeout)) {
      case 'idle':
      case 'testing':
        return ''
      case 'timeout':
      case 'dns-error':
      case 'tls-error':
      case 'probe-blocked':
      case 'network-error':
      case 'error':
        return 'error.main'
      default:
        if (delay >= 10000) return 'error.main'
        if (delay >= 400) return 'warning.main'
        if (delay >= 250) return 'primary.main'
        return 'success.main'
    }
  }
}

export default new DelayManager()
