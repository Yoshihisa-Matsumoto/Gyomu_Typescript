// import { CheckBox as MUICheckbox} from '@mui/icons-material';
import MUICheckbox from '@mui/material/Checkbox'
import { Tooltip } from './tooltip'
import type { CheckboxProps as MUICheckboxProps } from '@mui/material/Checkbox'

interface CheckBoxProps extends MUICheckboxProps {
  tooltip?: string
}
export const CheckBox = ({ readOnly, checked, disabled, tooltip, ...props }: CheckBoxProps) => {
  const labelProp = {
    inputprops: {},
  }
  const tmpProps: { [index: string]: unknown } = labelProp.inputprops
  if (readOnly != undefined) {
    tmpProps['readonly'] = readOnly
  }
  if (checked != undefined) {
    tmpProps['checked'] = checked
  }
  if (disabled != undefined) tmpProps['disabled'] = disabled
  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <MUICheckbox {...props} {...labelProp} />
      </Tooltip>
    )
  }
  return <MUICheckbox {...props} {...labelProp} />
}
