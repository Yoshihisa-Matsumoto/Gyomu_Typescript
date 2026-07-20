export interface ApiResponse {
  users: Array<{
    id: string
    profile: {
      displayName: string
    }
  }>
}
