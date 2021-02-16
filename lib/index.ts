import { PluginFunction } from '@graphql-codegen/plugin-helpers'
import {
  concatAST,
  DocumentNode,
  FragmentDefinitionNode,
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
  const imports = [`import { graphql, ExecutionResult } from 'graphql'`]

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
      const name = `${node.name.value[0].toUpperCase()}${node.name.value.substr(
        1,
        node.name.value.length - 1
      )}`

      const fragments = getOperationFragments(node, allFragments)
      const fragmentsStr =
        fragments.size > 0 ? `${Array.from(fragments.values()).map(print)}\n` : ''

      lines.push(``)
      lines.push(`export const ${name}${type}Source: string = \``)
      lines.push(`${fragmentsStr}${print(node)}\`;`)
      lines.push(``)
      lines.push(`export function test${name}${type}(`)
      lines.push(`  graphqlRequester: (`)
      lines.push(`    query: string,`)
      lines.push(`    variables: ${name}${type}Variables`)
      lines.push(`  ) => Promise<ExecutionResult<${name}${type}>>,`)
      lines.push(`  variables: ${name}${type}Variables`)
      lines.push(`) {`)
      lines.push(`  const query = ${name}${type}Source`)
      lines.push(`  return graphqlRequester(query, variables)`)
      lines.push(`};`)
    },
  })

  const content = lines.join('\n')

  return {
    prepend: imports,
    content: content,
  }
}
