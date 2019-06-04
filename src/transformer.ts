import { ValidationResult, isOk } from "./result";
import { ValidationErrors } from "./errors";

type TransformFn<A, B> = (x: A) => ValidationResult<B>;

export class Transformer<A, B> {
  private _transformer: TransformFn<A, B>;
  private _inverseTransformer: TransformFn<B, A>;

  constructor(
    transformer: TransformFn<A, B>,
    inverseTransformer: TransformFn<B, A>
  ) {
    this._transformer = transformer;
    this._inverseTransformer = inverseTransformer;
  }

  transform(x: A): ValidationResult<B> {
    return this._transformer(x);
  }

  transformOrThrow(x: A): B {
    const r = this.transform(x);
    if (isOk(r)) {
      return r.value;
    } else {
      throw new ValidationErrors(r.errors);
    }
  }

  inverseTransform(x: B): ValidationResult<A> {
    return this._inverseTransformer(x);
  }

  inverseTransformOrThrow(x: B): A {
    const r = this.inverseTransform(x);
    if (isOk(r)) {
      return r.value;
    } else {
      throw new ValidationErrors(r.errors);
    }
  }

  invert(): Transformer<B, A> {
    return new Transformer(this._inverseTransformer, this._transformer);
  }

  compose<C>(fbc: Transformer<B, C>): Transformer<A, C> {
    return new Transformer<A, C>(
      a => {
        const r = this.transform(a);
        return isOk(r) ? fbc.transform(r.value) : r;
      },
      c => {
        const r = fbc.inverseTransform(c);
        return isOk(r) ? this.inverseTransform(r.value) : r;
      }
    );
  }
}
