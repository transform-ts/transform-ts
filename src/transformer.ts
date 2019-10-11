import { ValidationResult, isOk, ok } from './result'
import { ValidationErrors } from './errors'

type TransformFn<A, B> = (x: A) => ValidationResult<B>

export type Validator<A> = Transformer<A, A>

export const identity = <A>() => Transformer.from<A, A>(ok)

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
      if(r.type === 'error') return r
      return f(r.value).transform(a)
    })
  }

  assert(validator: Validator<B>): Transformer<A, B> {
    return this.compose(validator)
  }

  when(cond: (x: B) => boolean, validator: Validator<B>): Transformer<A, B> {
    return this.compose(Transformer.from(b => cond(b) ? validator.transform(b) : ok(b)))
  }

  unless(cond: (x: B) => boolean, validator: Validator<B>): Transformer<A, B> {
    return this.compose(Transformer.from(b => cond(b) ? ok(b) : validator.transform(b)))
  }
}
