import { styled, Box, Typography } from '@mui/material'
import { Rule } from 'tauri-plugin-mihomo-api'

const Item = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '7px 14px',
  color: theme.palette.text.primary,
  borderBottom: '1px solid var(--ux-border)',
  background: 'var(--ux-surface)',
  '&:hover': {
    background: 'var(--ux-accent-bg)',
  },
}))

const COLOR = [
  'primary',
  'secondary',
  'info.main',
  'warning.main',
  'success.main',
]

interface Props {
  value: Rule & { lineNo: number }
}

const parseColor = (text: string) => {
  if (text === 'REJECT' || text === 'REJECT-DROP') return 'error.main'
  if (text === 'DIRECT') return 'text.primary'

  let sum = 0
  for (let i = 0; i < text.length; i++) {
    sum += text.charCodeAt(i)
  }
  return COLOR[sum % COLOR.length]
}

const RuleItem = (props: Props) => {
  const { value } = props

  return (
    <Item>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{
          lineHeight: 2,
          minWidth: 34,
          mr: 2,
          textAlign: 'right',
          fontFamily: 'var(--ux-font-mono)',
          fontSize: 11,
        }}
      >
        {value.lineNo}
      </Typography>

      <Box sx={{ minWidth: 0, flex: 1, userSelect: 'text' }}>
        <Typography
          component="h6"
          variant="subtitle1"
          color="text.primary"
          sx={{
            fontSize: 13,
            fontWeight: 650,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value.payload || '-'}
        </Typography>

        <Typography
          component="span"
          variant="body2"
          color="text.secondary"
          sx={{
            mr: 2,
            minWidth: 110,
            display: 'inline-block',
            fontSize: 11,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {value.type}
        </Typography>

        <Typography
          component="span"
          variant="body2"
          color={parseColor(value.proxy)}
          sx={{ fontSize: 12, fontWeight: 650 }}
        >
          {value.proxy}
        </Typography>
      </Box>
    </Item>
  )
}

export default RuleItem
