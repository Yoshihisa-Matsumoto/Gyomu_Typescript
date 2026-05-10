import { Tooltip as MUIToolTip } from '@mui/material'
import type { TooltipProps } from '@mui/material'

export const Tooltip = ({ children, ...props }: TooltipProps) => {
  return <MUIToolTip {...props}>{children}</MUIToolTip>
}
