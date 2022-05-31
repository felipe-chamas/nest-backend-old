import {
  validateSync as baseValidateSync,
  ValidationError,
  isInstance,
} from 'class-validator';
import { UnknownClass } from './types';

export const validateSync = (
  object: object,
  ObjectClass?: UnknownClass
): ValidationError[] => {
  if (ObjectClass && !isInstance(object, ObjectClass)) {
    const error = new ValidationError();
    error.property = 'this';
    error.constraints = {
      IsInstanceOf: 'Root value is not instance of provided class',
    };
    return [error];
  }
  return baseValidateSync(object);
};
