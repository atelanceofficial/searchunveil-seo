/** A problem the person or the assistant can fix: a missing file, a wrong field, a bad command. */
export class InputError extends Error {
  override readonly name = 'InputError';
}
