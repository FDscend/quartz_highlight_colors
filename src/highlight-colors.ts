import type { Html, Root as MdastRoot } from "mdast";
import type { PluggableList, Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { applyHighlightColors, buildHighlightCss } from "./colors";
import { transformHighlightSyntax } from "./highlight-syntax";

/**
 * remark 插件：把 Obsidian Flavored Markdown 生成的高亮 span 改写为带
 * `data-highlight` 的 mark。此时 `==…==` 已经变成原始 HTML 节点，
 * 行内代码与代码块不会经过这里，因此不会被误伤。
 *
 * 若宿主关闭了 OFM 的高亮解析（`highlight: false`），`==…==` 会以普通文本进入
 * mdast，此时由 `transformHighlightSyntax` 接管，`==🔴**粗体**==` 等嵌套写法会正常解析。
 */
export const remarkHighlightColors: Plugin<[], MdastRoot> = () => (tree: MdastRoot) => {
  transformHighlightSyntax(tree);
  visit(tree, "html", (node: Html) => {
    node.value = applyHighlightColors(node.value);
  });
};

/**
 * 渲染 Obsidian 彩色高亮（`==🔴重要==`）的 Quartz 插件。
 *
 * 两种工作模式：
 * - 宿主保留 OFM 的高亮解析（`highlight` 默认开启）：改写 OFM 产出的高亮 span，
 *   高亮内容按纯文本渲染（上游行为）。
 * - 宿主关闭 OFM 的高亮解析（`highlight: false`）：插件在 mdast 层接管 `==…==`，
 *   支持 `==🔴**粗体**==` 这类嵌套写法。
 *
 * 两种模式下都需配置在 Obsidian Flavored Markdown 之后运行（见 `defaultOrder`）。
 */
export const HighlightColors: QuartzTransformerPlugin = () => {
  return {
    name: "HighlightColors",
    markdownPlugins(): PluggableList {
      return [remarkHighlightColors];
    },
    externalResources() {
      return {
        css: [{ content: buildHighlightCss(), inline: true }],
      };
    },
  };
};
