function presentPath(path: Array<string | number>): string {
  if (path.length === 0) return '<root>'
  return path
    .map((v, i) => {
      if (typeof v === 'string' && /^[a-zA-Z]\w*$/.test(v)) {
        return i !== 0 ? `.${v}` : v
      } else {
        return `[${JSON.stringify(v)}]`
      }
    })
    .join('')
}

export class ValidationError extends Error {
  static from(error: unknown): ValidationError {
    if (error instanceof ValidationError) return error
    if (error instanceof Error) {
      return new ValidationError(error.name, [], error.message)
    }
    return new ValidationError(`<${typeof error}>`, [], `${error}`)
  }

  constructor(readonly type: string, readonly path: Array<string | number>, readonly description: string) {
    super(`in ${presentPath(path)}, ${type}: ${description}`)
    this.name = 'ValidationError'
  }

  addParent(parent: string | number) {
    return new ValidationError(this.type, [parent, ...this.path], this.description)
  }
}

export class ValidationTypeError extends ValidationError {
  constructor(readonly path: Array<string | number>, readonly expect: string, readonly real: string) {
    super('TypeError', path, `expect '${expect}', but got '${real}'`)
    this.name = 'ValidationTypeError'
  }

  addParent(parent: string | number) {
    return new ValidationTypeError([parent, ...this.path], this.expect, this.real)
  }
}

export class ValidationMemberError extends ValidationError {
  constructor(readonly path: Array<string | number>) {
    super('MemberError', path, 'not found')
    this.name = 'ValidationMemberError'
  }

  addParent(parent: string | number) {
    return new ValidationMemberError([parent, ...this.path])
  }
}

export class ValidationErrors extends Error {
  constructor(readonly errors: ReadonlyArray<ValidationError>) {
    super('\n' + errors.map(e => e.message).join('\n'))
    this.name = 'ValidationErrors'
  }
}
