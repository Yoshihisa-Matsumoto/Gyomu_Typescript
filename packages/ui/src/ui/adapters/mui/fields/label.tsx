import { Typography } from '@mui/material'
import { Tooltip } from './tooltip.js'
import type { TypographyProps } from '@mui/material'

interface LabelProps extends TypographyProps {
  label: string
  tooltip?: string
}
export const Label = ({ label, tooltip, ...props }: LabelProps) => {
  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <Typography {...props}>{label}</Typography>
      </Tooltip>
    )
  }
  return <Typography {...props}>{label}</Typography>
}
