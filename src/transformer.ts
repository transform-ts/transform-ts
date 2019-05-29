import { ValidationResult, isOk } from './result'
import { CombinedValidationError } from './error';

type Transformer<A, B> = (x: A) => ValidationResult<B>

export class BiTransformer<A, B> {
  private _transformer: Transformer<A, B>
  private _inverseTransformer: Transformer<B, A>

  constructor(transformer: Transformer<A, B>, inverseTransformer: Transformer<B, A>) {
    this._transformer = transformer
    this._inverseTransformer = inverseTransformer
  }

  transform(x: A): ValidationResult<B> {
    return this._transformer(x)
  }

  transformOrThrow(x: A): B {
    const r = this.transform(x)
    if(isOk(r)) {
      return r.value
    } else {
      throw new CombinedValidationError(r.errors)
    }
  }

  inverseTransform(x: B): ValidationResult<A> {
    return this._inverseTransformer(x)
  }

  inverseTransformOrThrow(x: B): A {
    const r = this.inverseTransform(x)
    if(isOk(r)) {
      return r.value
    } else {
      throw new CombinedValidationError(r.errors)
    }
  }

  invert(): BiTransformer<B, A> {
    return new BiTransformer(this._inverseTransformer, this._transformer)
  }

  compose<C>(fbc: BiTransformer<B, C>): BiTransformer<A, C> {
    return new BiTransformer<A, C>(
      a => {
        const r = this.transform(a)
        return isOk(r) ? fbc.transform(r.value) : r
      },
      c => {
        const r = fbc.inverseTransform(c)
        return isOk(r) ? this.inverseTransform(r.value) : r
      },
    )
  }
}
