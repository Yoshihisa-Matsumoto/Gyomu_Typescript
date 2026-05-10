import { MuiFileButtonAdapter } from '../Button'
import type { SubmitButtonProps } from '../../../components/form/types'

export const MuiSubmitButton: React.FC<SubmitButtonProps> = ({ disabled, isSubmitting }) => {
  return (
    <MuiFileButtonAdapter
      label={isSubmitting ? '送信中...' : '保存'}
      type="submit"
      disabled={disabled}
    />
  )
}
