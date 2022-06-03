import { NotFoundException } from '@nestjs/common';
import {
  validateSync as baseValidateSync,
  ValidationError,
  isInstance,
} from 'class-validator';
import { ObjectID, Repository } from 'typeorm';
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

export const recoveryAgent = async (repo: Repository<any>, id?: ObjectID) => {
  const removedObjects = await repo.find({ withDeleted: true });

  if (id) {
    const item = removedObjects.find(
      (nft) => nft.id.toString() === id.toString()
    );

    if (!item) throw new NotFoundException(`Item not found`);
    return await repo.recover(item);
  }

  return await repo.recover(removedObjects);
};
