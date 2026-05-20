import {
  alpha,
  createTheme,
  Theme as MuiTheme,
  Shadows,
  ThemeOptions,
} from '@mui/material'
import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from '@tauri-apps/api/webviewWindow'
import { Theme as TauriOsTheme } from '@tauri-apps/api/window'
import { useEffect, useMemo } from 'react'

import { useVerge } from '@/hooks/use-verge'
import { defaultDarkTheme, defaultTheme } from '@/pages/_theme'
import { useSetThemeMode, useThemeMode } from '@/services/states'

const CSS_INJECTION_SCOPE_ROOT = '[data-css-injection-root]'
const CSS_INJECTION_SCOPE_LIMIT =
  ':is(.monaco-editor .view-lines, .monaco-editor .view-line, .monaco-editor .margin, .monaco-editor .margin-view-overlays, .monaco-editor .view-overlays, .monaco-editor [class^="mtk"], .monaco-editor [class*=" mtk"])'
const TOP_LEVEL_AT_RULES = [
  '@charset',
  '@import',
  '@namespace',
  '@font-face',
  '@keyframes',
  '@counter-style',
  '@page',
  '@property',
  '@font-feature-values',
  '@color-profile',
]
let cssScopeSupport: boolean | null = null

const canUseCssScope = () => {
  if (cssScopeSupport !== null) {
    return cssScopeSupport
  }
  try {
    const testStyle = document.createElement('style')
    testStyle.textContent = '@scope (:root) { }'
    document.head.appendChild(testStyle)
    cssScopeSupport = !!testStyle.sheet?.cssRules?.length
    document.head.removeChild(testStyle)
  } catch {
    cssScopeSupport = false
  }
  return cssScopeSupport
}

const wrapCssInjectionWithScope = (css?: string) => {
  if (!css?.trim()) {
    return ''
  }
  const lowerCss = css.toLowerCase()
  const hasTopLevelOnlyRule = TOP_LEVEL_AT_RULES.some((rule) =>
    lowerCss.includes(rule),
  )
  if (hasTopLevelOnlyRule) {
    return null
  }
  const scopeRoot = CSS_INJECTION_SCOPE_ROOT
  const scopeLimit = CSS_INJECTION_SCOPE_LIMIT
  const scopedBlock = `@scope (${scopeRoot}) to (${scopeLimit}) {
${css}
}`
  return scopedBlock
}

const buildThemeOptions = (
  mode: 'light' | 'dark',
  setting: Record<string, any>,
  dt: typeof defaultTheme,
): ThemeOptions => {
  const primaryMain = setting.primary_color || dt.primary_color
  const secondaryMain = setting.secondary_color || dt.secondary_color
  const paperColor = dt.background_color
  const defaultColor = mode === 'light' ? '#F6F8FB' : '#0A1220'
  const dividerColor =
    mode === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.18)'

  return {
    breakpoints: {
      values: { xs: 0, sm: 650, md: 900, lg: 1200, xl: 1536 },
    },
    palette: {
      mode,
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
      info: { main: setting.info_color || dt.info_color },
      error: { main: setting.error_color || dt.error_color },
      warning: { main: setting.warning_color || dt.warning_color },
      success: { main: setting.success_color || dt.success_color },
      text: {
        primary: setting.primary_text || dt.primary_text,
        secondary: setting.secondary_text || dt.secondary_text,
      },
      divider: dividerColor,
      background: {
        paper: paperColor,
        default: defaultColor,
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: Array(25).fill('none') as Shadows,
    typography: {
      fontFamily: setting.font_family
        ? `${setting.font_family}, ${dt.font_family}`
        : dt.font_family,
      h6: {
        fontWeight: 700,
        fontSize: '1rem',
        letterSpacing: '-0.01em',
      },
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: defaultColor,
            color: setting.primary_text || dt.primary_text,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${dividerColor}`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingInline: 14,
          },
          contained: {
            boxShadow: 'none',
          },
          outlined: {
            borderColor:
              mode === 'light'
                ? alpha(primaryMain, 0.18)
                : alpha(primaryMain, 0.32),
            backgroundColor:
              mode === 'light'
                ? alpha(primaryMain, 0.02)
                : alpha(primaryMain, 0.05),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor:
              mode === 'light'
                ? 'rgba(255,255,255,0.82)'
                : 'rgba(15,23,42,0.52)',
          },
          notchedOutline: {
            borderColor: dividerColor,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            minHeight: 'unset',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 6px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: dividerColor,
          },
        },
      },
    },
  }
}

/**
 * custom theme
 */
export const useCustomTheme = () => {
  const appWindow: WebviewWindow = useMemo(() => getCurrentWebviewWindow(), [])
  const { verge } = useVerge()
  const { theme_mode, theme_setting } = verge ?? {}
  const mode = useThemeMode()
  const setMode = useSetThemeMode()
  const userBackgroundImage = theme_setting?.background_image || ''
  const hasUserBackground = !!userBackgroundImage

  useEffect(() => {
    if (theme_mode === 'light' || theme_mode === 'dark') {
      setMode(theme_mode)
    }
  }, [theme_mode, setMode])

  useEffect(() => {
    if (theme_mode !== 'system') {
      return
    }

    let isMounted = true

    const timerId = setTimeout(() => {
      if (!isMounted) return
      appWindow
        .theme()
        .then((systemTheme) => {
          if (isMounted && systemTheme) {
            setMode(systemTheme)
          }
        })
        .catch((err) => {
          console.error('Failed to get initial system theme:', err)
        })
    }, 0)

    const unlistenPromise = appWindow.onThemeChanged(({ payload }) => {
      if (isMounted) {
        setMode(payload)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timerId)
      unlistenPromise
        .then((unlistenFn) => {
          if (typeof unlistenFn === 'function') {
            unlistenFn()
          }
        })
        .catch((err) => {
          console.error('Failed to unlisten from theme changes:', err)
        })
    }
  }, [theme_mode, appWindow, setMode])

  useEffect(() => {
    if (theme_mode === undefined) {
      return
    }

    if (theme_mode === 'system') {
      appWindow.setTheme(null).catch((err) => {
        console.error(
          'Failed to set window theme to follow system (setTheme(null)):',
          err,
        )
      })
    } else if (mode) {
      appWindow.setTheme(mode as TauriOsTheme).catch((err) => {
        console.error(`Failed to set window theme to ${mode}:`, err)
      })
    }
  }, [mode, appWindow, theme_mode])

  const theme = useMemo(() => {
    const setting = theme_setting || {}
    const dt = mode === 'light' ? defaultTheme : defaultDarkTheme
    let muiTheme: MuiTheme

    try {
      muiTheme = createTheme(buildThemeOptions(mode, setting, dt))
    } catch (e) {
      console.error('Error creating MUI theme, falling back to defaults:', e)
      muiTheme = createTheme(buildThemeOptions(mode, {}, dt))
    }

    const rootEle = document.documentElement
    if (rootEle) {
      const backgroundColor = mode === 'light' ? '#F6F8FB' : '#0A1220'
      const pageSurfaceColor = mode === 'light' ? '#EFF3F8' : dt.background_color
      const selectColor = mode === 'light' ? '#E7EEF8' : '#172334'
      const scrollColor = mode === 'light' ? '#AAB6C8' : '#52627A'
      const dividerColor =
        mode === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.18)'
      rootEle.style.setProperty('--divider-color', dividerColor)
      rootEle.style.setProperty('--background-color', backgroundColor)
      rootEle.style.setProperty('--page-surface-color', pageSurfaceColor)
      rootEle.style.setProperty('--selection-color', selectColor)
      rootEle.style.setProperty('--scroller-color', scrollColor)
      rootEle.style.setProperty('--primary-main', muiTheme.palette.primary.main)
      rootEle.style.setProperty(
        '--background-color-alpha',
        alpha(muiTheme.palette.primary.main, 0.1),
      )
      rootEle.style.setProperty(
        '--window-border-color',
        mode === 'light' ? '#D7DFEA' : '#162033',
      )
      rootEle.style.setProperty(
        '--scrollbar-bg',
        mode === 'light' ? '#E8EEF5' : '#111C2D',
      )
      rootEle.style.setProperty(
        '--scrollbar-thumb',
        mode === 'light' ? '#B6C2D2' : '#415066',
      )
      rootEle.style.setProperty(
        '--user-background-image',
        hasUserBackground ? `url('${userBackgroundImage}')` : 'none',
      )
      rootEle.style.setProperty(
        '--background-blend-mode',
        setting.background_blend_mode || 'normal',
      )
      rootEle.style.setProperty(
        '--background-opacity',
        setting.background_opacity !== undefined
          ? String(setting.background_opacity)
          : '1',
      )
      rootEle.setAttribute('data-css-injection-root', 'true')
    }

    let styleElement = document.querySelector('style#verge-theme')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'verge-theme'
      document.head.appendChild(styleElement!)
    }

    if (styleElement) {
      let scopedCss: string | null = null
      if (canUseCssScope() && setting.css_injection) {
        scopedCss = wrapCssInjectionWithScope(setting.css_injection)
      }
      const effectiveInjectedCss = scopedCss ?? setting.css_injection ?? ''
      const globalStyles = `
        /* 修复滚动条样式 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background-color: var(--scrollbar-bg);
        }
        ::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-thumb);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: ${mode === 'light' ? '#a1a1a1' : '#666666'};
        }

        /* 背景图处理 */
        body {
          background-color: var(--background-color);
          ${
            hasUserBackground
              ? `
            background-image: var(--user-background-image);
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-blend-mode: var(--background-blend-mode);
            opacity: var(--background-opacity);
          `
              : ''
          }
        }

        /* 修复可能的白色边框 */
        .MuiPaper-root {
          border-color: var(--window-border-color) !important;
        }

        /* 确保模态框和对话框也使用暗色主题 */
        .MuiDialog-paper {
          background-color: ${mode === 'light' ? '#ffffff' : '#0E1724'} !important;
        }

        .MuiButton-root,
        .MuiIconButton-root,
        .MuiListItemButton-root,
        .MuiChip-root,
        .MuiOutlinedInput-root {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .Mui-focusVisible {
          outline: 2px solid ${alpha(muiTheme.palette.primary.main, 0.3)} !important;
          outline-offset: 1px;
        }
      `

      styleElement.innerHTML = effectiveInjectedCss + globalStyles
    }

    return muiTheme
  }, [mode, theme_setting, userBackgroundImage, hasUserBackground])

  useEffect(() => {
    const id = setTimeout(() => {
      const dom = document.querySelector('#Gradient2')
      if (dom) {
        dom.innerHTML = `
        <stop offset="0%" stop-color="${theme.palette.primary.main}" />
        <stop offset="80%" stop-color="${theme.palette.primary.dark}" />
        <stop offset="100%" stop-color="${theme.palette.primary.dark}" />
        `
      }
    }, 0)
    return () => clearTimeout(id)
  }, [theme.palette.primary.main, theme.palette.primary.dark])

  return { theme }
}
