import { Transformer } from './transformer'
import { ok, error, combine, ValidationResult, isOk } from './result'
import { ValidationTypeError, ValidationError, ValidationMemberError } from './errors'
import { toTypeName } from './util'

export function optional<A, B>(fab: Transformer<A, B>): Transformer<A | undefined, B | undefined> {
  return new Transformer(
    a => (a === undefined ? ok(undefined) : fab.transform(a)),
    b => (b === undefined ? ok(undefined) : fab.inverseTransform(b)),
  )
}

export function nullable<A, B>(fab: Transformer<A, B>): Transformer<A | null, B | null> {
  return new Transformer(
    a => (a === null ? ok(null) : fab.transform(a)),
    b => (b === null ? ok(null) : fab.inverseTransform(b)),
  )
}

function processArrayItem<T>(r: ValidationResult<T>, i: number): ValidationResult<T> {
  if (isOk(r)) return r

  const errors = r.errors.map(err => err.addParent(i))
  return error(...errors)
}

export function array<A>(f: Transformer<unknown, A>): Transformer<unknown, A[]> {
  return new Transformer<unknown, A[]>(
    u =>
      Array.isArray(u)
        ? combine(u.map((v, i) => processArrayItem(f.transform(v), i)))
        : error(ValidationError.from(new ValidationTypeError('array', toTypeName(u)))),
    aa => combine(aa.map((a, i) => processArrayItem(f.inverseTransform(a), i))),
  )
}

class InvalidLengthError extends Error {
  constructor(readonly expect: number, readonly actual: number) {
    super(`expect ${expect}, but got ${actual}`)
    this.name = 'InvalidLengthError'
  }
}

type MapTransformer<A> = { [K in keyof A]: Transformer<unknown, A[K]> }
export function tuple<TS extends any[]>(...fs: MapTransformer<TS>): Transformer<unknown, TS> {
  return new Transformer<unknown, TS>(
    u => {
      if (!Array.isArray(u)) return error(ValidationError.from(new ValidationTypeError('array', toTypeName(u))))
      if (u.length !== fs.length) return error(ValidationError.from(new InvalidLengthError(fs.length, u.length)))
      return (combine(fs.map((f, i) => processArrayItem(f.transform(u[i]), i))) as unknown) as ValidationResult<TS>
    },
    ts => combine(fs.map((f, i) => processArrayItem(f.inverseTransform(ts[i]), i))),
  )
}

function processObjError(errors: ValidationError[], key: string): ValidationError[] {
  return errors.map(err => {
    if (err.error instanceof ValidationTypeError && err.error.actual === 'undefined') {
      return new ValidationError([key], new ValidationMemberError())
    }
    return err.addParent(key)
  })
}

export function obj<A>(schema: MapTransformer<A>): Transformer<unknown, A> {
  const s = (schema as unknown) as {
    [key: string]: Transformer<unknown, A[keyof A]>
  }
  return new Transformer<unknown, A>(
    (u: any) => {
      if (typeof u !== 'object') return error(ValidationError.from(new ValidationTypeError('object', toTypeName(u))))
      if (u === null) return error(ValidationError.from(new ValidationTypeError('object', 'null')))

      let obj: Record<string, unknown> = {}
      let errors: ValidationError[] = []
      for (const [k, f] of Object.entries(s)) {
        const r = f.transform(u[k])
        if (isOk(r)) {
          obj[k] = r.value
        } else {
          errors.push(...processObjError(r.errors, k))
        }
      }
      return errors.length === 0 ? ok(obj as A) : error(...errors)
    },
    (a: any) => {
      let obj: Record<string, unknown> = {}
      let errors: ValidationError[] = []
      for (const [k, f] of Object.entries(s)) {
        const r = f.inverseTransform(a[k])
        if (isOk(r)) {
          obj[k] = r.value
        } else {
          errors.push(...processObjError(r.errors, k))
        }
      }
      return errors.length === 0 ? ok(obj) : error(...errors)
    },
  )
}

export function either<
  TS extends [Transformer<A, any>, ...Transformer<A, any>[]],
  A = TS[0] extends Transformer<infer B, any> ? B : never
>(...fs: TS): Transformer<A, TS[number] extends Transformer<A, infer R> ? R : never> {
  return new Transformer(
    (a): ValidationResult<any> => {
      let result: ValidationResult<any>
      for (const f of fs) {
        result = f.transform(a)
        if (isOk(result)) return result
      }
      return result!
    },
    v => {
      let result: ValidationResult<A>
      for (const f of fs) {
        result = f.inverseTransform(v)
        if (isOk(result)) return result
      }
      return result!
    },
  )
}
