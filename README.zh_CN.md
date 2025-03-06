# vite-plugin-svg-icons-ng

[![MIT LICENSE](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square&label=LICENSE)](https://github.com/yangxu52/vite-plugin-svg-icons-ng/blob/main/LICENSE)&nbsp;
![GitHub Stars](https://img.shields.io/github/stars/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Stars&logo=github)&nbsp;
![GitHub Forks](https://img.shields.io/github/forks/yangxu52/vite-plugin-svg-icons-ng.svg?style=flat-square&label=Forks&logo=github)
&emsp;

**中文** | [English](./README.md)

用于从存储SVG图标的**指定文件夹**生成**svg精灵图**。

## 特征

- **预加载** 在项目运行时就生成所有图标，并且只需进行一次DOM操作。
- **高性能** 内置缓存，仅当图标被修改时才会重新生成。

## 要求

- **Node:** `^18.3.0`, `>=20.0.0`
- **Vite:** `>=5.0.0`

## 安装

```bash
# pnpm
pnpm install vite-plugin-svg-icons-ng -D
# npm
npm i vite-plugin-svg-icons-ng -D
# yarn
yarn add vite-plugin-svg-icons-ng -D
```

## 使用

1. 在`vite.config.ts`/`vite.config.js`中导入并配置插件

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

2. 在`main.ts`/`main.js`导入虚拟模块注册

   ```ts
   import 'virtual:svg-icons-register'
   ```

3. 到此，svg精灵图就生成了，可以在组件中使用。

## 在组件中使用

**⚠️ 先完成 [使用](#使用) 中的步骤**

**前提**  
Icon文件夹结构如下：

```
src/icons/
├── dir/
│ └── icon1.svg
├── icon1.svg
└── icon2.svg
```

1. [Vue3 (Composition API)](#vue3)
   1. [use setup](#使用setup)
   2. [non setup](#非setup)
2. [React](#react)

- ### Vue3

  - #### 使用setup

    编写组件: `/src/components/SvgIcon.vue`

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

    使用组件: `/src/app.vue`

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

  - #### 非setup

    编写组件: `/src/components/SvgIcon.vue`

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

    使用组件: `/src/app.vue`

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

  编写组件: `/src/components/SvgIcon.jsx`

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

  使用组件: `/src/App.jsx`

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

## 获取所有 SymbolId

```ts
import ids from 'virtual:svg-icons-names'
// => ['icon-icon1','icon-icon2','icon-icon3']
```

## 配置说明

| 参数        | 类型                 | 默认值                | 说明                                                                                 |
| ----------- | -------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| iconDirs    | `string[]`           | -                     | 需要生成雪碧图的图标文件夹                                                           |
| symbolId    | `string`             | `icon-[dir]-[name]`   | svg精灵图中`<symbol>`的ID格式，见下方说明                                            |
| svgoOptions | `SvgoOptions\|false` | `{}`                  | SVGO配置，详见：[Options](https://github.com/svg/svgo#configuration),或 `false` 禁用 |
| inject      | `string`             | `body-last`           | 生成的svg精灵图的插入方式                                                            |
| customDomId | `string`             | `__svg__icons__dom__` | 生成的svg精灵图插入节点的 ID                                                         |

**symbolId**

`icon-[dir]-[name]`

**[name]:**

svg 文件名

**[dir]**

该插件的 svg 不会生成 hash 来区分，而是通过文件夹来区分.

如果`iconDirs`对应的文件夹下面包含这其他文件夹

例：

则生成的 SymbolId 为注释所写

```bash
# src/icons
- icon1.svg # icon-icon1
- icon2.svg # icon-icon2
- dir/icon1.svg # icon-dir-icon1
- dir/dir2/icon1.svg # icon-dir-dir2-icon1
```

## Typescript 支持

如果使用 `Typescript`,你可以在`tsconfig.json`内添加

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-svg-icons-ng/client"]
  }
}
```

**注意**

虽然用文件夹来区分已经可以很大程度避免重名问题了,但是也会出现`iconDirs`配置多个文件夹，且存在文件名一样的 svg。

这个需要开发者自己规避下

## 示例

**运行示例**

```bash
# install && auto build core
pnpm install
# run playground dev
pnpm run dev
# run playground build
build:playground
```

## 致谢

[vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons)

## License

[MIT © yangxu52-2025](./LICENSE)
