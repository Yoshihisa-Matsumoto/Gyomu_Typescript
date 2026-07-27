import { TextField as MUITextField, Tooltip } from '@mui/material'
import type { TextFieldProps as MUITextFieldProps } from '@mui/material'

type TextFieldProps = MUITextFieldProps & {
  tooltip?: string
  readOnly?: boolean
}

/**
 * A wrapper around the Material UI TextField component, providing optional read-only state and tooltip support.
 *
 * @param readOnly If true, the underlying input component is set to read-only.
 *
 * @param tooltip Optional tooltip content to display when hovering over the text field.
 *
 * @returns A React node rendering a TextField, optionally wrapped in a Tooltip.
 */
export const TextField = ({ readOnly, tooltip, ...props }: TextFieldProps) => {
  const tmpProps: { [index: string]: unknown } = {}
  if (readOnly != undefined && readOnly) {
    tmpProps['input'] = { readOnly: true }
  }
  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <MUITextField {...props} slotProps={tmpProps} />
      </Tooltip>
    )
  }
  return <MUITextField {...props} slotProps={tmpProps} />
}
