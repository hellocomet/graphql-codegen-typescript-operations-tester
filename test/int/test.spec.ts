import { readFileSync } from 'fs'
import { buildSchema } from 'graphql'
import * as generated from './generated'

const schema = buildSchema(readFileSync(`${__dirname}/schema.graphql`, { encoding: 'utf-8' }))

describe('Test generated file', () => {
  it('testGetBooksQuery should exist', async () => {
    expect(generated).toHaveProperty('testGetBooksQuery')
  })

  it('testGetBooksQuery should return something', async () => {
    const res = await generated.testGetBooksQuery({ schema }, { var1: 'hello' })
    expect(generated).toHaveProperty('testGetBooksQuery')
    expect(res.data?.books).toBeNull()
    expect(res.errors).toBeUndefined()
  })
})
