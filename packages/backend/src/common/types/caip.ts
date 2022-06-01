export interface AccountId {
  chainId: {
    namespace: string;
    reference: string;
  };
  address: string;
}
