import * as generated from './generated'
import { graphqlRequester } from '../../lib'

describe('Test generated file', () => {
  it('testGetBooksQuery should exist', async () => {
    expect(generated).toHaveProperty('testGetBooksQuery')
  })
  
  it('testGetBooksQuery should exist', async () => {
    generated.testGetBooksQuery(graphqlRequester(), {})
    expect(generated).toHaveProperty('testGetBooksQuery')
  })

})
