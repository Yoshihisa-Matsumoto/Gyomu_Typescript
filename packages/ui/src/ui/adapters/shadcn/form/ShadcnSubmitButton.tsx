import { Button } from '../../../components/ui'
import type { SubmitButtonProps } from '../../../components/form/types'

/**
 * A submit button component for Shadcn forms that displays a loading state during submission.
 *
 * @param disabled Whether the button is disabled.
 *
 * @param isSubmitting Indicates whether the form is currently being submitted.
 *
 * @returns A React functional component rendering the submit button.
 */
export const ShadcnSubmitButton: React.FC<SubmitButtonProps> = ({ disabled, isSubmitting }) => {
  return (
    <Button type="submit" disabled={disabled}>
      {isSubmitting ? '送信中...' : '保存'}
    </Button>
  )
}
