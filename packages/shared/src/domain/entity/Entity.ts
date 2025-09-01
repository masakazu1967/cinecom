import { PrimitiveValueObject } from '../value-object/PrimitiveValueObject';
import { Version } from '../Version';
import { AbstractEntity } from './AbstractEntity';

interface Props {
  [key: string]: any;
}

export abstract class Entity<
  ID extends PrimitiveValueObject<number | bigint | string>,
  PROPS extends Props,
> extends AbstractEntity<ID, PROPS> {
  protected constructor(id: ID, props: PROPS, version?: Version) {
    super(id, props, version);
  }
}
