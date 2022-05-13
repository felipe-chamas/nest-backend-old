import { AccountId } from 'caip';
import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { JsonFragment } from '@ethersproject/abi';

import { EventName, ContractName, Signer } from '../types';
import * as typechain from '../typechain';
import { ErrorCodes, GeneralError } from '../errors';
import { parseRole } from './access-control';
import { SignerUtils } from '../signer-utils';
// File of this import is generated with src/generate-helper-types.ts
import { wrapFetchEventsWithEventTypes } from '../typechain/helpers';


export type FetchEventsFunctionBase = (
  transactionHash: string,
  contractAddress: AccountId,
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
  const eventNames = eventAbis.map(x => x.name)
    .filter((x): x is string => typeof x === 'string');
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


/**
 * Provides utils functionality related to data stored on blockchain.
 */
export class Utils {
  private readonly signerUtils: SignerUtils;

  private constructor(signerUtils: SignerUtils) {
    this.signerUtils = signerUtils;
  }

  static async create(
    signer: Signer,
  ) {
    const signerUtils = new SignerUtils(signer);
    return new Utils(signerUtils);
  }

  /**
   * @returns The list of events.
   *
   * @remarks
   * This method is a base for fetching events.
   *
   * @see {@link fetchEvents}.
   */
  private fetchEventsNoTypeSupport: FetchEventsFunctionBase = async (
    transactionHash: string,
    contractAddress: AccountId,
    contractName: ContractName,
    eventName: EventName,
  ) => {
    const receipt = await this.signerUtils.getProvider()
      .getTransactionReceipt(transactionHash);
    let rawEvents = receipt.logs;
    // filter by contract address
    const contractAddressAsString = await this.signerUtils
      .parseAddress(contractAddress);
    rawEvents = rawEvents.filter(x => x.address === contractAddressAsString);

    const eventsDetails = eventsDetailsPerContractNameMap.get(contractName);
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
      const resultItem: { [key: string]: unknown } = {};
      const argumentDescriptionsFromAbi = eventAbi.inputs || [];
      for (const [idx, argument] of argumentDescriptionsFromAbi.entries()) {
        if (!argument.name) throw new GeneralError(
          ErrorCodes.not_supported_event,
          `event ${contractName}:${eventName} ` +
          `does not have name for n-th(${idx}) argument`,
        );
        let value: unknown = event.args[idx];
        if (argument.type === 'address') {
          value = await this.signerUtils
            .createAccountIdFromAddress(value as string);
        } else if (argument.name.match(/Role|role/)) {
          value = parseRole(value as string);
        } else if (argument.type === 'address[]') {
          value = await Promise.all(
            (value as string[]).map(
              x => this.signerUtils.createAccountIdFromAddress(x),
            ),
          );
        }
        resultItem[argument.name] = value;
      }
      result.push(resultItem);
    }
    return result;
  };

  /**
   *
   * @returns list of objects each describes the list of named arguments of the
   * requested events.
   *
   * @remarks
   * Fetches events from specified transaction. As a result it
   * return array of objects with properties equal to event named arguments.
   *
   * @remarks
   * If the contract of name `contractName` does not have the event of
   * name `eventName`, typescript going to show the error.
   *
   *
   * @param transactionHash
   * defines what transaction should be search for events.
   *
   * @param contractName
   * defines the contract of interest. Only events from
   * this contract will be included in the result. Autocomplete supported for
   * all of the existing contracts. {@link ContractName}
   *
   * @param contractAddress
   * defines where contract of name `contractName` is deployed to.
   *
   * @param eventName
   * defines specific event to look for {@link EventName}.
   *
   * @remarks
   * The type of `params.contractName` and `params.eventName` extends string and
   * contains every possible contract/event names.
   * If not existing event is specified, error returned.
   *
   */
  fetchEvents = wrapFetchEventsWithEventTypes(
    this.fetchEventsNoTypeSupport.bind(this),
  );

}
