import { PrimitiveValueObject } from '../value-object/PrimitiveValueObject';
import { Version } from '../Version';

export abstract class AbstractEntity<
  ID extends PrimitiveValueObject<number | bigint | string>,
  PROPS,
> {
  protected constructor(
    public readonly id: ID,
    protected readonly props: PROPS,
    public version?: Version,
  ) {
    this.validate(props);
  }

  protected abstract validate(props: PROPS): void;

  equals(entity?: AbstractEntity<ID, PROPS>): boolean {
    if (entity == null) {
      return false;
    }
    return this.id.equals(entity.id);
  }
}
