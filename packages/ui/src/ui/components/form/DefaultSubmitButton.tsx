import type { SubmitButtonProps } from './types'

/**
 * Renders a standard submit button that reflects a form's submission state.
 *
 * @param disabled Whether the button is disabled.
 *
 * @param isSubmitting Whether the form is currently being submitted.
 *
 * @returns A React functional component representing a submit button.
 */
export const DefaultSubmitButton: React.FC<SubmitButtonProps> = ({ disabled, isSubmitting }) => {
  return (
    <button disabled={disabled} type="submit">
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  )
}
