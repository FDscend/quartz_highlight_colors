import type { Root as MdastRoot } from "mdast";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { applyHighlightColors, buildHighlightCss, colorPalette } from "../src/colors";
import { HighlightColors, remarkHighlightColors } from "../src/highlight-colors";

const span = (inner: string) => `<span class="text-highlight">${inner}</span>`;
const mark = (color: string, text: string) =>
  `<mark class="text-highlight" data-highlight="${color}">${text}</mark>`;

describe("applyHighlightColors", () => {
  it("六种颜色标记都会转成 data-highlight 并剥离表情", () => {
    expect(applyHighlightColors(span("🔴重要"))).toBe(mark("red", "重要"));
    expect(applyHighlightColors(span("🟠跟进"))).toBe(mark("orange", "跟进"));
    expect(applyHighlightColors(span("🟡记住这个"))).toBe(mark("yellow", "记住这个"));
    expect(applyHighlightColors(span("🟢已完成"))).toBe(mark("green", "已完成"));
    expect(applyHighlightColors(span("🔵参考"))).toBe(mark("blue", "参考"));
    expect(applyHighlightColors(span("🟣想法"))).toBe(mark("purple", "想法"));
  });

  it("没有颜色标记时保持宿主默认高亮", () => {
    expect(applyHighlightColors(span("highlighted text"))).toBe(span("highlighted text"));
  });

  it("表情不在起始位置时不作为颜色标记", () => {
    expect(applyHighlightColors(span("重要🔴"))).toBe(span("重要🔴"));
  });

  it("只有颜色表情、没有内容时保持默认高亮", () => {
    expect(applyHighlightColors(span("🔴"))).toBe(span("🔴"));
  });

  it("兼容带变体选择符 U+FE0F 的表情", () => {
    expect(applyHighlightColors(span("🔴\uFE0F重要"))).toBe(mark("red", "重要"));
  });

  it("同一段 HTML 中的多个高亮都会被处理", () => {
    expect(applyHighlightColors(`${span("🔴A")} 与 ${span("🔵B")}`)).toBe(
      `${mark("red", "A")} 与 ${mark("blue", "B")}`,
    );
  });

  it("非高亮 HTML 原样返回", () => {
    expect(applyHighlightColors("<p>nothing here</p>")).toBe("<p>nothing here</p>");
  });
});

describe("buildHighlightCss", () => {
  it("为每种颜色生成一条 data-highlight 规则", () => {
    const css = buildHighlightCss();
    for (const { color } of colorPalette) {
      expect(css).toContain(`[data-highlight="${color}"]`);
    }
  });
});

describe("HighlightColors 插件", () => {
  it("markdown 阶段改写 Obsidian Flavored Markdown 产出的高亮节点", () => {
    // OFM 会把 ==…== 整体替换成一个 html 节点，value 即完整的 span 字符串
    const tree: MdastRoot = {
      type: "root",
      children: [
        { type: "html", value: span("🔴重要") },
        { type: "html", value: span("plain") },
      ],
    };

    unified().use(remarkHighlightColors).runSync(tree);

    expect(tree.children[0]).toMatchObject({ value: mark("red", "重要") });
    expect(tree.children[1]).toMatchObject({ value: span("plain") });
  });

  it("默认配置晚于 Obsidian Flavored Markdown 运行", () => {
    const instance = HighlightColors();
    expect(instance.name).toBe("HighlightColors");
    expect(instance.markdownPlugins?.({} as never)).toHaveLength(1);
    const resources = instance.externalResources?.({} as never);
    expect(resources?.css?.[0]?.content).toContain('[data-highlight="red"]');
  });
});
