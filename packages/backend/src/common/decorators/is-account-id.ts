import { AccountId } from 'caip';
import { registerDecorator } from 'class-validator';

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
      validate(value: unknown) {
        try {
          AccountId.parse(value as string);
          return true;
        } catch (_) {
          return false;
        }
      },
    },
  });
}
