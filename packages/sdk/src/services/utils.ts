import { AccountId, ChainId } from 'caip';
import { ethers } from 'ethers';

import { BaseService } from './base-service';
import {
  Address, EventName, ContractName,
  AddressLike,
} from '../types';
import { CHAIN_STANDARD } from '../constants';
import * as typechain from '../typechain';
import { Interface } from 'ethers/lib/utils';
import { JsonFragment } from '@ethersproject/abi';
import { ErrorCodes, GeneralError } from '../errors';

// File of this import is generated with src/generate-helper-types.ts
import { wrapFetchEventsWithEventTypes } from '../typechain/helpers';
import { parseRole } from './access-control';


export type FetchEventsFunctionBase = (
  transactionHash: string,
  contractAddress: AddressLike,
  contractName: ContractName,
  eventName: EventName,
) => Promise<Array<unknown>>


/**
 * Gather information about all the available events
 */

interface EventsDetailsPerContractName {
  eventsInterface: Interface;
  supportedEventIds: Set<string>;
  supportedEventNames: Set<string>;
  supportedEventSignatures: Set<string>;
  eventAbis: JsonFragment[];
}

const eventsDetailsPerContractNameMap =
  new Map<string, EventsDetailsPerContractName>();

for (const [factoryName, factory] of Object.entries(typechain)) {
  if (
    !factory.abi ||
    !Array.isArray(factory.abi) ||
    !factoryName.endsWith('__factory')
  ) continue;
  const eventAbis = (factory.abi as Array<JsonFragment>)
    .filter(x => x.type === 'event');
  const eventNames = eventAbis.map(x => x.name).filter(x => x);
  const eventsInterface = new ethers.utils.Interface(eventAbis);
  const contractName = factoryName.replace('__factory', '');
  const eventSignatures = Object.keys(eventsInterface.events);
  const eventIds = eventSignatures.map(x => ethers.utils.id(x));
  const details: EventsDetailsPerContractName = {
    eventsInterface,
    supportedEventSignatures: new Set(eventSignatures),
    supportedEventNames: new Set(eventNames),
    supportedEventIds: new Set(eventIds),
    eventAbis,
  };
  eventsDetailsPerContractNameMap.set(contractName, details);
}


export class Utils extends BaseService {

  createAccountIdFromAddress(address: Address): AccountId {
    const validatedAddress = this.parseAddress(address);
    return new AccountId({
      address: validatedAddress,
      chainId: new ChainId({
        namespace: CHAIN_STANDARD,
        reference: this.params.signerChainId,
      }),
    });
  }

  private _fetchEvents: FetchEventsFunctionBase = async (
    transactionHash: string,
    contractAddress: AddressLike,
    contractName: ContractName,
    eventName: EventName,
  ) => {
    const receipt = await this.provider
      .getTransactionReceipt(transactionHash);
    let rawEvents = receipt.logs;
    // filter by contract address
    const contractAddressAsString = this.parseAddress(contractAddress);
    rawEvents = rawEvents.filter(x => x.address === contractAddressAsString);

    const eventsDetails: EventsDetailsPerContractName =
      eventsDetailsPerContractNameMap.get(contractName);
    if (!eventsDetails)
      throw new GeneralError(
        ErrorCodes.not_supported_event,
        `Handlers for contract ${contractName} were not found`,
      );

    // filter by supported event ids
    rawEvents = rawEvents
      .filter(x => eventsDetails.supportedEventIds.has(x.topics[0]));

    // parse raw events
    let events = rawEvents.map(x => eventsDetails.eventsInterface.parseLog(x));

    // filter by event name
    if (!eventsDetails.supportedEventNames.has(eventName))
      throw new GeneralError(
        ErrorCodes.not_supported_event,
        `contract ${contractName} ` +
        `does not support event ${eventName}`,
      );
    events = events.filter(x => x && x.name === eventName);

    // get event result
    const result: unknown[] = [];
    for (const event of events) {
      const eventName = event.name as EventName;
      const eventAbi = eventsDetails.eventAbis.find(x => x.name === eventName);
      if (!eventAbi)
        throw new GeneralError(
          ErrorCodes.not_supported_event,
          `abi was not found for event ${eventName}`,
        );
      if (event.args.length !== (eventAbi.inputs || []).length)
        throw new GeneralError(
          ErrorCodes.not_supported_event,
          'abi event argument length is not equal to ' +
          `actual event argument length for event ${eventName}`,
        );
      const resultItem: unknown = {};
      const argumentDescriptionsFromAbi = eventAbi.inputs || [];
      argumentDescriptionsFromAbi.forEach((argument, idx) => {
        if (!argument.name) throw new GeneralError(
          ErrorCodes.not_supported_event,
          `event ${contractName}:${eventName} ` +
          `does not have name for n-th(${idx}) argument`,
        );
        let value: unknown = event.args[idx];
        if (argument.type === 'address')
          value = this.createAccountIdFromAddress(value as string);
        if (argument.name.match(/Role|role/)) {
          value = parseRole(value as string);
        }
        resultItem[argument.name] = value;
      });
      result.push(resultItem);
    }
    return result;
  };

  /**
   * _fetchEvents method does not provide type support for events returned
   * However type support is added with autogenerated wrapper that includes
   * all possible overrides of _fetchEvents with for all possible
   * combinations of `eventName`, `contractName` arguments
   */
  /***/
  fetchEvents = wrapFetchEventsWithEventTypes(this._fetchEvents.bind(this));

}
