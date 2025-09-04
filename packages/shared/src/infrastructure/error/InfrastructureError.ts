export const InfrastructureErrorCode = {
  CONFLICT: 'Infrastructure.Conflict',
} as const;

export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly fieldName: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
