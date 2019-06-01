import { ValidationError } from './errors'

export type ResultOk<T> = { type: 'ok'; value: T }
export type ResultError<E> = { type: 'error'; errors: E[] }
export type Result<T, E> = ResultOk<T> | ResultError<E>

export function ok<T>(value: T): ResultOk<T> {
  return { type: 'ok', value }
}

export function error<E>(...errors: E[]): ResultError<E> {
  return { type: 'error', errors }
}

export function isOk<T, E>(result: Result<T, E>): result is ResultOk<T> {
  return result.type === 'ok'
}

export function isError<T, E>(result: Result<T, E>): result is ResultError<E> {
  return result.type === 'error'
}

export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = []
  const errors: E[] = []

  for (const result of results) {
    if (isOk(result)) {
      values.push(result.value)
    } else {
      errors.push(...result.errors)
    }
  }

  return errors.length === 0 ? ok(values) : error(...errors)
}

export type ValidationResult<T> = Result<T, ValidationError>
