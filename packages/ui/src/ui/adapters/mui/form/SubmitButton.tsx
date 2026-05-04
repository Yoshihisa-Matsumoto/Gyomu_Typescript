import { SubmitButtonProps } from '@ui/components';
import { MuiFileButtonAdapter } from '../Button';

export const MuiSubmitButton: React.FC<SubmitButtonProps> = ({
  canSubmit,
  isSubmitting,
}) => {
  const disabled = !canSubmit || !isSubmitting;
  return (
    <MuiFileButtonAdapter
      label={isSubmitting ? '送信中...' : '保存'}
      type="submit"
      disabled={disabled}
    />
  );
};
