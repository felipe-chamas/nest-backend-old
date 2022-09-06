import { NotFoundException } from '@nestjs/common'
import { validateSync as baseValidateSync, ValidationError, isInstance } from 'class-validator'
import { MongoRepository, ObjectLiteral, DeepPartial } from 'typeorm'

import type { UnknownClass } from '@common/types/utils'

export const validateSync = (object: object, ObjectClass?: UnknownClass): ValidationError[] => {
  if (ObjectClass && !isInstance(object, ObjectClass)) {
    const error = new ValidationError()
    error.property = 'this'
    error.constraints = {
      IsInstanceOf: 'Root value is not instance of provided class'
    }
    return [error]
  }
  return baseValidateSync(object)
}

export const recoveryAgent = async <T extends ObjectLiteral>(
  repo: MongoRepository<T>,
  id?: string
) => {
  const removedObjects = await repo.find({ withDeleted: true })

  if (id) {
    const item = removedObjects.find((object) => object.id.toString() === id)

    if (!item) throw new NotFoundException(`Item not found`)
    return await repo.recover(item as DeepPartial<T>)
  }

  return await repo.recover(removedObjects as DeepPartial<T>[])
}
