import {
  AccountId,
  AccountIdParams,
  AssetId,
  AssetIdParams,
  AssetType,
  AssetTypeParams,
  ChainId,
  ChainIdParams,
} from 'caip';
import { isArray, registerDecorator } from 'class-validator';

export function IsChainId(object: object, propertyName: string) {
  registerDecorator({
    name: 'isChainId',
    target: object.constructor,
    propertyName: propertyName,
    options: {
      message:
        'String should be formatted according to caip standard. See more ' +
        'https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md',
    },
    validator: {
      validate(value: string | ChainIdParams) {
        try {
          new ChainId(value);
          return true;
        } catch (_) {
          return false;
        }
      },
    },
  });
}

export function IsAccountId(object: object, propertyName: string) {
  registerDecorator({
    name: 'isAccountId',
    target: object.constructor,
    propertyName: propertyName,
    options: {
      message:
        'String should be formatted according to caip standard. See more ' +
        'https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md',
    },
    validator: {
      validate(value: string | AccountIdParams) {
        try {
          new AccountId(value);
          return true;
        } catch (_) {
          return false;
        }
      },
    },
  });
}

export function IsAccountIdArray(object: object, propertyName: string) {
  registerDecorator({
    name: 'isAccountIdArray',
    target: object.constructor,
    propertyName: propertyName,
    options: {
      message:
        'String should be formatted according to caip standard. See more ' +
        'https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md',
    },
    validator: {
      validate(values: string[] | AccountIdParams[]) {
        if (!isArray(values)) return false;
        try {
          values.map((value: string | AccountIdParams) => new AccountId(value));
          return true;
        } catch (_) {
          return false;
        }
      },
    },
  });
}

export function IsAssetTypeArray(object: object, propertyName: string) {
  registerDecorator({
    name: 'isAssetTypeArray',
    target: object.constructor,
    propertyName: propertyName,
    options: {
      message:
        'String should be formatted according to caip standard. See more ' +
        'https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-19.md',
    },
    validator: {
      validate(values: string[] | AssetTypeParams[]) {
        if (!isArray(values)) return false;
        try {
          values.map((value: string | AssetTypeParams) => new AssetType(value));
          return true;
        } catch (_) {
          return false;
        }
      },
    },
  });
}

export function IsAssetIdArray(object: object, propertyName: string) {
  registerDecorator({
    name: 'isAssetIdArray',
    target: object.constructor,
    propertyName: propertyName,
    options: {
      message:
        'String should be formatted according to caip standard. See more ' +
        'https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-19.md',
    },
    validator: {
      validate(values: string[] | AssetIdParams[]) {
        if (!isArray(values)) return false;
        try {
          values.map((value: string | AssetIdParams) => new AssetId(value));
          return true;
        } catch (_) {
          return false;
        }
      },
    },
  });
}
