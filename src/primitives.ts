import { Transformer } from './transformer'
import { ok, error } from './result'
import { ValidationTypeError, ValidationNaNError, ValidationError } from './errors'
import { toTypeName } from './util'

export function instanceOf<A>(Clazz: { new (...args: any[]): A }): Transformer<unknown, A> {
  const transform = (u: unknown) =>
    u instanceof Clazz ? ok(u) : error(ValidationError.from(new ValidationTypeError(Clazz.name, toTypeName(u))))
  const transformer = Transformer.from<unknown, A>(transform)
  return transformer
}

export function literal<LS extends string[]>(...literals: LS): Transformer<unknown, LS[number]> {
  const expectedTypeStr = literals.map(l => `'${l}'`).join(' | ')
  const transform = (u: unknown) => {
    if (typeof u !== 'string')
      return error(ValidationError.from(new ValidationTypeError(expectedTypeStr, toTypeName(u))))
    if (!literals.includes(u)) return error(ValidationError.from(new ValidationTypeError(expectedTypeStr, `'${u}'`)))
    return ok(u as LS[number])
  }
  return Transformer.from<unknown, LS[number]>(transform)
}

const noNullOrUndefined = (u: unknown) =>
  u != null ? ok(u) : error(ValidationError.from(new ValidationTypeError('any', toTypeName(u))))

export const any = Transformer.from<unknown, unknown>(noNullOrUndefined)

export const number = Transformer.from<unknown, number>(u => {
  const n = u instanceof Number ? u.valueOf() : u
  if (typeof n !== 'number') {
    return error(ValidationError.from(new ValidationTypeError('number', toTypeName(u))))
  }
  if (Number.isNaN(n)) {
    return error(ValidationError.from(new ValidationNaNError()))
  }
  return ok(n)
})

export const string = Transformer.from<unknown, string>(u => {
  const s = u instanceof String ? u.valueOf() : u
  if (typeof s !== 'string') {
    return error(ValidationError.from(new ValidationTypeError('string', toTypeName(u))))
  }
  return ok(s)
})

export const boolean = Transformer.from<unknown, boolean>(u => {
  const b = u instanceof Boolean ? u.valueOf() : u
  if (typeof b !== 'boolean') {
    return error(ValidationError.from(new ValidationTypeError('boolean', toTypeName(u))))
  }
  return ok(b)
})
