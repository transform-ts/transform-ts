import { Transformer } from './transformer'
import { ok, error } from './result'
import { ValidationTypeError } from './errors'
import { toTypeName } from './util'

const noNullOrUndefined = (u: unknown) => (u != null ? ok(u) : error(new ValidationTypeError([], 'any', toTypeName(u))))

export const any = new Transformer<unknown, unknown>(noNullOrUndefined, noNullOrUndefined)
export const number = new Transformer<unknown, number>(
  u => (typeof u === 'number' ? ok(u) : error(new ValidationTypeError([], 'number', toTypeName(u)))),
  ok,
)
export const string = new Transformer<unknown, string>(
  u => (typeof u === 'string' ? ok(u) : error(new ValidationTypeError([], 'string', toTypeName(u)))),
  ok,
)
export const boolean = new Transformer<unknown, boolean>(
  u => (typeof u === 'boolean' ? ok(u) : error(new ValidationTypeError([], 'boolean', toTypeName(u)))),
  ok,
)
