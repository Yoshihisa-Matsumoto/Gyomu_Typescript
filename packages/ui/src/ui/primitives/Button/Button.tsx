// components/Button/Button.tsx

import { MuiButtonAdapter, MuiFileButtonAdapter } from '../../adapters/mui/Button'

/**
 * Properties for the Button component.
 */
export interface ButtonProps {
  /**
   * The display text for the button.
   */
  label: string

  /**
   * Optional callback function triggered when the button is clicked.
   */
  onClick?: () => void
}

/**
 * A wrapper component for the MUI button primitive.
 *
 * @param props Component properties.
 */
export const Button = (props: ButtonProps) => {
  return <MuiButtonAdapter {...props} />
}

/**
 * A wrapper component for the MUI file button primitive.
 *
 * @param props Component properties.
 */
export const FileButton = (props: ButtonProps) => {
  return <MuiFileButtonAdapter {...props} />
}
