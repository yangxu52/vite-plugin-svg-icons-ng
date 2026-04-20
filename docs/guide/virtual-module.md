# Virtual Module

The plugin exposes a few virtual modules for different usage scenarios.

## `virtual:svg-icons/register`

By default, the plugin injects the sprite into the page automatically.

Import this module from a client entry such as `src/main.ts` when you want the plugin to mount the generated sprite into the page during development.
The same module also listens for icon HMR updates and replaces the existing sprite DOM in place:

```ts
import 'virtual:svg-icons/register'
```

## `virtual:svg-icons/ids`

Import this module to read all generated symbol ids:

```ts
import ids from 'virtual:svg-icons/ids'

console.log(ids)
// ['icon-icon1', 'icon-icon2', 'icon-dir-icon1', ...]
```

Useful for icon pickers, admin config pages, or dynamic icon rendering.

## `virtual:svg-icons/sprite`

In SSR or any flow where you assemble HTML manually, you can read the full sprite string:

```ts
import sprite from 'virtual:svg-icons/sprite'
```

See [Server-Side Rendering](/guide/ssr) for the full usage.
