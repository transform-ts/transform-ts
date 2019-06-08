export const toTypeName = (u: unknown) => {
  if (typeof u !== 'object') return typeof u
  if (u === null) return 'null'
  if ('constructor' in u) {
    const name = u.constructor.name
    if (name !== '' && name !== 'anonymous') return name
  }
  return 'Object'
}
