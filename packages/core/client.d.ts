type EmptyObject = { readonly [key: string]: never }

declare module 'virtual:svg-icons-register' {
  const src: EmptyObject
  export default src
}

declare module 'virtual:svg-icons-names' {
  const src: string[]
  export default src
}
