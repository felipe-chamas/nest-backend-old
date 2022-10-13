export const walletUser = {
  uuid: 'testUser',
  name: 'John Doe',
  email: 'john@gmail.com',
  accountIds: [
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
      },
      address: '0xE9f9245615A4571d322fe6EA03Ab82C44b432CEa'
    }
  ],
  roles: []
}

export const testSteamId = '76561199405194880'
export const steamNoImageUser = {
  uuid: 'testUserNoImage',
  name: 'John Doe',
  email: 'john@gmail.com',
  accountIds: [
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
      },
      address: '0xE9f9245615A4571d322fe6EA03Ab82C44b432CEa'
    }
  ],
  roles: [],
  socialAccounts: { steam: { id: testSteamId, username: 'John Doe' } }
}
