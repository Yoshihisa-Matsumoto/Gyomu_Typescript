/**
 * Represents an approval request, which can be a confirmation, a selection from multiple options, or a credential validation.
 */
export type ApprovalChallenge =
  | {
      type: 'confirm'
      message: string
    }
  | {
      type: 'select'
      message: string
      options: ReadonlyArray<string>
    }
  | {
      type: 'credential'
      provider: 'password' | 'otp'
    }
