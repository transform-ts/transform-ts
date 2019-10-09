import { ValidationResult, isOk } from './result'
import { ValidationErrors } from './errors'

type TransformFn<A, B> = (x: A) => ValidationResult<B>

export class Transformer<A, B> {
  private _transformer: TransformFn<A, B>

  constructor(transformer: TransformFn<A, B>) {
    this._transformer = transformer
  }

  transform(x: A): ValidationResult<B> {
    return this._transformer(x)
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
    return new Transformer<A, C>(
      a => {
        const r = this.transform(a)
        return isOk(r) ? fbc.transform(r.value) : r
      },
    )
  }
}
