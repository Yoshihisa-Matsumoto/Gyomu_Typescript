import { Grid } from '@mui/material';
import { Label } from '../fields/label';
import { FieldLayoutProps } from '../../../components/layout/types';

export function MuiFieldLayout({ label, error, children }: FieldLayoutProps) {
  return (
    <>
      <Grid size={1}>
        <Label label={label} />
      </Grid>

      <Grid size={2}>
        {children}

        {error ? <div style={{ color: 'red' }}>{error}</div> : null}
      </Grid>
    </>
  );
}
