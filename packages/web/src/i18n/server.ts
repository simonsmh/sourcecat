/**
 * 服务端 i18n helpers（仅可在 Server Components / Route Handlers / Server Actions 中使用）。
 *
 *   import { getTranslations } from "@/i18n/server";
 *   const t = await getTranslations("nav");
 *   t("settings") // -> 当前语言的 "设置"
 *
 * 语言解析顺序：NEXT_LOCALE cookie > Accept-Language 请求头 > 英文。
 * 所有语言的文案都以英文为基底做深合并，缺失 key 自动回退英文。
 */
import "server-only";

import { cookies, headers } from "next/headers";
import {
    defaultLocale,
    isLocale,
    localeCookieName,
    negotiateLocale,
    type Locale,
    type MessageKey,
    type Messages,
    type Namespace,
} from "./config";
import { deepMerge, formatMessage, getMessageByPath, type FormatValues } from "./format";
import enMessages from "./messages/en.json";

const messageLoaders: Record<Locale, () => Promise<{ default: Messages }>> = {
    en: () => import("./messages/en.json"),
    zh: () => import("./messages/zh.json"),
    ja: () => import("./messages/ja.json"),
    ko: () => import("./messages/ko.json"),
};

/** 解析当前请求的语言：cookie > Accept-Language > 默认英文。 */
export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(localeCookieName)?.value;
    if (isLocale(raw)) {
        return raw;
    }
    const acceptLanguage = (await headers()).get("accept-language");
    return negotiateLocale(acceptLanguage);
}

/**
 * 获取当前语言的完整文案（英文兜底已合并）。
 * 传 locale 可强制指定语言（极少需要）。
 */
export async function getMessages(locale?: Locale): Promise<Messages> {
    const resolved = locale ?? (await getLocale());
    if (resolved === defaultLocale) {
        return enMessages;
    }
    const overlay = (await messageLoaders[resolved]()).default;
    return deepMerge(enMessages, overlay);
}

/**
 * 服务端翻译函数。key 支持点路径并带类型检查：
 *   const t = await getTranslations("sidebar");
 *   t("collapseSidebar") // 类型检查通过
 *   t("not.a.key")       // 类型报错
 */
export async function getTranslations<N extends Namespace>(namespace: N) {
    const messages = await getMessages();
    const nsMessages = messages[namespace];
    return (key: MessageKey<N>, values?: FormatValues): string => {
        const template = getMessageByPath(nsMessages, key as string) ?? (key as string);
        return formatMessage(template, values);
    };
}
