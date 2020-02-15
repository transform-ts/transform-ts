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
  if (typeof u !== 'number') {
    return error(ValidationError.from(new ValidationTypeError('number', toTypeName(u))))
  }
  if (Number.isNaN(u)) {
    return error(ValidationError.from(new ValidationNaNError()))
  }
  return ok(u)
})

export const string = Transformer.from<unknown, string>(u => {
  if (typeof u !== 'string') {
    return error(ValidationError.from(new ValidationTypeError('string', toTypeName(u))))
  }
  return ok(u)
})

export const boolean = Transformer.from<unknown, boolean>(u => {
  if (typeof u !== 'boolean') {
    return error(ValidationError.from(new ValidationTypeError('boolean', toTypeName(u))))
  }
  return ok(u)
})
