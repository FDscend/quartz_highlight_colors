import { Root } from 'mdast';
import { Plugin } from 'unified';
import { QuartzTransformerPlugin } from '@quartz-community/types';
export { BuildCtx, CSSResource, JSResource, ProcessedContent, QuartzPluginData, QuartzTransformerPlugin, QuartzTransformerPluginInstance, StaticResources } from '@quartz-community/types';

/**
 * remark 插件：把 Obsidian Flavored Markdown 生成的高亮 span 改写为带
 * `data-highlight` 的 mark。此时 `==…==` 已经变成原始 HTML 节点，
 * 行内代码与代码块不会经过这里，因此不会被误伤。
 */
declare const remarkHighlightColors: Plugin<[], Root>;
/**
 * 渲染 Obsidian 彩色高亮（`==🔴重要==`）的 Quartz 插件。
 *
 * 依赖宿主站点启用 `@quartz-community/obsidian-flavored-markdown` 的高亮解析
 * （`highlight` 选项默认开启），且本插件需配置在其之后运行（见 `defaultOrder`）。
 */
declare const HighlightColors: QuartzTransformerPlugin;

/**
 * Obsidian 彩色高亮的颜色标记与样式。
 *
 * Obsidian v1.14 起支持在起始 `==` 后紧跟颜色表情来指定高亮颜色（例如 `==🔴重要==`），
 * 表情本身只作颜色标记、不显示。Quartz 的 Obsidian Flavored Markdown 插件会先把
 * `==…==` 转成 `<span class="text-highlight">…</span>`，本模块负责把它改写成
 * `<mark class="text-highlight" data-highlight="red">…</mark>`。
 */
/** 颜色标记表情 → 颜色名与背景色（顺序即文档展示顺序） */
declare const colorPalette: readonly [{
    readonly emoji: "🔴";
    readonly color: "red";
    readonly background: "color-mix(in oklch, rgb(221, 44, 56) 30%, transparent)";
}, {
    readonly emoji: "🟠";
    readonly color: "orange";
    readonly background: "color-mix(in oklch, rgb(222, 116, 23) 30%, transparent)";
}, {
    readonly emoji: "🟡";
    readonly color: "yellow";
    readonly background: "color-mix(in oklch, rgb(192, 156, 12) 30%, transparent)";
}, {
    readonly emoji: "🟢";
    readonly color: "green";
    readonly background: "color-mix(in oklch, rgb(29, 165, 29) 30%, transparent)";
}, {
    readonly emoji: "🔵";
    readonly color: "blue";
    readonly background: "color-mix(in oklch, rgb(23, 117, 217) 30%, transparent)";
}, {
    readonly emoji: "🟣";
    readonly color: "purple";
    readonly background: "color-mix(in oklch, rgb(143, 71, 225) 30%, transparent)";
}];
/**
 * 把高亮 span 里的颜色标记表情转换成 `data-highlight` 属性。
 *
 * 规则与 Obsidian 一致：颜色表情必须紧跟在起始 `==` 之后，且其后必须有内容；
 * 不满足时（如 `==🔴==`、`==重要🔴==`）按普通高亮渲染，表情原样显示。
 */
declare function applyHighlightColors(html: string): string;
/**
 * 生成注入宿主站点的 CSS。
 *
 * 只覆盖背景色，保留 `class="text-highlight"` 让宿主主题继续提供内边距、圆角等外观；
 * 选择器用 `[data-highlight]` 提高特异性，以便盖过站点主题中针对
 * `article :is(mark, .text-highlight)` 的统一高亮底色。
 */
declare function buildHighlightCss(): string;

export { HighlightColors, applyHighlightColors, buildHighlightCss, colorPalette, remarkHighlightColors };
