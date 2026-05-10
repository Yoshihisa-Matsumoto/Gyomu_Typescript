import type { SubmitButtonProps } from './types'

export const DefaultSubmitButton: React.FC<SubmitButtonProps> = ({ disabled, isSubmitting }) => {
  return (
    <button disabled={disabled} type="submit">
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  )
}
