import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React, { ReactNode } from 'react'

import { BaseErrorBoundary } from './base-error-boundary'

interface Props {
  title?: React.ReactNode // the page title
  header?: React.ReactNode // something behind title
  contentStyle?: React.CSSProperties
  className?: string
  children?: ReactNode
  full?: boolean
}

export const BasePage: React.FC<Props> = (props) => {
  const { title, header, contentStyle, className, full, children } = props
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'
  const pageBackground = isDark
    ? 'var(--ux-bg, #0E1724)'
    : 'var(--ux-bg, var(--page-surface-color))'

  return (
    <BaseErrorBoundary>
      <div className={className ? `base-page ${className}` : 'base-page'}>
        <header data-tauri-drag-region="true" style={{ userSelect: 'none' }}>
          <Typography
            sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}
            data-tauri-drag-region="true"
          >
            {title}
          </Typography>

          {header}
        </header>

        <div
          className={full ? 'base-container no-padding' : 'base-container'}
          style={{
            backgroundColor: pageBackground,
          }}
        >
          <section
            style={{
              backgroundColor: pageBackground,
            }}
          >
            <div className="base-content" style={contentStyle}>
              {children}
            </div>
          </section>
        </div>
      </div>
    </BaseErrorBoundary>
  )
}
