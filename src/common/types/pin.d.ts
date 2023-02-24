export interface Salt {
  salt: string
  createdAt: string
}

export interface GetSaltReturn extends Salt {
  oldSalt?: string
}
