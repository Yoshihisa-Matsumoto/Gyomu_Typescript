import { Grid } from '@mui/material'
import { Label } from '../fields/label'
import type { FieldLayoutProps } from '../../../components/layout/types'

/**
 * Provides a Material UI-based layout for form fields, consisting of a labeled grid area and a content area that supports displaying error messages.
 *
 * @returns A layout component for form fields.
 */
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
  )
}
