interface ResultOps<T, E> {
  isOk(): this is ResultOk<T>
  isError(): this is ResultErr<E>
  unwrap(): T
}

export type Result<T, E> = ResultOk<T> | ResultErr<E>

export type ResultOk<T> = ResultOps<T, never> & {
  readonly value: T
}

export type ResultErr<E> = ResultOps<never, E> & {
  readonly error: E
}

class ResultOkImpl<T> implements ResultOk<T> {
  constructor(readonly value: T) {}

  isOk() {
    return true
  }

  isError() {
    return false
  }

  unwrap() {
    return this.value
  }
}

class ResultErrImpl<E> implements ResultErr<E> {
  constructor(readonly error: E) {}

  isOk() {
    return false
  }

  isError() {
    return true
  }

  unwrap(): never {
    throw this.error
  }
}

export const Result = {
  ok<T>(value: T): ResultOk<T> {
    return new ResultOkImpl(value)
  },
  err<E>(error: E): ResultErr<E> {
    return new ResultErrImpl(error)
  },
} as const
