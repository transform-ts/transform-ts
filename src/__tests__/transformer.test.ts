import { Transformer, ValidationError, ok, error } from '..'
import { identity } from '../transformer'

describe('Transformer', () => {
  let transformer: Transformer<string, number>

  beforeAll(() => {
    transformer = Transformer.from<string, number>(s => {
      const r = parseInt(s, 10)
      if (isNaN(r)) return error(ValidationError.from('Invalid Input'))
      return ok(r)
    })
  })

  it('transforms value', () => {
    expect(transformer.transform('10')).toEqual(ok(10))
  })

  it('return errors when error is occured', () => {
    expect(transformer.transform('ten')).toEqual(error(ValidationError.from('Invalid Input')))
  })

  it('can be composed', () => {
    const numToBool = Transformer.from<number, boolean>(n => ok(!!n))
    const composed = transformer.compose(numToBool)

    expect(composed.transform('10')).toEqual(ok(true))
    expect(composed.transform('ten')).toEqual(error(ValidationError.from('Invalid Input')))
  })

  describe('with', () => {
    it('selects transformers with an input value', () => {
      const stringToNumber = Transformer.with<string, number>(str =>
        str.startsWith('0x')
          ? Transformer.from(s => ok(parseInt(s.slice(2), 16)))
          : Transformer.from(s => ok(parseInt(s, 10))),
      )
      expect(stringToNumber.transform('10')).toEqual(ok(10))
      expect(stringToNumber.transform('0x10')).toEqual(ok(0x10))
    })
  })

  describe('.chain', () => {
    it('chains a transformer', () => {
      const stringToNumber = identity<string>().chain(str =>
        str.startsWith('0x')
          ? Transformer.from(s => ok(parseInt(s.slice(2), 16)))
          : Transformer.from(s => ok(parseInt(s, 10))),
      )

      expect(stringToNumber.transform('10')).toEqual(ok(10))
      expect(stringToNumber.transform('0x10')).toEqual(ok(0x10))
    })
  })

  test('Associative Law', () => {
    type A = ['a', number]
    type B = ['b', number]
    type C = ['c', number]
    type D = ['d', number]

    // f: A→B, g: B→C, h: C→D
    const f = Transformer.from<A, B>(a => ok(['b', a[1]]))
    const g = Transformer.from<B, C>(b => ok(['c', b[1]]))
    const h = Transformer.from<C, D>(c => ok(['d', c[1]]))

    // t1 =  f∘(g∘h)
    const t1 = f.compose(g.compose(h))
    // t2 = (f∘g)∘h
    const t2 = f.compose(g).compose(h)

    // t1 ≡ t2
    expect(t1.transform(['a', 10])).toEqual(ok(['d', 10]))
    expect(t2.transform(['a', 10])).toEqual(ok(['d', 10]))
  })

  test('Identity Law', () => {
    type A = ['a', number]
    type B = ['b', number]

    // f: A→B
    const f = Transformer.from<A, B>(a => ok(['b', a[1]]))

    const idA = Transformer.from<A, A>(ok)
    const idB = Transformer.from<B, B>(ok)

    // t1 = idA∘f
    const t1 = idA.compose(f)
    // t2 = f∘idB
    const t2 = f.compose(idB)

    // t1 ≡ f ≡ t2
    expect(t1.transform(['a', 10])).toEqual(ok(['b', 10]))
    expect(f.transform(['a', 10])).toEqual(ok(['b', 10]))
    expect(t2.transform(['a', 10])).toEqual(ok(['b', 10]))
  })
})
