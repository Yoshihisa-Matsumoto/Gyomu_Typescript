import { Grid } from '@mui/material';
import { FormLayout } from '../../../components/layout/headless/FormLayout';

export const MuiFormLayout: FormLayout = ({ children }) => (
  <Grid container spacing={2} columns={3}>
    {children}
  </Grid>
);
