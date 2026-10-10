import type { Html, Root as MdastRoot } from "mdast";
import type { PluggableList, Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { applyHighlightColors, buildHighlightCss } from "./colors";

/**
 * remark 插件：把 Obsidian Flavored Markdown 生成的高亮 span 改写为带
 * `data-highlight` 的 mark。此时 `==…==` 已经变成原始 HTML 节点，
 * 行内代码与代码块不会经过这里，因此不会被误伤。
 */
export const remarkHighlightColors: Plugin<[], MdastRoot> = () => (tree: MdastRoot) => {
  visit(tree, "html", (node: Html) => {
    node.value = applyHighlightColors(node.value);
  });
};

/**
 * 渲染 Obsidian 彩色高亮（`==🔴重要==`）的 Quartz 插件。
 *
 * 依赖宿主站点启用 `@quartz-community/obsidian-flavored-markdown` 的高亮解析
 * （`highlight` 选项默认开启），且本插件需配置在其之后运行（见 `defaultOrder`）。
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
