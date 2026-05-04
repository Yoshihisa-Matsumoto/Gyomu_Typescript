import { Grid } from '@mui/material';
import { FieldLayoutProps } from '@ui/components';
import { Label } from '../fields/label';

export function MuiFieldLayout({ label, error, children }: FieldLayoutProps) {
  return (
    <>
      <Grid size={1}>
        <Label label={label} />
      </Grid>

      <Grid size={2}>
        {children}

        {error?.length ? (
          <div style={{ color: 'red' }}>{error.join(', ')}</div>
        ) : null}
      </Grid>
    </>
  );
}
