# Typescript 支持

vite-plugin-svg-icons-ng 支持 `TypeScript`.  
根据你的工作区配置, 你可以选择 **其中一种** 方式来配置 `TypeScript` 支持.

## 方式一 （推荐）

如果你的工作区使用 `tsconfig.json` 文件.

在 `tsconfig.json` 文件中添加 type `"vite-plugin-svg-icons-ng/client"`。

```jsonc {4}
{
  // ...
  "compilerOptions": {
    "types": ["vite-plugin-svg-icons-ng/client"],
  },
}
```

## 方式二

如果你的工作区使用 环境类型声明文件，比如 `env.d.ts`.

在 环境类型声明 文件中添加三斜线指令 `/// <reference types="vite-plugin-svg-icons-ng/client" />`。

```ts
/// <reference types="vite-plugin-svg-icons-ng/client" />
```

确保你的工作区有在`tsconfig.json`文件中设置环境类型声明文件 。

```jsonc {4}
{
  // ...
  "compilerOptions": {
    "types": ["env.d.ts"],
  },
}
```

> [!TIP] 提示
> 环境类型声明文件，通常类似于 `env.d.ts`.
