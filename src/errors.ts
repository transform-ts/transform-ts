export class ValidationError extends Error {
  constructor(readonly type: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ValidationTypeError extends ValidationError {
  constructor(readonly expect: string, readonly real: string) {
    super('TypeError', `expect '${expect}', but got '${real}`)
    this.name = 'ValidationTypeError'
  }
}

export class ValidationMemberError extends ValidationError {
  constructor(readonly paths: Array<string | number>) {
    super('MemberError', presentMemberErrorMessage(paths))
    this.name = 'ValidationMemberError'
  }
}

function presentMemberErrorMessage(paths: Array<string | number>) {
  const path = paths
    .map((p, i) => {
      if (typeof p === 'string') {
        if (i === 0) return p
        return `.${p}`
      } else {
        return `[${p}]`
      }
    })
    .join('')
  return `'${path}' is not found.`
}

export class ValidationErrors extends Error {
  constructor(readonly errors: ReadonlyArray<ValidationError>) {
    super('\n' + errors.map(e => `${e.type}: ${e.message}`).join('\n'))
    this.name = 'ValidationErrors'
  }
}
