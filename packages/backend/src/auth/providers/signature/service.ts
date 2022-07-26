import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { sign } from 'tweetnacl';
import { decode } from 'bs58';
import { utils } from 'ethers';
import { ChainIdReference } from 'common/types';

@Injectable()
export class SignatureAuthService {
  getMessageToSign(address: string): string {
    const randomNonce = uuid();
    const message = [
      `Please sign this message to prove that you own the address: ${address}`,
      'Session duration: 24h',
      `Nonce: ${randomNonce}`,
    ].join('\n');
    return message;
  }

  verifySignature(
    network: string,
    message: string,
    signature: string,
    address: string,
  ): boolean {
    switch (network) {
      case ChainIdReference.ETHEREUM_MAINNET:
      case ChainIdReference.BINANCE_MAINNET:
      case ChainIdReference.BINANCE_TESTNET:
      case ChainIdReference.GOERLI_TESTNET:
        return this.verifyEthereumSignature(message, signature, address);
      case ChainIdReference.SOLANA_MAINNET:
      case ChainIdReference.SOLANA_DEVNET:
      case ChainIdReference.SOLANA_TESTNET:
        return this.verifySolanaSignature(message, signature, address);
      default:
        throw new Error(`Unimplemented network: ${network}`);
    }
  }

  verifySolanaSignature(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    // Ref: https://www.npmjs.com/package/tweetnacl#naclsignsignaturelength--64
    try {
      if (signature.length !== 128) return false;
      const isValid = sign.detached.verify(
        Uint8Array.from(Buffer.from(message)),
        Uint8Array.from(Buffer.from(signature, 'hex')),
        decode(address),
      );
      return isValid;
    } catch (_) {
      return false;
    }
  }

  verifyEthereumSignature(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    // Ref: https://docs.ethers.io/v4/api-utils.html#signatures
    try {
      if (!utils.isHexString(signature, 65)) return false;
      const signatureFromMessage =
        '\x19Ethereum Signed Message:\n' + message.length + message;
      const signerAddress = utils.recoverAddress(
        utils.arrayify(utils.id(signatureFromMessage)),
        signature,
      );

      return address.toLowerCase() === signerAddress.toLowerCase();
    } catch (_) {
      return false;
    }
  }
}
