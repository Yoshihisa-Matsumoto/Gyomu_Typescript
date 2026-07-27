import { Tooltip as MUIToolTip } from '@mui/material'
import type { TooltipProps } from '@mui/material'

/**
 * A wrapper component for MUI Tooltip providing consistent project-specific styling and configuration.
 *
 * @param children The element to which the tooltip will be attached.
 *
 * @param props Additional props to be passed to the underlying MUI Tooltip component.
 *
 * @returns The rendered MUI Tooltip component.
 */
export const Tooltip = ({ children, ...props }: TooltipProps) => {
  return <MUIToolTip {...props}>{children}</MUIToolTip>
}
