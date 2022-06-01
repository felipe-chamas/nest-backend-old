import { AccountId, AccountIdParams } from 'caip';
import { isArray, registerDecorator } from 'class-validator';

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
