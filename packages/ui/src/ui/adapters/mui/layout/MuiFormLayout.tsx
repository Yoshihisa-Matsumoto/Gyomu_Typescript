import { Grid } from '@mui/material'
import type { FormLayout } from '../../../components/layout/headless/FormLayout'

/**
 * A layout component for forms using Material UI Grid, arranging children in a 3-column container with spacing.
 *
 * @param children The form elements to be rendered within the layout.
 *
 * @returns A React functional component element.
 */
export const MuiFormLayout: FormLayout = ({ children }) => (
  <Grid container spacing={2} columns={3}>
    {children}
  </Grid>
)
