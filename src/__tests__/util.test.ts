import { toTypeName } from '../util'

describe('toTypeName', () => {
  it('returns `typeof` value if `typeof value` is not `object`', () => {
    expect(toTypeName('str')).toBe('string')
    expect(toTypeName(100)).toBe('number')
    expect(toTypeName(10n)).toBe('bigint')
    expect(toTypeName(true)).toBe('boolean')
    expect(toTypeName(Symbol.iterator)).toBe('symbol')
    expect(toTypeName(undefined)).toBe('undefined')
    expect(toTypeName(() => {})).toBe('function')
  })

  it('returns `null` if value is null', () => {
    expect(toTypeName(null)).toBe('null')
  })

  it('returns a class name of value if value is an instance of a named class', () => {
    expect(toTypeName(new Date())).toBe('Date')
    expect(toTypeName(new (class A {})())).toBe('A')
    expect(toTypeName({})).toBe('Object')
  })

  it('returns `Object` if could not detect a typename', () => {
    expect(toTypeName(Object.create(null))).toBe('Object')
    expect(toTypeName(new (class {})())).toBe('Object')
  })
})
