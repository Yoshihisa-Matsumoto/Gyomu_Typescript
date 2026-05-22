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
