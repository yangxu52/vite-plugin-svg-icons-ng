declare module 'css-tree' {
  export type CssNode = {
    type: string
    [key: string]: unknown
  }

  export function parse(
    css: string,
    options?: {
      parseValue?: boolean
      parseCustomProperty?: boolean
    }
  ): CssNode

  export function walk(ast: CssNode, visitor: (node: CssNode) => void): void

  export function generate(ast: CssNode): string
}
