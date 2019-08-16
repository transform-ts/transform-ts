import { ValidationError } from '..'

describe('ValidationError', () => {
  describe('.pathString', () => {
    it('represents the "path" of object that the error occured', () => {
      expect(new ValidationError([], new Error()).pathString).toBe('<root>')
      expect(new ValidationError(['hoge'], new Error()).pathString).toBe('hoge')
      expect(new ValidationError(['hoge', '_piyo'], new Error()).pathString).toBe('hoge._piyo')
      expect(new ValidationError(['hoge', '_piyo', '-foo'], new Error()).pathString).toBe('hoge._piyo["-foo"]')
      expect(new ValidationError(['hoge', '_piyo', '-foo', 1], new Error()).pathString).toBe('hoge._piyo["-foo"][1]')
    })
  })
})
