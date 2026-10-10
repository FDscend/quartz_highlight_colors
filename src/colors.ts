/**
 * Obsidian 彩色高亮的颜色标记与样式。
 *
 * Obsidian v1.14 起支持在起始 `==` 后紧跟颜色表情来指定高亮颜色（例如 `==🔴重要==`），
 * 表情本身只作颜色标记、不显示。Quartz 的 Obsidian Flavored Markdown 插件会先把
 * `==…==` 转成 `<span class="text-highlight">…</span>`，本模块负责把它改写成
 * `<mark class="text-highlight" data-highlight="red">…</mark>`。
 */

/** 颜色标记表情 → 颜色名与背景色（顺序即文档展示顺序） */
export const colorPalette = [
  {
    emoji: "🔴",
    color: "red",
    background: "color-mix(in oklch, rgb(221, 44, 56) 30%, transparent)",
  },
  {
    emoji: "🟠",
    color: "orange",
    background: "color-mix(in oklch, rgb(222, 116, 23) 30%, transparent)",
  },
  {
    emoji: "🟡",
    color: "yellow",
    background: "color-mix(in oklch, rgb(192, 156, 12) 30%, transparent)",
  },
  {
    emoji: "🟢",
    color: "green",
    background: "color-mix(in oklch, rgb(29, 165, 29) 30%, transparent)",
  },
  {
    emoji: "🔵",
    color: "blue",
    background: "color-mix(in oklch, rgb(23, 117, 217) 30%, transparent)",
  },
  {
    emoji: "🟣",
    color: "purple",
    background: "color-mix(in oklch, rgb(143, 71, 225) 30%, transparent)",
  },
] as const;

/** 表情的变体选择符（U+FE0F），需要一并吞掉 */
const VARIATION_SELECTOR = "\uFE0F";

/** 与 Obsidian Flavored Markdown 输出形态一致的原始 HTML span */
const HIGHLIGHT_SPAN = /<span class="text-highlight">([\s\S]*?)<\/span>/g;

/** 读出内容开头的颜色标记，返回颜色与实际标记长度（不含则为 undefined） */
function readColorMarker(text: string): { color: string; length: number } | undefined {
  for (const { emoji, color } of colorPalette) {
    if (text.startsWith(emoji + VARIATION_SELECTOR)) {
      return { color, length: emoji.length + VARIATION_SELECTOR.length };
    }
    if (text.startsWith(emoji)) {
      return { color, length: emoji.length };
    }
  }
  return undefined;
}

/**
 * 把高亮 span 里的颜色标记表情转换成 `data-highlight` 属性。
 *
 * 规则与 Obsidian 一致：颜色表情必须紧跟在起始 `==` 之后，且其后必须有内容；
 * 不满足时（如 `==🔴==`、`==重要🔴==`）按普通高亮渲染，表情原样显示。
 */
export function applyHighlightColors(html: string): string {
  return html.replace(HIGHLIGHT_SPAN, (span, inner: string) => {
    const marker = readColorMarker(inner);
    if (!marker) {
      return span;
    }

    const text = inner.slice(marker.length);
    if (text.length === 0) {
      return span;
    }

    return `<mark class="text-highlight" data-highlight="${marker.color}">${text}</mark>`;
  });
}

/**
 * 生成注入宿主站点的 CSS。
 *
 * 只覆盖背景色，保留 `class="text-highlight"` 让宿主主题继续提供内边距、圆角等外观；
 * 选择器用 `[data-highlight]` 提高特异性，以便盖过站点主题中针对
 * `article :is(mark, .text-highlight)` 的统一高亮底色。
 */
export function buildHighlightCss(): string {
  return colorPalette
    .map(
      ({ color, background }) =>
        `article :is(mark, .text-highlight)[data-highlight="${color}"] {\n  background-color: ${background};\n}`,
    )
    .join("\n\n");
}
