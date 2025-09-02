export class DomainError extends Error {
  constructor(
    message: string,
    public readonly fieldName: string,
    public readonly value?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
