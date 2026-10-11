/**
 * 轻量消息格式化：支持 `{name}` 插值与 ICU 子集的 plural。
 *
 *   t("common.hello", { name: "Ada" })            // "Hello, Ada!"
 *   t("repo.count", { count: 5 })                 // "{count, plural, one {# repo} other {# repos}}"
 *
 * 支持的 plural 形式：`=0` / `=1` 精确匹配、`one` / `other`。
 * 选用 ICU 子集而非完整解析器：零依赖、体积小，覆盖 UI 文案 99% 的场景。
 */

export type FormatValues = Record<string, string | number | boolean | null | undefined>;

/**
 * 按点路径从消息对象中取值，如 "nav.settings"。
 * 找不到时返回 undefined，由调用方决定 fallback（默认回退英文）。
 */
export function getMessageByPath(messages: unknown, path: string): string | undefined {
    const parts = path.split(".");
    let node: unknown = messages;
    for (const part of parts) {
        if (typeof node !== "object" || node === null || !(part in node)) {
            return undefined;
        }
        node = (node as Record<string, unknown>)[part];
    }
    return typeof node === "string" ? node : undefined;
}

function formatPlural(template: string, values: FormatValues): string {
    // 匹配 {count, plural, =0 {none} one {# item} other {# items}}
    return template.replace(
        /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/g,
        (match, varName: string, body: string) => {
            const raw = values[varName];
            const n = typeof raw === "number" ? raw : Number(raw);
            if (Number.isNaN(n)) {
                return match;
            }
            const exact = body.match(new RegExp(`=${n}\\s*\\{([^{}]*)\\}`));
            let chosen: string | undefined = exact?.[1];
            if (chosen === undefined) {
                const keyword = n === 1 ? "one" : "other";
                chosen = body.match(new RegExp(`${keyword}\\s*\\{([^{}]*)\\}`))?.[1];
            }
            if (chosen === undefined) {
                return match;
            }
            return chosen.replace(/#/g, String(n));
        },
    );
}

export function formatMessage(template: string, values?: FormatValues): string {
    let out = template;
    if (values) {
        out = formatPlural(out, values);
        out = out.replace(/\{(\w+)\}/g, (match, name: string) => {
            const v = values[name];
            return v === null || v === undefined ? match : String(v);
        });
    }
    return out;
}

/** 深合并：locale 文案覆盖在英文基底上，缺失 key 自动回退英文。 */
export function deepMerge<T extends Record<string, unknown>>(base: T, overlay: unknown): T {
    if (typeof overlay !== "object" || overlay === null) {
        return base;
    }
    const out: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
        const baseValue = (base as Record<string, unknown>)[key];
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            typeof baseValue === "object" &&
            baseValue !== null &&
            !Array.isArray(baseValue)
        ) {
            out[key] = deepMerge(baseValue as Record<string, unknown>, value);
        } else {
            out[key] = value;
        }
    }
    return out as T;
}
