export const toTypeName = (u: unknown) => {
  if (typeof u !== 'object') return typeof u
  if (u === null) return 'null'
  const str = Object.prototype.toString.apply(u)
  return /^\[object (.+)\]$/.exec(str)![1]
}
