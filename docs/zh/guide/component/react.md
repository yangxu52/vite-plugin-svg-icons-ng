# React

## 组件参考

示例：`/src/components/SvgIcon.jsx`

```jsx
export default function SvgIcon({ name, color, ...props }) {
  return (
    <svg {...props} aria-hidden='true'>
      <use href={`#${name}`} fill={color} />
    </svg>
  )
}
```

## 使用参考

示例：`/src/App.jsx`

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
