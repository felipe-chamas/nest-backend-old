export const errorCodeDescriptions = {
  unboxing_error: 'Error while unboxing',
  role_not_exist: 'Provided role does not exist',
  accounts_not_on_the_same_chain:
    'AccountIds are from to different chains',
  renounce_only_self: 'Renouncing could be done only on signer itself',
  nft_claim_error: 'NFT claim is not valid',
  not_supported_event: 'Event is not supported',
  not_supported_contract_factory: 'Contract factory does not exist',
  unsupported_chain_standard: 'Provided chain id is not supported',
  provider_not_available: 'Provider is not available',
} as const;


export type ErrorCode = keyof typeof errorCodeDescriptions;

export const ErrorCodes = Object.fromEntries(
  Object.keys(errorCodeDescriptions).map(x => [x, x]),
) as { [key in ErrorCode]: key };

export class GeneralError extends Error {
  errorCode: ErrorCode;
  errorCodeDescription: string;
  constructor(code: ErrorCode, message = '') {
    super(message);
    this.errorCode = code;
    this.errorCodeDescription = errorCodeDescriptions[this.errorCode];
  }
}

