# Virtual Module

The plugin exposes a few virtual modules for different usage scenarios.

## `virtual:svg-icons/register`

Import this module from a client entry such as `src/main.ts` when you want to mount the generated sprite from client code.

In dev, the mounted sprite stays in sync when icons change.

This module is optional. With `htmlMode: 'inline'`, the sprite is already injected into HTML. With `htmlMode: 'script'`, it is already mounted automatically. If you use `virtual:svg-icons/register`, prefer `htmlMode: 'none'` to disable automatic HTML injection.

```ts
import 'virtual:svg-icons/register'
```

## `virtual:svg-icons/ids`

Import this module to read all generated symbol ids:

These values are the actual `<symbol id="...">` values used by the sprite. In application code, you can also think of them as the icon reference names used in `<use href="#...">`.

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

## Deprecated aliases

The following aliases are still supported for compatibility, but they are deprecated and planned for removal in `v2.0.0`:

- `virtual:svg-icons-register` -> `virtual:svg-icons/register`
- `virtual:svg-icons-names` -> `virtual:svg-icons/ids`

Update imports to the slash-based virtual module ids before upgrading to `v2.0.0`.
