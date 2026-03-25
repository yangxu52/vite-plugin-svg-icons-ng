type EmptyObject = { readonly [key: string]: never }

/**
 * @deprecated since v1.3.0, use `virtual:svg-icons/register` instead.
 * Will be removed in v2.0.0.
 */
declare module 'virtual:svg-icons-register' {
  const src: EmptyObject
  export default src
}

declare module 'virtual:svg-icons/register' {
  const src: EmptyObject
  export default src
}

/**
 * @deprecated since v1.3.0, use `virtual:svg-icons/ids` instead.
 * Will be removed in v2.0.0.
 */
declare module 'virtual:svg-icons-names' {
  const src: string[]
  export default src
}
declare module 'virtual:svg-icons/ids' {
  const src: string[]
  export default src
}

declare module 'virtual:svg-icons/sprite' {
  const src: string
  export default src
}
