import MUITextarea from '@mui/material/TextareaAutosize'
import type { TextareaAutosizeProps } from '@mui/material'

// interface TextAreaProp extends TextareaAutosizeProps {}
export const TextArea = ({ ...props }: TextareaAutosizeProps) => {
  const minRows = props.minRows || 10
  const maxRows = props.maxRows || 30
  return <MUITextarea {...props} minRows={minRows} maxRows={maxRows} style={{ width: '100%' }} />
}
