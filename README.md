# graphql-codegen-typescript-operations-tester

[![Version](https://img.shields.io/npm/v/graphql-codegen-typescript-operations-tester.svg)](https://www.npmjs.com/package/graphql-codegen-typescript-operations-tester)
![Test workflow](https://github.com/hellocomet/graphql-codegen-typescript-operations-tester/workflows/Tests/badge.svg?branch=main)
![Release workflow](https://github.com/hellocomet/graphql-codegen-typescript-operations-tester/workflows/Release%20package/badge.svg)

## Install

`npm i -D @graphql-codegen/typescript @graphql-codegen/typescript-operations graphql-codegen-typescript-operations-tester`

## Example

codegen.yml

```yaml
schema: ['./schema.graphql']

generated/tests.ts:
  documents: './documents.graphql'
  plugins:
    - typescript
    - typescript-operations
    - graphql-codegen-typescript-operations-tester
  config:
    prefix: test
```

schema.graphql

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

documents.graphql

```graphql
query getBooks($var1: String!) {
  books(var1: $var1) {
    title
    author {
      firstname
      lastname
      fullname
    }
  }
}
```

test.spec.ts

```typescript
import { testGetBooksQuery } from './generated/tests.ts'
import { schema } from 'path/to/my/schema'

describe('Test something cool', () => {
  it('testGetBooksQuery should return something', async () => {
    const res = await testGetBooksQuery({ schema }, { var1: 'hello' })
    expect(res.data?.books).toBeAwesome()
  })
})
```
