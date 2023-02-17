export class FutureError extends Error {
  constructor(message: string, public options?: { cause: Error }) {
    super(message);
  }
}
