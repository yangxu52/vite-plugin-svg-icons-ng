# Virtual Module

The plugin exposes a few virtual modules for different usage scenarios.

## `virtual:svg-icons/register`

By default, the plugin injects the sprite into the page automatically.
If you prefer to control that step explicitly from a client entry, for example in `src/main.ts` as part of your app bootstrap, you can import:

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
