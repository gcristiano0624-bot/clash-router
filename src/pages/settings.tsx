import { GitHub, HelpOutlineRounded, Telegram } from '@mui/icons-material'
import { Box, ButtonGroup, IconButton, Grid } from '@mui/material'
import { useLockFn } from 'ahooks'
import { useTranslation } from 'react-i18next'

import { BasePage } from '@/components/base'
import SettingClash from '@/components/setting/setting-clash'
import SettingSystem from '@/components/setting/setting-system'
import SettingVergeAdvanced from '@/components/setting/setting-verge-advanced'
import SettingVergeBasic from '@/components/setting/setting-verge-basic'
import { openWebUrl } from '@/services/cmds'
import { showNotice } from '@/services/notice-service'
import { useThemeMode } from '@/services/states'

const SettingPage = () => {
  const { t } = useTranslation()

  const onError = (err: any) => {
    showNotice.error(err)
  }

  const toGithubRepo = useLockFn(() => {
    return openWebUrl('https://github.com/gcristiano0624-bot/clash-router')
  })

  const toGithubDoc = useLockFn(() => {
    return openWebUrl('https://github.com/gcristiano0624-bot/clash-router/blob/main/docs/Project.md')
  })

  const toTelegramChannel = useLockFn(() => {
    return openWebUrl('https://t.me/clash_verge_re')
  })

  const mode = useThemeMode()
  const isDark = mode === 'light' ? false : true

  return (
    <BasePage
      className="ux-page-settings"
      title={t('settings.page.title')}
      header={
        <ButtonGroup
          variant="contained"
          aria-label="Basic button group"
          sx={(theme) => ({
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.82)'
                : 'rgba(19,32,51,0.8)',
          })}
        >
          <IconButton
            size="medium"
            color="inherit"
            title={t('settings.page.actions.manual')}
            onClick={toGithubDoc}
          >
            <HelpOutlineRounded fontSize="inherit" />
          </IconButton>
          <IconButton
            size="medium"
            color="inherit"
            title={t('settings.page.actions.telegram')}
            onClick={toTelegramChannel}
          >
            <Telegram fontSize="inherit" />
          </IconButton>

          <IconButton
            size="medium"
            color="inherit"
            title={t('settings.page.actions.github')}
            onClick={toGithubRepo}
          >
            <GitHub fontSize="inherit" />
          </IconButton>
        </ButtonGroup>
      }
    >
      <Grid container spacing={1.5} columns={{ xs: 6, sm: 6, md: 12 }}>
        <Grid size={6}>
          <Box
            sx={(theme) => ({
              borderRadius: 4,
              marginBottom: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? '#132033' : '#ffffff',
            })}
          >
            <SettingSystem onError={onError} />
          </Box>
          <Box
            sx={(theme) => ({
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? '#132033' : '#ffffff',
            })}
          >
            <SettingClash onError={onError} />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box
            sx={(theme) => ({
              borderRadius: 4,
              marginBottom: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? '#132033' : '#ffffff',
            })}
          >
            <SettingVergeBasic onError={onError} />
          </Box>
          <Box
            sx={(theme) => ({
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? '#132033' : '#ffffff',
            })}
          >
            <SettingVergeAdvanced onError={onError} />
          </Box>
        </Grid>
      </Grid>
    </BasePage>
  )
}

export default SettingPage
