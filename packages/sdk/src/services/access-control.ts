import { BaseService, BaseServiceParams } from './base-service';
import { Utils } from './utils';
import { GeneralError } from '../errors';
import { ACL } from '../typechain';
import { Address, AddressLike } from '../types';
import { ethers } from 'ethers';


export const roleHashes = {
  Admin: ethers.constants.HashZero,
  Operator: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE')),
  Owner: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')),
  Minter: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')),
};

export type Role = keyof typeof roleHashes;

export const Roles = Object.fromEntries(
  Object.keys(roleHashes).map(x => [x, x]),
) as { [key in Role]: key };

const roleList = Object.keys(roleHashes) as Role[];

export function isRoleExist(role: string) {
  return typeof roleHashes[role as Role] !== 'undefined';
}

export class AccessControl extends BaseService {

  private readonly aclContract: ACL;
  private readonly aclAddress: Address;

  constructor(
    aclAddress: AddressLike,
    private readonly utils: Utils,
    baseParams: BaseServiceParams,
  ) {
    super(baseParams);
    this.aclAddress = this.parseAddress(aclAddress);
    this.aclContract = this.params.contractResolver.getACL(this.aclAddress);
  }

  private getRoleHashWithThrow(role: Role): string {
    if (!isRoleExist(role))
      throw new GeneralError(
        'role_not_exist',
        `Provided role: ${role} does not exist.` +
        `Select one of ${roleList.join(',')}`,
      );
    return roleHashes[role];
  }

  async hasRole(address: AddressLike, role: Role) {
    const roleHash = this.getRoleHashWithThrow(role);
    const result = await this.aclContract.hasRole(
      roleHash,
      this.parseAddress(address),
    );
    return result;
  }

  /**
   * Add `role` to `address`
   */
  async grantRole(address: AddressLike, role: Role) {
    const roleHash = this.getRoleHashWithThrow(role);
    const transaction = await this.aclContract.grantRole(
      roleHash,
      this.parseAddress(address),
    );
    return transaction;
  }

  /**
   * Remove `role` from `address`
   */
  async revokeRole(address: AddressLike, role: Role) {
    const roleHash = this.getRoleHashWithThrow(role);
    const transaction = await this.aclContract.revokeRole(
      roleHash,
      this.parseAddress(address),
    );
    return transaction;
  }

  /**
   * Remove role from itself. `address` should be a `signer`.
   */
  async renounceRole(address: AddressLike, role: Role) {
    const addressStr = this.parseAddress(address);
    if (this.params.signerAddress !== addressStr)
      throw new GeneralError(
        'renounce_only_self',
        'signerAddress !== address to renounce role from' +
        `renounce is called with addess ${address}` +
        `by signer with address ${this.params.signerAddress}`,
      );
    const roleHash = this.getRoleHashWithThrow(role);
    const transaction = await this.aclContract.renounceRole(
      roleHash,
      addressStr,
    );
    return transaction;
  }

  /**
   * Return `nth`(n-th) member with specified `role`.
   * If there is not n-th member, return `null`.
   */
  async getNthRoleMember(
    role: Role,
    nth: number,
  ) {
    const roleHash = this.getRoleHashWithThrow(role);
    const reply = await this.aclContract.getRoleMemberCount(roleHash);
    const totalRoleMemberCount = reply.toNumber();
    if (nth >= totalRoleMemberCount)
      return null;
    const memberAddress = await this.aclContract.getRoleMember(roleHash, nth);
    return this.utils.createAccountIdFromAddress(memberAddress);
  }

  /**
   * list all addresses assosiated with `role`
   */
  async listByRole(role: Role) {
    const roleHash = this.getRoleHashWithThrow(role);
    const reply = await this.aclContract.getRoleMemberCount(roleHash);
    const roleCount = reply.toNumber();
    const members: Address[] = [];
    for (let i = 0; i < roleCount; i++) {
      const member = await this.aclContract.getRoleMember(roleHash, i);
      members.push(member);
    }
    const result = members.map(x => this.utils.createAccountIdFromAddress(x));
    return result;
  }

}
