/*import { ValidationResult, isOk, ok } from './result'
import { ValidationErrors } from './errors'

type TransformFn<A, B> = (x: A) => ValidationResult<B>

export type Validator<A> = Transformer<A, A>

export const identity = <A>() => Transformer.from<A, A>(ok)

export namespace Transformer {
  export type TypeOf<T> = T extends Transformer<any, infer B> ? B : never
}

export class Transformer<A, B> {
  static from<A, B>(f: TransformFn<A, B>): Transformer<A, B> {
    return new Transformer([f])
  }
  static with<A, B>(f: (x: A) => Transformer<A, B>): Transformer<A, B> {
    return Transformer.from(a => f(a).transform(a))
  }

  private constructor(protected _transformers: TransformFn<any, any>[]) {}

  transform(x: A): ValidationResult<B> {
    let result: any = x
    for (let i = 0; i < this._transformers.length; i++) {
      const r = this._transformers[i](result)
      if (r.type === 'error') return r
      result = r.value
    }
    return ok(result)
  }

  transformOrThrow(x: A): B {
    const r = this.transform(x)
    if (isOk(r)) {
      return r.value
    } else {
      throw new ValidationErrors(r.errors)
    }
  }

  compose<C>(fbc: Transformer<B, C>): Transformer<A, C> {
    return new Transformer<A, C>([...this._transformers, ...fbc._transformers])
  }

  chain<C>(f: (x: B) => Transformer<A, C>): Transformer<A, C> {
    return Transformer.from(a => {
      const r = this.transform(a)
      if (r.type === 'error') return r
      return f(r.value).transform(a)
    })
  }

  assert(validator: Validator<B>): Transformer<A, B> {
    return this.compose(validator)
  }

  when(cond: (x: B) => boolean, validator: Validator<B>): Transformer<A, B> {
    return this.compose(Transformer.from(b => (cond(b) ? validator.transform(b) : ok(b))))
  }

  unless(cond: (x: B) => boolean, validator: Validator<B>): Transformer<A, B> {
    return this.compose(Transformer.from(b => (cond(b) ? ok(b) : validator.transform(b))))
  }
}
*/

import { Result } from './result'

export type Transformer<I, O, E = unknown> = (source: I) => Result<O, E>

export namespace Transformer {
  export type TypeOf<T> = T extends Transformer<any, infer D, any> ? D : never
  export type InputTypeOf<T> = T extends Transformer<infer S, any, any> ? S : never
  export type ErrorOf<T> = T extends Transformer<any, any, infer E> ? E : never
}

type Tail<XS extends any[]> = ((...xs: XS) => void) extends (head: any, ...tail: infer Tail) => void ? Tail : never

type Last<XS extends any[]> = {
  0: never
  1: XS[0]
  2: Last<Tail<XS>>
}[XS extends [] ? 0 : XS extends [any] ? 1 : 2]

export function compose<T0, T1, E1>(f1: Transformer<T0, T1, E1>): Transformer<T0, T1, E1>
export function compose<T0, T1, E1, T2, E2>(
  f1: Transformer<T0, T1, E1>,
  f2: Transformer<T1, T2, E2>,
): Transformer<T0, T2, E1 | E2>
export function compose<T0, T1, E1, T2, E2, T3, E3>(
  f1: Transformer<T0, T1, E1>,
  f2: Transformer<T1, T2, E2>,
  f3: Transformer<T2, T3, E3>,
): Transformer<T0, T3, E1 | E2 | E3>
export function compose<T0, T1, E1, T2, E2, T3, E3, T4, E4>(
  f1: Transformer<T0, T1, E1>,
  f2: Transformer<T1, T2, E2>,
  f3: Transformer<T2, T3, E3>,
  f4: Transformer<T3, T4, E4>,
): Transformer<T0, T4, E1 | E2 | E3 | E4>
export function compose<T0, T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(
  f1: Transformer<T0, T1, E1>,
  f2: Transformer<T1, T2, E2>,
  f3: Transformer<T2, T3, E3>,
  f4: Transformer<T3, T4, E4>,
  f5: Transformer<T4, T5, E5>,
): Transformer<T0, T5, E1 | E2 | E3 | E4 | E5>
export function compose<TS extends [Transformer<any, any, any>, ...Transformer<any, any, any>[]]>(
  ...fs: TS
): Transformer<
  Transformer.InputTypeOf<TS[0]>,
  Last<{ [P in keyof TS]: Transformer.TypeOf<TS[P]> }>,
  Transformer.ErrorOf<TS[number]>
> {
  return source =>
    fs.reduce((val, f) => {
      if (val.isOk()) {
        return f(val.value)
      } else {
        return val
      }
    }, Result.ok(source) as Result<any, any>)
}
