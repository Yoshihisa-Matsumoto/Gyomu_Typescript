import { Button } from '../../../components/ui'
import type { SubmitButtonProps } from '../../../components/form/types'

export const ShadcnSubmitButton: React.FC<SubmitButtonProps> = ({ disabled, isSubmitting }) => {
  return (
    <Button type="submit" disabled={disabled}>
      {isSubmitting ? '送信中...' : '保存'}
    </Button>
  )
}
