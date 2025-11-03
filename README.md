# Hướng dẫn sử dụng

1. Cài đặt các gói thư viện

   `npm install`

2. Chạy project

   `npm start`

# Các thành phần trong project

- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Các thành phần trong project](#các-thành-phần-trong-project)
  - [1. _CSS Variable_](#1-css-variable)
  - [2. _Utils_](#2-utils)
    - [commons.ts](#commonsts)

## 1. _CSS Variable_

- Sửa các màu mặc định tại: shared/assets/styles/\_variable.scss
- List các màu mặc định:

```scss
$background: ;
$white-color: ;
$white-color-extra: ;
$silver-color: ;
$green-color: ;
$red-color: ;
$orange-color: ;
$yellow-color: ;
$blue-color: ;
$text-color-primary: ;
$text-color-secondary: ;
$line-color: ;
$line-color-extra: ;
```

- Các biến màu có thể gọi từ :root:

```scss
--background
--white-color
--white-color-extra
--silver-color
--green-color
--red-color
--red-color-opacity-#{opacity}
--orange-color
--orange-color-opacity-#{opacity}
--yellow-color
--yellow-color-opacity-#{opacity}
--blue-color
--blue-color-opacity-#{opacity}
--text-color-primary
--text-color-primary-60
--text-color-secondary
--line-color
--line-color-extra

#{opacity} là các giá trị trong dải sau: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90
```

- Cách sử dụng các biến màu từ :root

```scss
background: var(--background);
border-color: var(--line-color);
...
```

## 2. _Utils_

- [commons.ts](#commonsts)
- [validate.ts](#validatets)
- [function.ts](#functionts)
- [dateFormat.ts](#dateFormatts)

### commons.ts
