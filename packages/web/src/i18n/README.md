# i18n 国际化

Sourcecat 前端使用自研轻量 i18n 框架（零外部依赖），支持 **en / zh（简体中文）/ ja / ko** 四种语言。

## 方案

- **持久化**：`NEXT_LOCALE` cookie（一年有效期），不改 URL 路由结构。
- **首次访问**：无 cookie 时按 `Accept-Language` 请求头协商最接近的语言。
- **Fallback**：所有语言的文案以 `messages/en.json` 为基底做深合并，缺失 key 自动回退英文。
- **格式化**：支持 `{name}` 插值与 `{count, plural, one {...} other {...}}`（另支持 `=0`/`=1` 精确匹配）。

## 新增文案（三步）

1. 在 `messages/en.json` 的合适命名空间下加英文 key（**en.json 是唯一可信源**）。
2. 在 `messages/zh.json` / `ja.json` / `ko.json` 的**相同位置**加翻译。暂时没翻译就先不加——会自动回退英文。
3. 用 `useTranslations` / `getTranslations` 取用（见下）。

> 品牌名 **Sourcecat** 保持英文，不翻译。

## 在组件中使用

**客户端组件：**

```tsx
"use client";
import { useTranslations } from "@/i18n/I18nProvider";

export function MyButton() {
    const t = useTranslations("common"); // 命名空间
    return <button>{t("save")}</button>; // key 支持点路径 + 类型检查
}
```

带插值：`t("search.noResultsFor", { query })`。

**服务端组件：**

```tsx
import { getTranslations } from "@/i18n/server";

export async function MyServerComp() {
    const t = await getTranslations("nav");
    return <span>{t("settings")}</span>;
}
```

取当前语言：客户端用 `useLocale()`，服务端用 `getLocale()`。

## 语言切换器

`LanguageSwitcher` 是一个下拉子菜单，放在侧栏底部用户菜单的「外观」分组里（`sidebarBase.tsx` 的 `AppearanceDropdownMenuGroup`），登录用户与访客共用。切换后写 cookie 并 `router.refresh()`，即时生效。

## 文件结构

```
src/i18n/
├── config.ts            # 语言列表、cookie 名、协商逻辑、文案类型
├── format.ts            # 插值/plural 格式化、深合并 fallback
├── messages/
│   ├── en.json          # 英文（可信源，key 类型由此生成）
│   ├── zh.json          # 简体中文
│   ├── ja.json          # 日文
│   └── ko.json          # 韩文
├── server.ts            # getLocale / getMessages / getTranslations（仅服务端）
├── I18nProvider.tsx     # 客户端 Provider + useTranslations / useLocale
├── LanguageSwitcher.tsx # 侧栏语言切换下拉菜单
└── README.md            # 本文档
```

## 新增语言

1. `config.ts` 的 `locales` 数组里加 code，并在 `localeNames` 里加自称。
2. `server.ts` 的 `messageLoaders` 里加一行。
3. 新增 `messages/<code>.json`（结构对齐 en.json）。
