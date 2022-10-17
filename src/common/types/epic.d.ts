export interface EpicResultAccessToken {
  scope: string
  token_type: string
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: string
  refresh_expires_in: number
  refresh_expires_at: string
  account_id: string
  client_id: string
  application_id: string
  merged_accounts: Array
}

export interface EpicResultUserAccount {
  accountId: string
  displayName: string
  preferredLanguage: string
  linkedAccounts: Array
  empty: boolean
}
