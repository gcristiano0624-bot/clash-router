import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Box,
  List,
  Menu,
  MenuItem,
  Paper,
  SvgIcon,
  ThemeProvider,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'

import iconDark from '@/assets/image/icon_dark.svg?react'
import iconLight from '@/assets/image/icon_light.svg?react'
import LogoSvg from '@/assets/image/logo.svg?react'
import { BaseErrorBoundary } from '@/components/base'
import { LayoutItem } from '@/components/layout/layout-item'
import { LayoutTraffic } from '@/components/layout/layout-traffic'
import { NoticeManager } from '@/components/layout/notice-manager'
import { UpdateButton } from '@/components/layout/update-button'
import { WindowControls } from '@/components/layout/window-controller'
import { useI18n } from '@/hooks/use-i18n'
import { useVerge } from '@/hooks/use-verge'
import { useWindowDecorations } from '@/hooks/use-window'
import { useThemeMode } from '@/services/states'
import getSystem from '@/utils/get-system'

import {
  useCustomTheme,
  useLayoutEvents,
  useLoadingOverlay,
  useNavMenuOrder,
} from './_layout/hooks'
import { handleNoticeMessage } from './_layout/utils'
import { navItems } from './_routers'
import LogsPage from './logs'

import 'dayjs/locale/ru'
import 'dayjs/locale/zh-cn'

export const portableFlag = false

type NavItem = (typeof navItems)[number]

type MenuContextPosition = { top: number; left: number }
type UxThemeName = 'macos' | 'dark' | 'warm'

const UX_THEME_STORAGE_KEY = 'clash-router-ux-theme'
const UX_THEMES: Array<{
  name: UxThemeName
  label: string
  title: string
}> = [
  { name: 'macos', label: 'macOS', title: 'macOS 原生' },
  { name: 'dark', label: 'Dark', title: '深色仪表盘' },
  { name: 'warm', label: 'Warm', title: '暖色杂志' },
]

const getStoredUxTheme = (): UxThemeName => {
  try {
    const saved = localStorage.getItem(UX_THEME_STORAGE_KEY)
    if (saved === 'macos' || saved === 'dark' || saved === 'warm') {
      return saved
    }
  } catch {
    // localStorage can be unavailable in restricted webviews.
  }
  return 'macos'
}

interface SortableNavMenuItemProps {
  item: NavItem
  label: string
}

const SortableNavMenuItem = ({ item, label }: SortableNavMenuItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.path,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    style.zIndex = 100
  }

  return (
    <LayoutItem
      to={item.path}
      icon={item.icon}
      sortable={{
        setNodeRef,
        attributes,
        listeners,
        style,
        isDragging,
      }}
    >
      {label}
    </LayoutItem>
  )
}

dayjs.extend(relativeTime)

const OS = getSystem()

const Layout = () => {
  const mode = useThemeMode()
  const isDark = mode !== 'light'
  const { t } = useTranslation()
  const { theme } = useCustomTheme()
  const { verge, mutateVerge, patchVerge } = useVerge()
  const { language } = verge ?? {}
  const navCollapsed = verge?.collapse_navbar ?? false
  const { switchLanguage } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isLogsPage = pathname === '/logs'
  const logsPageMountedRef = useRef(false)
  if (isLogsPage) logsPageMountedRef.current = true
  const themeReady = useMemo(() => Boolean(theme), [theme])

  const [menuUnlocked, setMenuUnlocked] = useState(false)
  const [uxTheme, setUxTheme] = useState<UxThemeName>(getStoredUxTheme)
  const [menuContextPosition, setMenuContextPosition] =
    useState<MenuContextPosition | null>(null)

  const windowControlsRef = useRef<any>(null)
  const { decorated } = useWindowDecorations()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleMenuOrderOptimisticUpdate = useCallback(
    (order: string[]) => {
      mutateVerge(
        (prev) => (prev ? { ...prev, menu_order: order } : prev),
        false,
      )
    },
    [mutateVerge],
  )

  const handleMenuOrderPersist = useCallback(
    (order: string[]) => patchVerge({ menu_order: order }),
    [patchVerge],
  )

  const {
    menuOrder,
    navItemMap,
    handleMenuDragEnd,
    isDefaultOrder,
    resetMenuOrder,
  } = useNavMenuOrder({
    enabled: menuUnlocked,
    items: navItems,
    storedOrder: verge?.menu_order,
    onOptimisticUpdate: handleMenuOrderOptimisticUpdate,
    onPersist: handleMenuOrderPersist,
  })

  const handleMenuContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setMenuContextPosition({ top: event.clientY, left: event.clientX })
    },
    [],
  )

  const handleMenuContextClose = useCallback(() => {
    setMenuContextPosition(null)
  }, [])

  const handleResetMenuOrder = useCallback(() => {
    setMenuContextPosition(null)
    void resetMenuOrder()
  }, [resetMenuOrder])

  const handleUnlockMenu = useCallback(() => {
    setMenuUnlocked(true)
    setMenuContextPosition(null)
  }, [])

  const handleLockMenu = useCallback(() => {
    setMenuUnlocked(false)
    setMenuContextPosition(null)
  }, [])

  const handleToggleNavCollapsed = useCallback(() => {
    setMenuContextPosition(null)
    void patchVerge({ collapse_navbar: !navCollapsed })
  }, [navCollapsed, patchVerge])

  const handleUxThemeChange = useCallback((themeName: UxThemeName) => {
    setUxTheme(themeName)
    try {
      localStorage.setItem(UX_THEME_STORAGE_KEY, themeName)
    } catch {
      // Non-fatal: the UI still switches for the current session.
    }
  }, [])

  const customTitlebar = useMemo(
    () =>
      !decorated ? (
        <div className="the_titlebar">
          <div
            className="the_titlebar-drag-region"
            data-tauri-drag-region="true"
          />
          <WindowControls ref={windowControlsRef} />
        </div>
      ) : null,
    [decorated],
  )

  useLoadingOverlay(themeReady)

  const handleNotice = useCallback(
    (payload: [string, string]) => {
      const [status, msg] = payload
      try {
        handleNoticeMessage(status, msg, t, navigate)
      } catch (error) {
        console.error('[通知处理] 失败:', error)
      }
    },
    [t, navigate],
  )

  useLayoutEvents(handleNotice)

  useEffect(() => {
    if (language) {
      dayjs.locale(language === 'zh' ? 'zh-cn' : language)
      switchLanguage(language)
    }
  }, [language, switchLanguage])

  if (!themeReady) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: mode === 'light' ? '#fff' : '#181a1b',
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: mode === 'light' ? '#333' : '#fff',
        }}
      ></div>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      {/* 左侧底部窗口控制按钮 */}
      <NoticeManager position={verge?.notice_position} />
      <div
        style={{
          animation: 'fadeIn 0.5s',
          WebkitAnimation: 'fadeIn 0.5s',
        }}
      />
      <style>
        {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}
      </style>
      <Paper
        square
        elevation={0}
        className={`${OS} layout ux-theme-${uxTheme}${navCollapsed ? ' layout--nav-collapsed' : ''}`}
        style={{
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          backgroundColor: 'var(--background-color)',
        }}
        onContextMenu={(e) => {
          if (
            OS === 'windows' &&
            !['input', 'textarea'].includes(
              e.currentTarget.tagName.toLowerCase(),
            ) &&
            !e.currentTarget.isContentEditable
          ) {
            e.preventDefault()
          }
        }}
        sx={[
          ({ palette }) => ({ bgcolor: palette.background.paper }),
          OS === 'linux'
            ? {
                borderRadius: '8px',
                width: '100vw',
                height: '100vh',
              }
            : {},
        ]}
      >
        {/* Custom titlebar - rendered only when decorated is false, memoized for performance */}
        {customTitlebar}

        <div className="layout-content">
          <div className="layout-content__left">
            <div className="the-logo" data-tauri-drag-region="false">
              <div
                className="the-logo__brand"
                data-tauri-drag-region="true"
              >
                <span className="the-logo__mark">
                  <SvgIcon
                    component={isDark ? iconDark : iconLight}
                    inheritViewBox
                  />
                </span>
                <span className="the-logo__text">
                  <Typography component="span" className="the-logo__title">
                    Clash Router
                  </Typography>
                  <Typography component="span" className="the-logo__version">
                    v2.5.1-router.1
                  </Typography>
                </span>
                <LogoSvg className="the-logo__wordmark" />
              </div>
              <UpdateButton className="the-newbtn" />
            </div>

            {menuUnlocked && (
              <Box
                sx={(theme) => ({
                  px: 1.5,
                  py: 0.75,
                  mx: 'auto',
                  mb: 1.25,
                  maxWidth: 250,
                  borderRadius: 2.5,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                  border: `1px solid ${theme.palette.warning.main}`,
                  color: theme.palette.warning.main,
                  bgcolor:
                    theme.palette.mode === 'light'
                      ? 'rgba(212, 139, 23, 0.08)'
                      : 'rgba(243, 178, 75, 0.08)',
                })}
              >
                {t('layout.components.navigation.menu.reorderMode')}
              </Box>
            )}

            {menuUnlocked ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMenuDragEnd}
              >
                <SortableContext items={menuOrder}>
                  <List
                    className="the-menu"
                    onContextMenu={handleMenuContextMenu}
                  >
                    {menuOrder.map((path) => {
                      const item = navItemMap.get(path)
                      if (!item) {
                        return null
                      }
                      return (
                        <SortableNavMenuItem
                          key={item.path}
                          item={item}
                          label={t(item.label)}
                        />
                      )
                    })}
                  </List>
                </SortableContext>
              </DndContext>
            ) : (
              <List className="the-menu" onContextMenu={handleMenuContextMenu}>
                {menuOrder.map((path) => {
                  const item = navItemMap.get(path)
                  if (!item) {
                    return null
                  }
                  return (
                    <LayoutItem key={item.path} to={item.path} icon={item.icon}>
                      {t(item.label)}
                    </LayoutItem>
                  )
                })}
              </List>
            )}

            <Menu
              open={Boolean(menuContextPosition)}
              onClose={handleMenuContextClose}
              anchorReference="anchorPosition"
              anchorPosition={
                menuContextPosition
                  ? {
                      top: menuContextPosition.top,
                      left: menuContextPosition.left,
                    }
                  : undefined
              }
              transitionDuration={200}
              slotProps={{
                list: {
                  sx: { py: 0.5 },
                },
              }}
            >
              <MenuItem onClick={handleToggleNavCollapsed} dense>
                {navCollapsed
                  ? t('layout.components.navigation.menu.expandNavBar')
                  : t('layout.components.navigation.menu.collapseNavBar')}
              </MenuItem>
              <MenuItem
                onClick={menuUnlocked ? handleLockMenu : handleUnlockMenu}
                dense
              >
                {menuUnlocked
                  ? t('layout.components.navigation.menu.lock')
                  : t('layout.components.navigation.menu.unlock')}
              </MenuItem>
              <MenuItem
                onClick={handleResetMenuOrder}
                dense
                disabled={isDefaultOrder}
              >
                {t('layout.components.navigation.menu.restoreDefaultOrder')}
              </MenuItem>
            </Menu>

            <div className="the-traffic">
              <div className="the-theme-switcher">
                {UX_THEMES.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`the-theme-switcher__swatch the-theme-switcher__swatch--${item.name}${
                      uxTheme === item.name ? ' is-active' : ''
                    }`}
                    title={item.title}
                    aria-label={item.title}
                    onClick={() => handleUxThemeChange(item.name)}
                  />
                ))}
                <span className="the-theme-switcher__label">
                  {UX_THEMES.find((item) => item.name === uxTheme)?.label}
                </span>
              </div>
              <LayoutTraffic />
            </div>
          </div>

          <div className="layout-content__right">
            <div className="the-bar"></div>
            <div className="the-content">
              <BaseErrorBoundary>
                <Outlet />
              </BaseErrorBoundary>
              {logsPageMountedRef.current && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: isLogsPage ? undefined : 'none',
                  }}
                >
                  <LogsPage />
                </div>
              )}
            </div>
          </div>
        </div>
      </Paper>
    </ThemeProvider>
  )
}

export default Layout
