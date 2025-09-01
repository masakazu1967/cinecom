import deepEqual from 'deep-equal';

export abstract class AbstractValueObject<T> {
  protected constructor(protected readonly props: T) {
    this.validate(props);
  }

  protected abstract validate(props: T): void;

  equals(vo?: AbstractValueObject<T>): boolean {
    if (vo == null) {
      return false;
    }
    return deepEqual(this.props, vo.props);
  }
}
