import { AbstractValueObject } from './AbstractValueObject';

interface Props {
  [key: string]: any;
}

export abstract class ValueObject<
  T extends Props,
> extends AbstractValueObject<T> {
  protected constructor(props: T) {
    super(props);
  }
}
