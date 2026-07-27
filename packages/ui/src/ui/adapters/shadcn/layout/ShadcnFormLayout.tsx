import { FieldGroup } from '../../../components/ui/field'
import type { FormLayout } from '../../../components/layout/headless/FormLayout'

/**
 * A layout component that renders form children within a FieldGroup.
 *
 * @param children The form elements to be rendered inside the group.
 *
 * @returns The rendered form layout.
 */
export const ShadcnFormLayout: FormLayout = ({ children }) => <FieldGroup>{children}</FieldGroup>
