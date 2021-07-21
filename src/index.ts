import { PluginFunction } from '@graphql-codegen/plugin-helpers'
import { pascalCase } from 'change-case-all'
import {
  concatAST,
  DocumentNode,
  ExecutionResult,
  FragmentDefinitionNode,
  graphql,
  GraphQLArgs,
  GraphQLSchema,
  OperationDefinitionNode,
  print,
  visit,
} from 'graphql'

function getOperationFragments(
  node: OperationDefinitionNode | FragmentDefinitionNode,
  allFragments: Map<string, FragmentDefinitionNode>,
  operationFragments?: Map<string, FragmentDefinitionNode>
): Map<string, FragmentDefinitionNode> {
  const fragments = operationFragments || new Map<string, FragmentDefinitionNode>()
  visit(node, {
    FragmentSpread: {
      enter(node) {
        const fragment = allFragments.get(node.name.value)
        if (fragment) {
          fragments.set(node.name.value, fragment)
          getOperationFragments(fragment, allFragments, fragments)
        } else {
          throw new Error('Unknown fragment: ' + node.name.value)
        }
      },
    },
  })

  return fragments
}

export const plugin: PluginFunction = (schema, documents) => {
  const imports = [`import { request, Args } from 'graphql-codegen-typescript-operations-tester'`]

  const allAst = concatAST(
    documents.reduce<DocumentNode[]>((acc, source) => {
      if (source.document) {
        acc.push(source.document)
      }
      return acc
    }, [])
  )
  const allFragments = new Map<string, FragmentDefinitionNode>()
  visit(allAst, {
    FragmentDefinition(node) {
      allFragments.set(node.name.value, node)
    },
  })

  const lines: string[] = []
  visit(allAst, {
    OperationDefinition(node) {
      if (!node.name) return

      const type = node.operation === 'mutation' ? 'Mutation' : 'Query'

      // Mimic the default naming convention.
      // See https://www.graphql-code-generator.com/docs/getting-started/naming-convention#namingconvention
      const name = pascalCase(`${node.name.value}${type}`)

      const fragments = getOperationFragments(node, allFragments)
      const fragmentsStr =
        fragments.size > 0 ? `${Array.from(fragments.values()).map(print)}\n` : ''

      lines.push(``)
      lines.push(`export const ${name}Source: string = \``)
      lines.push(`${fragmentsStr}${print(node)}\`;`)
      lines.push(``)
      lines.push(`export function test${name}(`)
      lines.push(`  graphqlArgs: Args,`)
      lines.push(`  variables?: ${name}Variables`)
      lines.push(`) {`)
      lines.push(
        `  return request<${name}>({ ...graphqlArgs, source: ${name}Source, variableValues: variables })`
      )
      lines.push(`};`)
    },
  })

  const content = lines.join('\n')

  return {
    prepend: imports,
    content: content,
  }
}

export type Args = { schema: GraphQLSchema } & Partial<GraphQLArgs>

export async function request<TData extends Record<string, unknown> = Record<string, unknown>>(
  graphqlArgs: GraphQLArgs
): Promise<ExecutionResult<TData>> {
  return graphql(graphqlArgs) as Promise<ExecutionResult<TData>>
}
