# graphql-codegen-typescript-operations-tester

[![Version](https://img.shields.io/npm/v/graphql-codegen-typescript-operations-tester.svg)](https://www.npmjs.com/package/graphql-codegen-typescript-operations-tester)
![Test workflow](https://github.com/hellocomet/graphql-codegen-typescript-operations-tester/workflows/Tests/badge.svg?branch=main)
![Release workflow](https://github.com/hellocomet/graphql-codegen-typescript-operations-tester/workflows/Release%20package/badge.svg)

## Install

`npm i -D @graphql-codegen/typescript @graphql-codegen/typescript-operations graphql-codegen-typescript-operations-tester`

In `codegen.yml`

```yaml
generated/tests.ts:
  plugins:
    - typescript
    - typescript-operations
    - graphql-codegen-typescript-operations-tester
```

Given a schema like so

```graphql
type Author {
  firstname: String
  lastname: String
  fullname: String
}

type Book {
  title: String
  author: Author
}

type Query {
  books: [Book]
}
```

Create a graphQL requester somewhere in your tests

```typescript
import { graphql, GraphQLSchema, ExecutionResult } from 'graphql'
import { testGetBooksQuery } from './generated/tests.ts'
import { schema } from 'path/to/my/schema'

type Options = {
  silenceError?: boolean
}

export function graphqlRequester<TResultDataType>(options: Options = {}) {
  return async (
    query: string,
    variables?: Record<string, any>
  ): Promise<ExecutionResult<TResultDataType>> => {
    const result = await graphql({
      variableValues: variables,
      schema,
      source: query,
    })

    if (!options.silenceError && result.errors?.length > 0) {
      result.errors.forEach((error) => console.error(error))
    }

    // Allow typing the return value of the query which is by default:
    // `Record<string, any>`.
    return result as ExecutionResult<TResultDataType>
  }
}

describe('Test something cool', () => {
  it('testGetBooksQuery should return something', async () => {
    const res = await testGetBooksQuery(graphqlRequester())
    expect(res.data?.books).toBeAwesome()
  })
})
```
