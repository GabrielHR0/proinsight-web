import { describe, it, expect } from 'vitest'
import { loginSchema, registerUserSchema, registerAcademiaSchema } from '@/types/auth'

describe('loginSchema', () => {
  it('accepts email and password', () => {
    const result = loginSchema.safeParse({ login: 'user@test.com', password: '123' })
    expect(result.success).toBe(true)
  })

  it('accepts username and password', () => {
    const result = loginSchema.safeParse({ login: 'joao', password: '123' })
    expect(result.success).toBe(true)
  })

  it('rejects empty login', () => {
    const result = loginSchema.safeParse({ login: '', password: '123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('login')
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ login: 'user@test.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })
})

describe('registerUserSchema (sem academia)', () => {
  const validUser = {
    email: 'user@test.com',
    password: '12345678',
    userName: 'joao',
    confirmPassword: '12345678',
    cref: 'CREF-123',
    cpf: '11122233344',
  }

  it('accepts valid user data', () => {
    const result = registerUserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerUserSchema.safeParse({ ...validUser, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('rejects empty confirmPassword', () => {
    const result = registerUserSchema.safeParse({ ...validUser, confirmPassword: '' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = registerUserSchema.safeParse({ ...validUser, password: '1234567' })
    expect(result.success).toBe(false)
  })

  it('rejects userName shorter than 2 characters', () => {
    const result = registerUserSchema.safeParse({ ...validUser, userName: 'a' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerUserSchema.safeParse({ ...validUser, email: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects missing cref', () => {
    const result = registerUserSchema.safeParse({ ...validUser, cref: undefined })
    expect(result.success).toBe(false)
  })

  it('rejects missing cpf', () => {
    const result = registerUserSchema.safeParse({ ...validUser, cpf: undefined })
    expect(result.success).toBe(false)
  })

  it('strips extra fields like academiaNome', () => {
    const result = registerUserSchema.safeParse({ ...validUser, academiaNome: 'Acad' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('academiaNome')
    }
  })
})

describe('registerAcademiaSchema (com academia)', () => {
  const validAcademia = {
    email: 'user@test.com',
    password: '12345678',
    userName: 'joao',
    confirmPassword: '12345678',
    cref: 'CREF-123',
    cpf: '11122233344',
    academiaNome: 'Academia Teste',
  }

  it('accepts valid academia register data', () => {
    const result = registerAcademiaSchema.safeParse(validAcademia)
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('accepts optional cnpj', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, cnpj: '12.345.678/0001-90' })
    expect(result.success).toBe(true)
  })

  it('accepts optional razaoSocial, telefone', () => {
    const result = registerAcademiaSchema.safeParse({
      ...validAcademia,
      razaoSocial: 'Academia LTDA',
      telefone: '(11) 99999-9999',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional endereco with all fields', () => {
    const result = registerAcademiaSchema.safeParse({
      ...validAcademia,
      endereco: { rua: 'Rua X', numero: '123', cidade: 'SP', estado: 'SP', cep: '01234-567' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects endereco with missing required fields', () => {
    const result = registerAcademiaSchema.safeParse({
      ...validAcademia,
      endereco: { rua: 'Rua X' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty academiaNome', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, academiaNome: '' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, password: '1234567' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, email: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects missing cref', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, cref: undefined })
    expect(result.success).toBe(false)
  })

  it('rejects missing cpf', () => {
    const result = registerAcademiaSchema.safeParse({ ...validAcademia, cpf: undefined })
    expect(result.success).toBe(false)
  })
})
