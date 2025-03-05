# vite-plugin-svg-icons-ng

**English** | [中文](./README.zh_CN.md)

Used to generate **svg sprite** from **a specified folder**, which stores svg icons.

## Feature

- **Preloading** All icons will be generated when the project is run, and only one DOM operate.
- **High performance** Built-in cache, it will be regenerated only when the icon is modified.

## Requirement

- **Node:** `^18.3.0`, `>=20.0.0`
- **Vite:** `>=5.0.0`

## Installation

```bash
# pnpm
pnpm install vite-plugin-svg-icons-ng -D
# npm
npm i vite-plugin-svg-icons-ng -D
# yarn
yarn add vite-plugin-svg-icons-ng -D
```

## Usage

1. Import and configure the plugin in `vite.config.ts`/`vite.config.js`

   ```ts
   import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
   import path from 'node:path'

   export default defineConfig({
     plugins: [
       createSvgIconsPlugin({
         /**
          * specify the icon folder
          * required
          */
         iconDirs: [path.resolve(process.cwd(), 'src/icons')],
         /**
          * specify the symbolId format
          * default: icon-[dir]-[name]
          */
         symbolId: 'icon-[dir]-[name]',
       }),
     ],
   })
   ```

2. Import the virtual module in `main.ts`/`main.js` to register

   ```ts
   import 'virtual:svg-icons-register'
   ```

3. Here, the svg sprite will has been generated. Can used in your components.

## Use in components

**⚠️ Completed the [Usage](#usage) steps, firstly.**

**Premise**  
Icons Folder Structure

```
src/icons/
├── dir/
│ └── icon1.svg
├── icon1.svg
└── icon2.svg
```

1. [Vue3 (Composition API)](#vue3)
   1. [use setup](#setup)
   2. [non setup](#non-setup)
2. [React](#react)

- ### Vue3

  - #### setup

    code component: `/src/components/SvgIcon.vue`

    ```vue
    <script setup>
    import { computed } from 'vue'
    defineOptions({ name: 'SvgIcon', inheritAttrs: false })
    const props = defineProps({
      name: { type: String, required: true },
      color: { type: String, default: '#333' },
    })
    </script>

    <template>
      <svg class="svg-icon" aria-hidden="true">
        <use :xlink:href="symbolId" :fill="color" />
      </svg>
    </template>
    ```

    use component: `/src/app.vue`

    ```vue
    <script setup>
    import SvgIcon from '@/components/SvgIcon.vue'
    </script>

    <template>
      <div>
        <SvgIcon name="icon-icon1"></SvgIcon>
        <SvgIcon name="icon-icon2" color="#8B81C3"></SvgIcon>
        <SvgIcon name="icon-dir-icon1"></SvgIcon>
      </div>
    </template>
    ```

  - #### non-setup

    component: `/src/components/SvgIcon.vue`

    ```vue
    <template>
      <svg class="svg-icon" aria-hidden="true">
        <use :href="symbolId" :fill="color" />
      </svg>
    </template>

    <script>
    import { defineComponent } from 'vue'
    export default defineComponent({
      name: 'SvgIcon',
      props: {
        name: { type: String, required: true },
        color: { type: String, default: '#333' },
      },
    })
    </script>
    ```

    use component: `/src/app.vue`

    ```vue
       <template>
         <div>
           <SvgIcon name="icon-icon1"></SvgIcon>
           <SvgIcon name="icon-icon2" color="#8B81C3"></SvgIcon>
           <SvgIcon name="icon-dir-icon1"></SvgIcon>
         </div>
       </template>

       <script>
       import SvgIcon from './components/SvgIcon.vue'
       import { defineComponent } from 'vue'
       export default defineComponent({
         components: { SvgIcon },
       })
    ```

- ### React

  code component: `/src/components/SvgIcon.jsx`

  ```jsx
  export default function SvgIcon({ name, prefix = 'icon', color = '#333', ...props }) {
    const symbolId = `#${prefix}-${name}`

    return (
      <svg {...props} aria-hidden='true'>
        <use href={symbolId} fill={color} />
      </svg>
    )
  }
  ```

  use component: `/src/App.jsx`

  ```jsx
  import SvgIcon from './components/SvgIcon'

  export default function App() {
    return (
      <>
        <SvgIcon name='icon-icon1'></SvgIcon>
        <SvgIcon name='icon-icon1' color='#8B81C3'></SvgIcon>
        <SvgIcon name='icon-dir-icon1'></SvgIcon>
      </>
    )
  }
  ```

## Get all SymbolId

```ts
import ids from 'virtual:svg-icons-names'
// => ['icon-icon1','icon-icon2','icon-icon3']
```

## Options

| Parameter   | Type          | Default               | Description                                                                            |
| ----------- | ------------- | --------------------- | -------------------------------------------------------------------------------------- |
| iconDirs    | `string[]`    | -                     | Need to generate the icon folder of the Sprite image                                   |
| symbolId    | `string`      | `icon-[dir]-[name]`   | svg symbolId format, see the description below                                         |
| svgoOptions | `SvgoOptions` | `{}`                  | svg compression configuration, can be an object [Options](https://github.com/svg/svgo) |
| inject      | `string`      | `body-last`           | svgDom default insertion position, optional `body-first`                               |
| customDomId | `string`      | `__svg__icons__dom__` | Customize the ID of the svgDom insert node                                             |

**symbolId**

`icon-[dir]-[name]`

**[name]:**

svg file name

**[dir]**

The svg of the plug-in will not generate hash to distinguish, but distinguish it by folder.

If the folder corresponding to `iconDirs` contains this other folder

example:

Then the generated SymbolId is written in the comment

```bash
# src/icons
- icon1.svg # icon-icon1
- icon2.svg # icon-icon2
- dir/icon1.svg # icon-dir-icon1
- dir/dir2/icon1.svg # icon-dir-dir2-icon1
```

## Typescript Support

If using `Typescript`, you can add in `tsconfig.json`

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-svg-icons-ng/client"]
  }
}
```

**Note**

Although the use of folders to distinguish between them can largely avoid the problem of duplicate names, there will also be svgs with multiple folders and the same file name in `iconDirs`.

This needs to be avoided by the developer himself

## Example

**Run**

```bash

pnpm install
cd ./packages/playground/basic
pnpm run dev
pnpm run build

```

## Tanks

[vite-plugin-svg-icons-ng](https://github.com/vbenjs/vite-plugin-svg-icons-ng)

## License

[MIT © yangxu52-2025](./LICENSE)
