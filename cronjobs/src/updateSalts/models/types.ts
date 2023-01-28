export interface UserI {
  uuid: string
  name: string
  email: string
  roles: string[]
  accountIds: AccountId[]
  wallet: Wallet
  socialAccounts: SocialAccounts
  imageUrl: string
}

interface AccountId {
  chainId: ChainId
  address: string
}

interface ChainId {
  namespace: string
  reference: string
}
interface Wallet {
  id: string
  address: string
  walletType: 'UNRECOVERABLE_WHITE_LABEL' | 'WHITE_LABEL'
  secretType: 'ETHEREUM' | 'BSC'
  identifier: string
  description: string
  createdAt: string
}

interface SocialAccounts {
  discord?: SocialDetails
  steam?: SocialDetails
  epic?: SocialDetails
}
interface SocialDetails {
  id?: string
  username?: string
}
