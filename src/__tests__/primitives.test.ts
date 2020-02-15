import $, { ValidationError, ValidationTypeError, ok, error } from '..'

describe('instanceOf', () => {
  class A {}
  class EA extends A {}
  class B {}

  it('allows values which is an instance of provided class', () => {
    expect($.instanceOf(A).transform(new A())).toEqual(ok(new A()))
    expect($.instanceOf(A).transform(new EA())).toEqual(ok(new EA()))
  })

  it('disallows values which is not', () => {
    expect($.instanceOf(A).transform(new B())).toEqual(error(ValidationError.from(new ValidationTypeError('A', 'B'))))
  })
})

describe('literal', () => {
  it('allows strings which equal to one of provided strings', () => {
    expect($.literal('hoge', 'piyo').transform('hoge')).toEqual(ok('hoge'))
    expect($.literal('hoge', 'piyo').transform('piyo')).toEqual(ok('piyo'))
  })

  it('disallows values which is not', () => {
    expect($.literal('hoge').transform(1)).toEqual(
      error(ValidationError.from(new ValidationTypeError("'hoge'", 'number'))),
    )
    expect($.literal('hoge', 'piyo').transform('foo')).toEqual(
      error(ValidationError.from(new ValidationTypeError("'hoge' | 'piyo'", "'foo'"))),
    )
  })
})

describe('any', () => {
  it('alllows all values except `undefined` and `null`', () => {
    expect($.any.transform(10)).toEqual(ok(10))
    expect($.any.transform('str')).toEqual(ok('str'))
    expect($.any.transform(true)).toEqual(ok(true))
    expect($.any.transform(null)).toEqual(error(ValidationError.from(new ValidationTypeError('any', 'null'))))
    expect($.any.transform(undefined)).toEqual(error(ValidationError.from(new ValidationTypeError('any', 'undefined'))))
  })
})

describe('never', () => {
  it('disallows all values', () => {
    expect($.never.transform(10)).toEqual(error(ValidationError.from(new ValidationTypeError('never', 'number'))))
  })
})

describe('number', () => {
  it('allows numeric values', () => {
    expect($.number.transform(10)).toEqual(ok(10))
    expect($.number.transform(new Number(10))).toEqual(ok(10))
    expect($.number.transform('10')).toEqual(error(ValidationError.from(new ValidationTypeError('number', 'string'))))
  })
})

describe('string', () => {
  it('allows string values', () => {
    expect($.string.transform('str')).toEqual(ok('str'))
    expect($.string.transform(new String('str'))).toEqual(ok('str'))
    expect($.string.transform(10)).toEqual(error(ValidationError.from(new ValidationTypeError('string', 'number'))))
  })
})

describe('boolean', () => {
  it('allows boolean values', () => {
    expect($.boolean.transform(true)).toEqual(ok(true))
    expect($.boolean.transform(false)).toEqual(ok(false))
    expect($.boolean.transform(new Boolean(true))).toEqual(ok(true))
    expect($.boolean.transform(10)).toEqual(error(ValidationError.from(new ValidationTypeError('boolean', 'number'))))
  })
})
