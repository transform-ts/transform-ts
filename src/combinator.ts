import { BiTransformer } from './transformer'
import { ok, error, combine, ValidationResult, isOk } from './result'
import { ValidationTypeError, ValidationError, ValidationMemberError } from './error'

export function optional<A, B>(fab: BiTransformer<A, B>): BiTransformer<A | undefined, B | undefined> {
  return new BiTransformer(
    a => (a === undefined ? ok(undefined) : fab.transform(a)),
    b => (b === undefined ? ok(undefined) : fab.inverseTransform(b)),
  )
}

export function nullable<A, B>(fab: BiTransformer<A, B>): BiTransformer<A | null, B | null> {
  return new BiTransformer(
    a => (a === null ? ok(null) : fab.transform(a)),
    b => (b === null ? ok(null) : fab.inverseTransform(b)),
  )
}

function processArrayItem<T>(r: ValidationResult<T>, i: number): ValidationResult<T> {
  if (isOk(r)) return r

  const errors = r.errors.map(err => {
    if (err instanceof ValidationTypeError && err.real === 'undefined') {
      return new ValidationMemberError([i])
    }
    if (err instanceof ValidationMemberError) {
      return new ValidationMemberError([i, ...err.paths])
    }
    return err
  })
  return error(...errors)
}

export function array<A>(f: BiTransformer<unknown, A>): BiTransformer<unknown, A[]> {
  return new BiTransformer<unknown, A[]>(
    u =>
      Array.isArray(u)
        ? combine(u.map((v, i) => processArrayItem(f.transform(v), i)))
        : error(new ValidationTypeError('array', typeof u)),
    aa => combine(aa.map(a => f.inverseTransform(a))),
  )
}

type MapBiTransformer<A> = { [K in keyof A]: BiTransformer<unknown, A[K]> }
export function tuple<TS extends any[]>(...fs: MapBiTransformer<TS>): BiTransformer<unknown, TS> {
  return new BiTransformer<unknown, TS>(
    u => {
      if (!Array.isArray(u)) return error(new ValidationTypeError('array', typeof u))
      if (u.length !== fs.length)
        return error(new ValidationError('invalid-length', `expect ${fs.length}, but got ${u.length}`)) // TODO: Improve Error
      return (combine(fs.map((f, i) => f.transform(u[i]))) as unknown) as ValidationResult<TS>
    },
    ts => combine(fs.map((f, i) => f.inverseTransform(ts[i]))),
  )
}

function processObjError(errors: ValidationError[], key: string): ValidationError[] {
  return errors.map(err => {
    if (err instanceof ValidationTypeError && err.real === 'undefined') {
      return new ValidationMemberError([key])
    }
    if (err instanceof ValidationMemberError) {
      return new ValidationMemberError([key, ...err.paths])
    }
    return err
  })
}

export function obj<A>(schema: MapBiTransformer<A>): BiTransformer<unknown, A> {
  const s = (schema as unknown) as { [key: string]: BiTransformer<unknown, A[keyof A]> }
  return new BiTransformer<unknown, A>(
    (u: any) => {
      if (typeof u !== 'object') return error(new ValidationTypeError('object', typeof u))
      if (u === null) return error(new ValidationTypeError('object', 'null'))

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
      return errors.length === 0 ?  ok(obj as A) : error(...errors)
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
