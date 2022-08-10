import { registerDecorator } from 'class-validator';

export function IsPincode(object: object, propertyName: string) {
  registerDecorator({
    name: 'isPincode',
    target: object.constructor,
    propertyName: propertyName,
    options: {
      message: 'String pincode should be 4 to 6 digits number',
    },
    validator: {
      validate(value: string) {
        return /^\d{4,6}$/.test(value);
      },
    },
  });
}
