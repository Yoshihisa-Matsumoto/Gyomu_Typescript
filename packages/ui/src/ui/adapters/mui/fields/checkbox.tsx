// import { CheckBox as MUICheckbox} from '@mui/icons-material';
import MUICheckbox from '@mui/material/Checkbox'
import { Tooltip } from './tooltip'
import type { CheckboxProps as MUICheckboxProps } from '@mui/material/Checkbox'

interface CheckBoxProps extends MUICheckboxProps {
  tooltip?: string
}

/**
 * A wrapper around the Material UI Checkbox component, adding support for read-only state and an optional tooltip.
 *
 * @param readOnly Whether the checkbox is in read-only mode.
 *
 * @param checked The controlled checked state of the checkbox.
 *
 * @param disabled If true, the checkbox is disabled.
 *
 * @param tooltip Optional tooltip content to display when hovering over the checkbox.
 *
 * @returns Returns a JSX element representing either the checkbox or the checkbox wrapped in a tooltip.
 */
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
