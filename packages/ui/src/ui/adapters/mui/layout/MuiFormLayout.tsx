import { Grid } from '@mui/material';
import { FormLayout } from '@ui/components';

export const MuiFormLayout: FormLayout = ({ children }) => (
  <Grid container spacing={2} columns={3}>
    {children}
  </Grid>
);
