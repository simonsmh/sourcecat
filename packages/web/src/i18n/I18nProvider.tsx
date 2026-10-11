"use client";

/**
 * 客户端 i18n Provider + hooks。
 *
 * 在根 layout 中由服务端注入当前语言的文案（英文兜底已合并），
 * 客户端组件通过 useTranslations(namespace) 取文案：
 *
 *   const t = useTranslations("nav");
 *   <span>{t("codeSearch")}</span>
 *   <span>{t("search.noResultsFor", { query })}</span>
 *
 * 切换语言后调用 router.refresh()，服务端会按新 cookie 重新注入文案。
 */
import { createContext, useContext } from "react";
import {
    type Locale,
    type MessageKey,
    type Messages,
    type Namespace,
} from "./config";
import { formatMessage, getMessageByPath, type FormatValues } from "./format";

interface I18nContextValue {
    locale: Locale;
    messages: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
    locale,
    messages,
    children,
}: {
    locale: Locale;
    messages: Messages;
    children: React.ReactNode;
}) {
    return (
        <I18nContext.Provider value={{ locale, messages }}>
            {children}
        </I18nContext.Provider>
    );
}

function useI18nContext(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useTranslations must be used within <I18nProvider>");
    }
    return ctx;
}

/** 当前语言，如 "zh"。 */
export function useLocale(): Locale {
    return useI18nContext().locale;
}

/**
 * 取某命名空间的翻译函数，key 带类型检查，支持 {var} 插值与 plural。
 *   const t = useTranslations("common");
 *   t("delete") // "删除"
 */
export function useTranslations<N extends Namespace>(namespace: N) {
    const { messages } = useI18nContext();
    const nsMessages = messages[namespace];
    return (key: MessageKey<N>, values?: FormatValues): string => {
        const template = getMessageByPath(nsMessages, key as string) ?? (key as string);
        return formatMessage(template, values);
    };
}
