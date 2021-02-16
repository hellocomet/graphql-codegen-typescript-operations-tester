import { readFileSync } from 'fs'
import { buildSchema, graphql, GraphQLSchema } from 'graphql'
import * as generated from './generated'

const schema = buildSchema(readFileSync(`${__dirname}/schema.graphql`, { encoding: 'utf-8' }))

function graphqlRequester(schema: GraphQLSchema) {
  return async (query: string, variables?: null | undefined | Record<string, unknown>) => {
    const res = await graphql({
      variableValues: variables,
      schema,
      source: query,
    })
    return res
  }
}

describe('Test generated file', () => {
  it('testGetBooksQuery should exist', async () => {
    expect(generated).toHaveProperty('testGetBooksQuery')
  })

  it('testGetBooksQuery should return something', async () => {
    const res = await generated.testGetBooksQuery(graphqlRequester(schema), {})
    expect(generated).toHaveProperty('testGetBooksQuery')
    expect(res.data?.books).toBeNull()
    expect(res.errors).toBeUndefined()
  })
})
