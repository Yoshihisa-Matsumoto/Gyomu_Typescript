import { TextField as MUITextField, Tooltip } from '@mui/material'
import type { TextFieldProps as MUITextFieldProps } from '@mui/material'

type TextFieldProps = MUITextFieldProps & {
  tooltip?: string
  readOnly?: boolean
}

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
