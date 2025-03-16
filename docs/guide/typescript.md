# Typescript Support

The vite-plugin-svg-icons-ng support `TypeScript`.  
According to your workspace configuration, you can choose **one** way to configure `TypeScript` support.

## Option 1

If your workspace use the `tsconfig.json` file.

Add type `"vite-plugin-svg-icons-ng/client"` to `tsconfig.json`.

```jsonc {5}
{
  // ...
  "compilerOptions": {
    "types": ["vite-plugin-svg-icons-ng/client"],
  },
}
```

## Option 2

If your workspace use the environment type declaration file.

Add triple slash `/// <reference types="vite-plugin-svg-icons-ng/client" />` in the environment type declaration file.

```ts
/// <reference types="vite-plugin-svg-icons-ng/client" />
```

Ensure that your workspace has set up an environment type declaration in `tsconfig.json`.

```jsonc {5}
{
  // ...
  "compilerOptions": {
    "types": ["env.d.ts"],
  },
}
```

> [!TIP]
> The environment type declaration file is similar like `env.d.ts`.
