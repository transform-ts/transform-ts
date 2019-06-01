# Transform.ts

# Usage

## Transformer

`Transformer<A,B>` has `A` to `B` transformation.
It also has `B` to `A` (inverse) transformation.

### Transformation

```ts
import * as $ from 'transform-ts'

declare const fab: Transformer<A, B>

declare const validA: A
declare const invalidA: A

const result1: ValidationResult<B> = fab.transform(validA) // $.isOk(result1) === true
const result2: ValidationResult<B> = fab.transform(invalidA) // $.isError(result2) === true

const b1: B = fab.transformOrThrow(validA)
const b2: B = fab.transformOrThrow(invalidA) // Throw Error!
```

### Inversion

`Transformer<A,B>` can become `Transformer<B,A>`

```ts
declare const fab: Transformer<A, B>

const fba: Transformer<B, A> = fab.invert()
```

### Composition

`Transformer<A,B>` is composable to `Tranformer<B,C>`.

```ts
declare const fab: Transformer<A, B>
declare const fbc: Transformer<B, C>

const fac: Transformer<A, C> = fab.compose(fbc)
```

## Builtin Transformers

- `any: Transformer<unknown, unknown>`(validate that input value is not `undefined` or `null`)
- `number: Transformer<unknown, number>`
- `string: Transformer<unknown, string>`
- `boolean: Tranformer<unknown, boolean>`

```ts
const num = $.number.transformOrThrow(123 as unknown)
```

## Combinators

### `nullable`

converts `Transformer<A, B>` to `Transformer<A | null, B | null>`

```ts
declare const fab: Transformer<A, B>

const f: Transformer<A | null, B | null> = $.nullable(fab)
```

### `optional`

converts `Transformer<A, B>` to `Transformer<A | undefined, B | undefined>`

```ts
declare const fab: Transformer<A, B>

const f: Transformer<A | undefined, B | undefined> = $.optional(fab)
```

### `array`

converts `Transformer<unknown, A>` to `Transformer<unknown, A[]>`

```ts
const f: Transformer<unknown, number[]> = $.array($.number)
```

### `tuple`

```ts
const f: Transformer<unknown, [number, string]> = $.tuple($.number, $.string)
```

### `obj`

```ts
const f: Transformer<unknown, { a: number; b: string }> = $.obj({
  a: $.number,
  b: $.string,
})
```

## Example

user.json

```json
{
  "id": 9,
  "name": "a",
  "screenName": "ika",
  "application": {
    "id": 13,
    "name": "V",
    "isAutomated": false
  }
}
```

```ts
import * as $ from 'transform-ts'

const userTransformer: Transformer<
  unknown,
  {
    id: number
    name: string
    screenName: string
    application: {
      id: number
      name: string
      isAutomated: boolean | undefined
    }
  }
> = $.obj({
  id: $.number,
  name: $.string,
  screenName: $.string,
  application: $.obj({
    id: $.number,
    name: $.string,
    isAutomated: $.optional($.boolean),
  }),
})

const user = userTransformer.transformOrThrow(require('./user.json'))

const userJson = JSON.stringify(userTransformer.invert().transformOrThrow(user))
```

## Custom Transformer

// TODO
