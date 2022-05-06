export const errorCodeDescriptions = {
  input_validation_error: 'Input validation error',
  role_not_exist: 'Provided role does not exist',
  accounts_not_on_the_same_chain:
    'AccountIds are related to different chain ids',
  renounce_only_self: 'Renouncing could be done only on sender itself',
  unsupported_chain_standard: 'Provider chainId.namespace is not supported',
  service_was_not_initialized_properly:
    'Service was not initialized properly',
  provided_signature_is_not_valid: 'Provided signature is not valid',
  signer_does_not_have_provider_attached:
    "Signer's `provider` property is not valid",
  not_supported_event: 'Event is not supported',
  nft_claim_error: 'NFT claim is not valid',
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


export class AccountsNotOnTheSameChainError extends GeneralError {

  public name = 'AccountsNotOnTheSameChain';

  constructor(
    public readonly address: string,
    public readonly chainId: string,
    public readonly anotherAddress: string,
    public readonly anotherChainId: string,
  ) {
    super(ErrorCodes.accounts_not_on_the_same_chain);
    this.message =
      `${address} chain id: ${chainId} ` +
      'is not equal to ' +
      `${anotherAddress} chain id: ${anotherChainId}`;
  }

}

