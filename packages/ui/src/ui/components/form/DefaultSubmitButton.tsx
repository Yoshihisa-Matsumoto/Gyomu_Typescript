import { SubmitButtonProps } from './types';

export const DefaultSubmitButton: React.FC<SubmitButtonProps> = ({
  canSubmit,
  isSubmitting,
}) => {
  const disabled = !canSubmit || !isSubmitting;
  return (
    <button disabled={disabled} type="submit">
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  );
};
