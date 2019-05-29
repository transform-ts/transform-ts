import { BiTransformer } from './transformer'
import { ok, error } from './result'
import { ValidationTypeError } from './error'

export const any = new BiTransformer<unknown, unknown>(
  u => (u != null ? ok(u) : error(new ValidationTypeError('any', typeof u))),
  ok,
)
export const number = new BiTransformer<unknown, number>(
  u => typeof u === 'number' ? ok(u) : error(new ValidationTypeError('number', typeof u)),
  ok,
)
export const string = new BiTransformer<unknown, string>(
  u => typeof u === 'string' ? ok(u) : error(new ValidationTypeError('string', typeof u)),
  ok,
)
