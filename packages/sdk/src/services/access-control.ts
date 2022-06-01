import { AccountId } from 'caip';
import { BigNumberish, ethers } from 'ethers';

import { ErrorCodes, GeneralError } from '../errors';
import { ACL as ACLContract } from '../typechain';
import { PaginationParams, Signer } from '../types';
import { listAsyncItemsWithPagination } from '../utils';
import { ContractResolver } from '../contract-resolver';
import { SignerUtils } from '../signer-utils';

/**
 * Mapping of `Role` to hashes.
 *
 * @remarks
 * Hash is a value used in contract to describe the role.
 */
const roleHashes = {
  Admin: ethers.constants.HashZero,
  Operator: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OPERATOR_ROLE')),
  Owner: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER_ROLE')),
  Minter: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')),
};

/**
 * Enum of all the possible roles.
 */
export type Role = keyof typeof roleHashes;

/**
 * Mapping of hashes to `Role`s.
 */
export const hashToRoleMap = Object.fromEntries(
  Object.entries(roleHashes).map(([role, hash]) => [hash, role as Role]),
) as { [key in string]: Role };

/**
 * Returns `Role` that is correspondend to hash `roleHash`.
 *
 * @throws {@link GeneralError} if such role does not exist.
 */
export function parseRole(roleHash: string): Role {
  if (!hashToRoleMap[roleHash])
    throw new GeneralError(
      ErrorCodes.role_not_exist,
      `No role exists for provided role hash: ${roleHash}`,
    );
  return hashToRoleMap[roleHash];
}

/**
 * Checks if the string `role` is one of existing roles.
 */
export function isRoleExist(role: string) {
  return typeof roleHashes[role as Role] !== 'undefined';
}

/**
 * Returns hash related to `role`.
 */
export function getRoleHashWithThrow(role: Role): string {
  if (!isRoleExist(role))
    throw new GeneralError(
      ErrorCodes.role_not_exist,
      `Provided role: ${role} does not exist.` +
        `Select one of ${roleList.join(',')}`,
    );
  return roleHashes[role];
}

/**
 * Object of existing roles.
 */
export const Roles = Object.fromEntries(
  Object.keys(roleHashes).map((x) => [x, x]),
) as { [key in Role]: key };

/**
 * List of existing roles.
 */
export const roleList = Object.keys(roleHashes) as Role[];

/**
 * Provide operations related to roles management.
 */
export class AccessControl {
  private readonly signerUtils: SignerUtils;
  private readonly aclContract: ACLContract;

  private constructor(signerUtils: SignerUtils, aclContract: ACLContract) {
    this.signerUtils = signerUtils;
    this.aclContract = aclContract;
  }

  static async create(signer: Signer, aclContractAccountId: AccountId) {
    const signerUtils = new SignerUtils(signer);
    const aclContract = new ContractResolver(signer).resolve(
      'ACL',
      await signerUtils.parseAddress(aclContractAccountId),
    );
    return new AccessControl(signerUtils, aclContract);
  }

  async hasRole(who: AccountId, role: Role) {
    const roleHash = getRoleHashWithThrow(role);
    const result = await this.aclContract.hasRole(
      roleHash,
      await this.signerUtils.parseAddress(who),
    );
    return result;
  }

  /**
   * Add `role` to `who`.
   */
  async grantRole(who: AccountId, role: Role) {
    const roleHash = getRoleHashWithThrow(role);
    const transaction = await this.aclContract.grantRole(
      roleHash,
      await this.signerUtils.parseAddress(who),
    );
    return transaction;
  }

  /**
   * Removes `role` from `who`.
   */
  async revokeRole(who: AccountId, role: Role) {
    const roleHash = getRoleHashWithThrow(role);
    const transaction = await this.aclContract.revokeRole(
      roleHash,
      await this.signerUtils.parseAddress(who),
    );
    return transaction;
  }

  /**
   * Removes role from itself. `who` should be a `signer`.
   *
   * @throws {@link GeneralError | renounce_only_self}
   * If signer tries to renounce other than own account id.
   */
  async renounceRole(who: AccountId, role: Role) {
    const whoAddress = await this.signerUtils.parseAddress(who);
    const signerAddress = await this.signerUtils.signer.getAddress();
    if (signerAddress !== whoAddress)
      throw new GeneralError(
        ErrorCodes.renounce_only_self,
        `signer ${signerAddress} can not renounce ${whoAddress}`,
      );
    const roleHash = getRoleHashWithThrow(role);
    const transaction = await this.aclContract.renounceRole(
      roleHash,
      whoAddress,
    );
    return transaction;
  }

  /**
   * @returns `n-th` member with specified {@link Role}.
   */
  getNthRoleMember = async (role: Role, nth: BigNumberish) =>
    this.signerUtils.createAccountIdFromAddress(
      await this.aclContract.getRoleMember(getRoleHashWithThrow(role), nth),
    );

  /**
   * @returns how many addresses are assosiated with a role `role`.
   */
  getRoleMemberCount = (role: Role) =>
    this.aclContract.getRoleMemberCount(getRoleHashWithThrow(role));

  /**
   * @returns all members assosiated with {@link Role}.
   */
  listByRole = async (role: Role, params?: PaginationParams) =>
    listAsyncItemsWithPagination(
      () => this.getRoleMemberCount(role),
      async (index) => this.getNthRoleMember(role, index),
      params,
    );
}
