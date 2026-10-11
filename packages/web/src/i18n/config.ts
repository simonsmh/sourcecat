/**
 * i18n 框架配置：支持的语言、默认语言、cookie 持久化。
 *
 * 方案：cookie 持久化（NEXT_LOCALE），不改 URL 路由结构，对现有路由零侵入。
 * 首次访问无 cookie 时，按 Accept-Language 请求头协商最接近的语言。
 */

/** 支持的语言列表。新增语言时：在此添加、并在 messages/ 下新增同名 JSON。 */
export const locales = ["en", "zh", "ja", "ko"] as const;

export type Locale = (typeof locales)[number];

/** 缺失翻译时的兜底语言（messages/en.json 为唯一可信源）。 */
export const defaultLocale: Locale = "en";

/** 持久化用户语言选择的 cookie 名。 */
export const localeCookieName = "NEXT_LOCALE";

/** 语言切换器中显示的语言名（用各自语言的自称）。 */
export const localeNames: Record<Locale, string> = {
    en: "English",
    zh: "简体中文",
    ja: "日本語",
    ko: "한국어",
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// 文案类型：以 messages/en.json 为唯一可信源，key 支持点路径类型检查。
// 新增文案时只需改 en.json（及其他语言的同名 JSON），类型自动跟随。
// ---------------------------------------------------------------------------

import type enMessages from "./messages/en.json";

/** 全量文案结构（= 英文源文件的结构）。 */
export type Messages = typeof enMessages;

/** 顶层命名空间，如 "nav" | "sidebar" | "common" | ... */
export type Namespace = keyof Messages;

type DotPath<T, Prefix extends string = ""> = {
    [K in keyof T]: T[K] extends string
        ? `${Prefix}${K & string}`
        : T[K] extends Record<string, unknown>
          ? DotPath<T[K], `${Prefix}${K & string}.`>
          : never;
}[keyof T];

/** 某命名空间下合法的点路径 key，如 "collapseSidebar"。 */
export type MessageKey<N extends Namespace> = DotPath<Messages[N]>;

/**
 * 按 Accept-Language 头协商最佳语言。
 * 例如 "zh-CN,zh;q=0.9,ja;q=0.8" -> "zh"；"ko-KR" -> "ko"。
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) {
        return defaultLocale;
    }
    const prefs = acceptLanguage
        .split(",")
        .map((part) => {
            const [range, ...params] = part.trim().split(";");
            const q = params
                .map((p) => p.trim().match(/^q=([\d.]+)$/))
                .find(Boolean)?.[1];
            return { range: range.toLowerCase(), q: q ? parseFloat(q) : 1 };
        })
        .sort((a, b) => b.q - a.q);

    for (const { range } of prefs) {
        if (range === "*") {
            return defaultLocale;
        }
        // 精确匹配（如 "ja"），或按主语言匹配（如 "zh-cn" -> "zh"）
        const primary = range.split("-")[0];
        const exact = locales.find((l) => l === range);
        if (exact) {
            return exact;
        }
        const byPrimary = locales.find((l) => l === primary);
        if (byPrimary) {
            return byPrimary;
        }
    }
    return defaultLocale;
}
