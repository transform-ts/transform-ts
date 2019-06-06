import * as $ from '../primitives'
import { ValidationTypeError } from '../errors'
import { ok, error } from '../result'

describe('any', () => {
  it('alllows all values except `undefined` and `null`', () => {
    expect($.any.transform(10)).toEqual(ok(10))
    expect($.any.transform('str')).toEqual(ok('str'))
    expect($.any.transform(true)).toEqual(ok(true))
    expect($.any.transform(null)).toEqual(error(new ValidationTypeError([], 'any', 'null')))
    expect($.any.transform(undefined)).toEqual(error(new ValidationTypeError([], 'any', 'undefined')))

    expect($.any.inverseTransform(10)).toEqual(ok(10))
    expect($.any.inverseTransform('str')).toEqual(ok('str'))
    expect($.any.inverseTransform(true)).toEqual(ok(true))
    expect($.any.inverseTransform(null)).toEqual(error(new ValidationTypeError([], 'any', 'null')))
    expect($.any.inverseTransform(undefined)).toEqual(error(new ValidationTypeError([], 'any', 'undefined')))
  })
})

describe('number', () => {
  it('allows numeric values', () => {
    expect($.number.transform(10)).toEqual(ok(10))
    expect($.number.transform('10')).toEqual(error(new ValidationTypeError([], 'number', 'string')))
  })
})

describe('string', () => {
  it('allows string values', () => {
    expect($.string.transform('str')).toEqual(ok('str'))
    expect($.string.transform(10)).toEqual(error(new ValidationTypeError([], 'string', 'number')))
  })
})

describe('boolean', () => {
  it('allows boolean values', () => {
    expect($.boolean.transform(true)).toEqual(ok(true))
    expect($.boolean.transform(false)).toEqual(ok(false))
    expect($.boolean.transform(10)).toEqual(error(new ValidationTypeError([], 'boolean', 'number')))
  })
})
