import fs from 'fs';
import { ethers } from 'ethers';
import * as typechain from './src/typechain';
import { JsonFragment } from '@ethersproject/abi';

function filterDuplicates<T>(array: T[]): T[] {
  const result: T[] = [];
  for (const element of array) {
    if (!result.includes(element))
      result.push(element);
  }
  return result;
}

interface EventInfo {
  name: string,
  abi: JsonFragment,
}

interface FactoryInfo {
  contractName: string;
  events: EventInfo[]
}

/***/
async function main() {
  const allContractNames: string[] = [];
  const allEventNames: string[] = [];
  const allEventSignatures: string[] = [];
  const factoryInfos: FactoryInfo[] = [];
  const importEventTypesStrings: string[] = [];
  const transformedEventReturnTypeStrings: string[] = [];
  const fetchEventsOverloadsStrings: string[] = [];
  for(const [factoryName, factory] of Object.entries(typechain)) {
    if (
      !factoryName.endsWith('__factory') ||
      !factory.abi ||
      !Array.isArray(factory.abi) ||
      factoryName.includes('Mock') ||
      factoryName.startsWith('GodMode')
    ) continue;
    const contractName = factoryName.replace('__factory', '');
    const eventAbis = (factory.abi as Array<JsonFragment>)
      .filter(x =>
        x &&
        x.type === 'event' &&
        typeof x.name === 'string',
      );
    const eventsInterface = new ethers.utils.Interface(eventAbis);
    const eventNames = eventAbis
      .map(x => x.name as string)
      .filter(x => x);
    const eventSignatures = Object.keys(eventsInterface.events);
    const factoryInfo: FactoryInfo = {
      contractName,
      events: eventAbis.map(abi => ({ abi, name: abi.name as string })),
    };
    for (const event of factoryInfo.events) {
      // Generate EventResultTypes
      // GENERATED LINE EXAMPLE:
      // export type IERC721MetadataUpgradeableTransferEventResult =
      //   Pick<
      //    IERC721MetadataUpgradeableImports.TransferEvent['args'],
      //    'tokenId'
      //  > & { from: AccountId, to: AccountId }
      let transformedEventReturnTypeString =
        'export type ' + contractName + event.name + 'EventResult = ';
      const addresses: string[] = [];
      const roles: string[] = [];
      const keep: string[] = [];
      for (const argument of (event.abi.inputs || [])) {
        if (!argument.name) throw new Error('argument name is undefined');
        if (argument.type === 'address')
          addresses.push(argument.name);
        else if (
          argument.name.includes('role') ||
          argument.name.includes('Role')
        ) {
          roles.push(argument.name);
        }
        else
          keep.push(argument.name);
      }
      if (keep.length === 0) {
        transformedEventReturnTypeString += '{}';
      } else {
        transformedEventReturnTypeString +=
          'Pick<' + contractName + 'Imports.' + event.name +
          "Event['args'], " + keep.map(x => `'${x}'`).join(' | ') +
          '>';
      }

      if (addresses.length > 0) {
        transformedEventReturnTypeString +=
          ' & { ' + addresses.map(x => `${x}: AccountId`).join(', ')+ ' }';
      }

      if (roles.length > 0) {
        transformedEventReturnTypeString +=
          ' & { ' + roles.map(x => `${x}: Role`).join(', ')+ ' }';
      }
      transformedEventReturnTypeStrings.push(transformedEventReturnTypeString);

      // Generate fetchEvents override for contractName/eventName
      // GENERATED LINE EXAMPLE:
      //  function fetchEvents(
      //    transactionHash: string,
      //    contractAddress: AddressLike,
      //    contractName: 'ACL',
      //    eventName: 'RoleGrantedEvent',
      //  ): Promise<Array<RoleGrantedEventTransformed>>;
      const fetchEventsOverloadsString =
        'function fetchEvents(transactionHash: string,' +
        "contractAddress: AddressLike, contractName: '" +
        contractName + "', eventName: '" + event.name +
        "'): Promise<Array<" + contractName + event.name + 'EventResult>>;';
      fetchEventsOverloadsStrings.push(fetchEventsOverloadsString);
    }
    factoryInfos.push(factoryInfo);
    allContractNames.push(contractName);
    allEventNames.push(...eventNames);
    allEventSignatures.push(...eventSignatures);
    // generate interfaces
    // GENERATED LINE EXAMPLE:
    // import * as AccessControlEnumerableUpgradeableImports
    //   from './AccessControlEnumerableUpgradeable';
    const importEventResultTypeString =
      'import * as ' + contractName + 'Imports from ' +
      `'./${contractName}';`;
    importEventTypesStrings.push(importEventResultTypeString);


  }
  const allContractNamesString = filterDuplicates(allContractNames)
    .filter(x => !x.includes('Mock'))
    .map(x => `'${x}'`)
    .join(' | ');
  const allEventNamesString = filterDuplicates(allEventNames)
    .map(x => `'${x}'`)
    .join(' | ');
  const allEventSignaturesString = filterDuplicates(allEventSignatures)
    .map(x => `'${x}'`)
    .join(' | ');
  const fileContent = `
/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */
// Autogenerated by src/gen-helper-types.ts
import { AccountId } from 'caip';
import { AddressLike } from '../types';
import { Role } from '../services/access-control';
import { FetchEventsFunctionBase } from '../services/utils';

${importEventTypesStrings.join('\n')}

${transformedEventReturnTypeStrings.join('\n')}

export type ContractName = ${allContractNamesString};
export type EventName = ${allEventNamesString};
export type EventSignature = ${allEventSignaturesString};


export const wrapFetchEventsWithEventTypes = (
  fn: FetchEventsFunctionBase,
) => {
${fetchEventsOverloadsStrings.map(x => '  ' + x).join('\n')}
  function fetchEvents(
    transactionHash: string,
    contractAddress: AddressLike,
    contractName: string,
    eventName: string,
  ): Promise<Array<unknown>> {
    return fn(
      transactionHash,
      contractAddress,
      contractName as ContractName,
      eventName as EventName,
    );
  }
  return fetchEvents;
};`;
  console.log('wriring to src/typechain/helpers.ts: ', fileContent);
  fs.writeFileSync('src/typechain/helpers.ts', fileContent);
}

main();
