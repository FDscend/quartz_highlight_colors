import type { Paragraph, PhrasingContent, Root as MdastRoot } from "mdast";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { applyHighlightColors, buildHighlightCss, colorPalette } from "../src/colors";
import { HighlightColors, remarkHighlightColors } from "../src/highlight-colors";
import { transformHighlightSyntax } from "../src/highlight-syntax";

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

describe("transformHighlightSyntax（接管模式）", () => {
  const text = (value: string): PhrasingContent => ({ type: "text", value });
  const strong = (value: string): PhrasingContent => ({ type: "strong", children: [text(value)] });
  const mark = (color: string, ...children: PhrasingContent[]) => ({
    type: "highlightColor",
    data: {
      hName: "mark",
      hProperties: { className: ["text-highlight"], "data-highlight": color },
    },
    children,
  });
  const span = (...children: PhrasingContent[]) => ({
    type: "highlightColor",
    data: { hName: "span", hProperties: { className: ["text-highlight"] } },
    children,
  });

  const run = (...children: PhrasingContent[]): PhrasingContent[] => {
    const tree: MdastRoot = { type: "root", children: [{ type: "paragraph", children }] };
    transformHighlightSyntax(tree);
    return (tree.children[0] as Paragraph).children;
  };

  it("单个文本节点里的彩色高亮会转成 mark", () => {
    expect(run(text("==🔴重要=="))).toEqual([mark("red", text("重要"))]);
  });

  it("跨节点的嵌套写法会整体收进 mark", () => {
    // 关闭 OFM 高亮后 ==🔴**粗体**== 的树形态
    expect(run(text("==🔴"), strong("粗体"), text("=="))).toEqual([mark("red", strong("粗体"))]);
  });

  it("嵌套的斜体、行内代码与链接都会被保留", () => {
    const link: PhrasingContent = {
      type: "link",
      url: "https://example.com",
      children: [text("链接")],
    };
    expect(run(text("==🟡"), { type: "emphasis", children: [text("斜")] }, text("=="))).toEqual([
      mark("yellow", { type: "emphasis", children: [text("斜")] }),
    ]);
    expect(run(text("==🟡"), link, text("=="))).toEqual([mark("yellow", link)]);
    expect(run(text("==🟡"), { type: "inlineCode", value: "code" }, text("=="))).toEqual([
      mark("yellow", { type: "inlineCode", value: "code" }),
    ]);
  });

  it("无颜色高亮按宿主默认样式渲染为 span", () => {
    expect(run(text("==普通=="))).toEqual([span(text("普通"))]);
  });

  it("只有颜色表情时按普通高亮处理，表情原样保留", () => {
    expect(run(text("==🔴=="))).toEqual([span(text("🔴"))]);
  });

  it("表情不在开头时不作为颜色标记", () => {
    expect(run(text("==重要🔴=="))).toEqual([span(text("重要🔴"))]);
  });

  it("兼容带变体选择符 U+FE0F 的表情", () => {
    expect(run(text("==🔴\uFE0F重要=="))).toEqual([mark("red", text("重要"))]);
  });

  it("未闭合的 == 原样保留", () => {
    expect(run(text("==🔴没有结束"))).toEqual([text("==🔴没有结束")]);
  });

  it("空内容（====）不构成高亮", () => {
    expect(run(text("===="))).toEqual([text("====")]);
  });

  it("内容以 = 开头时不算高亮，但会像 OFM 那样向后重试", () => {
    expect(run(text("===没有高亮=="))).toEqual([text("="), span(text("没有高亮"))]);
  });

  it("结束标记后多余的 = 保留为文本", () => {
    expect(run(text("==🔴A==="))).toEqual([mark("red", text("A")), text("=")]);
  });

  it("高亮不跨行", () => {
    expect(run(text("==🔴前\n后=="))).toEqual([text("==🔴前\n后==")]);
    expect(run(text("==🔴前"), text("\n"), text("后=="))).toEqual([
      text("==🔴前"),
      text("\n"),
      text("后=="),
    ]);
  });

  it("行内代码里的 == 不会被处理", () => {
    expect(run({ type: "inlineCode", value: "==🔴x==" })).toEqual([
      { type: "inlineCode", value: "==🔴x==" },
    ]);
  });

  it("保留高亮前后的普通文本，并处理同一节点里的多个高亮", () => {
    expect(run(text("前 ==🔴中== 后"))).toEqual([
      text("前 "),
      mark("red", text("中")),
      text(" 后"),
    ]);
    expect(run(text("==🔴A== 与 ==🔵B=="))).toEqual([
      mark("red", text("A")),
      text(" 与 "),
      mark("blue", text("B")),
    ]);
  });

  it("两种形态可以在同一份文档里共存", () => {
    const tree: MdastRoot = {
      type: "root",
      children: [
        { type: "paragraph", children: [text("==🔴接管==")] },
        { type: "html", value: '<span class="text-highlight">🔵OFM</span>' },
      ],
    };

    unified().use(remarkHighlightColors).runSync(tree);

    expect((tree.children[0] as Paragraph).children).toEqual([mark("red", text("接管"))]);
    expect(tree.children[1]).toMatchObject({
      value: '<mark class="text-highlight" data-highlight="blue">OFM</mark>',
    });
  });
});
