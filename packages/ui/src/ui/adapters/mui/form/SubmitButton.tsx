import { MuiFileButtonAdapter } from '../Button'
import type { SubmitButtonProps } from '../../../components/form/types'

/**
 * A UI component that renders a submit button using Material UI, displaying an appropriate label based on the submitting state.
 *
 * @param disabled Whether the button is disabled.
 *
 * @param isSubmitting Indicates whether the form is currently being submitted.
 *
 * @returns A React functional component representing the submit button.
 */
export const MuiSubmitButton: React.FC<SubmitButtonProps> = ({ disabled, isSubmitting }) => {
  return (
    <MuiFileButtonAdapter
      label={isSubmitting ? '送信中...' : '保存'}
      type="submit"
      disabled={disabled}
    />
  )
}
