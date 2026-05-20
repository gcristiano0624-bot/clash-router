import getSystem from '@/utils/get-system'
const OS = getSystem()

// default theme setting
export const defaultTheme = {
  primary_color: '#1677C8',
  secondary_color: '#1FAF9A',
  primary_text: '#0F172A',
  secondary_text: '#5B6475',
  info_color: '#1677C8',
  error_color: '#D64545',
  warning_color: '#D48B17',
  success_color: '#178F62',
  background_color: '#EFF3F8',
  font_family: `-apple-system, BlinkMacSystemFont,"Microsoft YaHei UI", "Microsoft YaHei", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji"${
    OS === 'windows' ? ', twemoji mozilla' : ''
  }`,
}

// dark mode
export const defaultDarkTheme = {
  ...defaultTheme,
  primary_color: '#4BA3FF',
  secondary_color: '#33C3B0',
  primary_text: '#FFFFFF',
  background_color: '#0E1724',
  secondary_text: '#8B9BB4',
  info_color: '#4BA3FF',
  error_color: '#FF6363',
  warning_color: '#F3B24B',
  success_color: '#3DD598',
}
