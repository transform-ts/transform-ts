import { ValidationResult, isOk, ok } from './result'
import { ValidationErrors } from './errors'

type TransformFn<A, B> = (x: A) => ValidationResult<B>

export class Transformer<A, B> {
  static from<A, B>(f: TransformFn<A, B>): Transformer<A, B> {
    return new Transformer([f])
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
}
