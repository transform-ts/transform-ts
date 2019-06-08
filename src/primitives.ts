import { Transformer } from './transformer'
import { ok, error } from './result'
import { ValidationTypeError } from './errors'
import { toTypeName } from './util'

const transformerCache = new Map<unknown, Transformer<unknown, any>>()

export function typeOf(type: 'string'): Transformer<unknown, string>
export function typeOf(type: 'number'): Transformer<unknown, number>
export function typeOf(type: 'bigint'): Transformer<unknown, bigint>
export function typeOf(type: 'boolean'): Transformer<unknown, boolean>
export function typeOf(type: 'symbol'): Transformer<unknown, symbol>
export function typeOf(type: 'undefined'): Transformer<unknown, undefined>
export function typeOf(type: 'object'): Transformer<unknown, object>
export function typeOf(type: 'function'): Transformer<unknown, Function>
export function typeOf(
  type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function',
): Transformer<unknown, any> {
  if (transformerCache.has(type)) return transformerCache.get(type)!
  const transform = (u: unknown) =>
    typeof u === type ? ok(u) : error(new ValidationTypeError([], type, toTypeName(u)))
  const transformer = new Transformer<unknown, any>(transform, transform)
  transformerCache.set(type, transformer)
  return transformer
}

export function instanceOf<A>(Clazz: { new (...args: any[]): A; name: string }): Transformer<unknown, A> {
  if (transformerCache.has(Clazz)) return transformerCache.get(Clazz)!
  const transform = (u: unknown) =>
    u instanceof Clazz ? ok(u) : error(new ValidationTypeError([], Clazz.name, toTypeName(u)))
  const transformer = new Transformer<unknown, A>(transform, transform)
  transformerCache.set(Clazz, transformer)
  return transformer
}

const noNullOrUndefined = (u: unknown) => (u != null ? ok(u) : error(new ValidationTypeError([], 'any', toTypeName(u))))

export const any = new Transformer<unknown, unknown>(noNullOrUndefined, noNullOrUndefined)

export const number = typeOf('number')
export const string = typeOf('string')
export const boolean = typeOf('boolean')
