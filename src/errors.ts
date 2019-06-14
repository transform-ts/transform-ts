function presentPath(path: Array<string | number>): string {
  if (path.length === 0) return '<root>'
  return path
    .map((v, i) => {
      if (typeof v === 'string' && /^[a-zA-Z_]\w*$/.test(v)) {
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
      return new ValidationError([], error)
    }
    return new ValidationError([], new Error(`${error}`))
  }

  constructor(readonly path: Array<string | number>, readonly error: Error) {
    super(`in ${presentPath(path)}, ${error.name}: ${error.message}`)
    this.name = 'ValidationError'
  }

  get pathString(): string {
    return presentPath(this.path)
  }

  addParent(parent: string | number) {
    return new ValidationError([parent, ...this.path], this.error)
  }
}

export class ValidationTypeError extends Error {
  constructor(readonly expect: string, readonly actual: string) {
    super(`expect '${expect}', but got '${actual}'`)
    this.name = 'ValidationTypeError'
  }
}

export class ValidationMemberError extends Error {
  constructor() {
    super('not found')
    this.name = 'ValidationMemberError'
  }
}

export class ValidationErrors extends Error {
  constructor(readonly errors: ReadonlyArray<ValidationError>) {
    super('\n' + errors.map(e => e.message).join('\n'))
    this.name = 'ValidationErrors'
  }
}
