import { Transformer } from './transformer'
import { ok } from './result'
import { any, string, number } from './primitives'
import { array, optional, obj } from './combinators'

const input = {
  users: [{ name: 'kani' }, {}, {}],
}

const serde = obj({
  users: array(
    obj({
      name: string,
    }),
  ),
})

const parsed = serde.transformOrThrow(input)
console.log(parsed)
