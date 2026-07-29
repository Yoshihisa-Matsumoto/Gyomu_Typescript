import { styled } from '@mui/material/styles'
import { Button as MUIButton } from '@mui/material'
import type { ButtonProps as MUIButtonProps } from '@mui/material'

interface ButtonProps extends MUIButtonProps {
  label: string
}

/**
 * Adapts a standard button component using MUI's Button implementation.
 *
 * @param props The button configuration properties and label.
 *
 * @returns The rendered MUI button component.
 */
export const MuiButtonAdapter = ({ label, ...props }: ButtonProps) => {
  return (
    <MUIButton variant="contained" {...props}>
      {label}
    </MUIButton>
  )
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

/**
 * Adapts a file input button using MUI's Button component with a visually hidden file selector.
 *
 * @param props The button configuration properties, label, and file input handlers.
 *
 * @returns The rendered file input button component.
 */
export const MuiFileButtonAdapter = ({ label, ...props }: ButtonProps) => {
  return (
    <MUIButton component="label" role={undefined} variant="contained" {...props}>
      {label}
      <VisuallyHiddenInput type="file" onChange={(event) => console.log(event.target.files)} />
    </MUIButton>
  )
}
