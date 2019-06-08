export const toTypeName = (u: unknown) => {
  if (typeof u !== 'object') return typeof u
  if (u === null) return 'null'
  if ('constructor' in u) {
    return u.constructor.name
  }
  const str = Object.prototype.toString.apply(u)
  return /^\[object (.+)\]$/.exec(str)![1]
}
