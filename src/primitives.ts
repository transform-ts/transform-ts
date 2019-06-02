import { Transformer } from './transformer'
import { ok, error } from './result'
import { ValidationTypeError } from './errors'

export const any = new Transformer<unknown, unknown>(
  u => (u != null ? ok(u) : error(new ValidationTypeError([], 'any', typeof u))),
  ok,
)
export const number = new Transformer<unknown, number>(
  u => (typeof u === 'number' ? ok(u) : error(new ValidationTypeError([], 'number', typeof u))),
  ok,
)
export const string = new Transformer<unknown, string>(
  u => (typeof u === 'string' ? ok(u) : error(new ValidationTypeError([], 'string', typeof u))),
  ok,
)
export const boolean = new Transformer<unknown, boolean>(
  u => (typeof u === 'boolean' ? ok(u) : error(new ValidationTypeError([], 'boolean', typeof u))),
  ok,
)
