import { Typography } from '@mui/material'
import { Tooltip } from './tooltip.js'
import type { TypographyProps } from '@mui/material'

interface LabelProps extends TypographyProps {
  label: string
  tooltip?: string
}

/**
 * Displays a label, optionally wrapped in a tooltip.
 *
 * @param label The text or element to display as the label.
 *
 * @param tooltip Optional tooltip content to display on hover.
 *
 * @param props Additional properties passed to the underlying Typography component.
 *
 * @returns A React node representing the labeled component.
 */
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
