# vite-plugin-svg-icons-ng

[![MIT LICENSE](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square&label=LICENSE)](https://github.com/yangxu52/vite-plugin-svg-icons-ng/blob/main/LICENSE)&nbsp;
![GitHub Stars](https://img.shields.io/github/stars/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Stars&logo=github)&nbsp;
![GitHub Forks](https://img.shields.io/github/forks/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Forks&logo=github)
&emsp;

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
        <use :xlink:href="props.name" :fill="props.color" />
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
        <use :href="props.name" :fill="props.color" />
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
    </script>
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

| Parameter   | Type                 | Default               | Description                                                                                              |
| ----------- | -------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| iconDirs    | `string[]`           | -                     | Need to generate the icon folder of the Sprite image                                                     |
| symbolId    | `string`             | `icon-[dir]-[name]`   | `<symbol>`Id format, see the description below                                                           |
| svgoOptions | `SvgoOptions\|false` | `{}`                  | SVGO configuration, details: [Options](https://github.com/svg/svgo#configuration), or `false` to disable |
| inject      | `string`             | `body-last`           | the Sprite image DOM inject mode                                                                         |
| customDomId | `string`             | `__svg__icons__dom__` | Customize the ID of the svgDom insert node                                                               |

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

- option1: add `"vite-plugin-svg-icons-ng/client"` to `tsconfig.json`.

  ```json
  {
    "compilerOptions": {
      "types": ["vite-plugin-svg-icons-ng/client"]
    }
  }
  ```

- option2: add triple slash `/// <reference types="vite-plugin-svg-icons-ng/client" />` in the environment type declaration, like `env.d.ts` file, if you defined a `env.d.ts` file and include it.

  ```ts
  /// <reference types="vite-plugin-svg-icons-ng/client" />
  ```

  ```json
  {
    "compilerOptions": {
      "types": ["env.d.ts"]
    }
  }
  ```

## **Note**

Although the use of folders to distinguish between them can largely avoid the problem of duplicate names, there will also be svgs with multiple folders and the
same file name in `iconDirs`.

This needs to be avoided by the developer himself

## Example

**Run**

```bash
# install && auto build core
pnpm install
# run playground dev
pnpm run dev
# run playground build
build:playground
```

## Tanks

[vite-plugin-svg-icons-ng](https://github.com/vbenjs/vite-plugin-svg-icons-ng)

## License

[MIT © yangxu52-2025](./LICENSE)
