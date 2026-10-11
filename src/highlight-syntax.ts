/**
 * mdast 层的高亮语法接管。
 *
 * 宿主站点关闭 Obsidian Flavored Markdown 的高亮解析（`highlight: false`）后，
 * `==…==` 会以普通文本形态进入 mdast，本模块负责把它们重新组装成
 * `<mark class="text-highlight" data-highlight="…">` / `<span class="text-highlight">`。
 *
 * 与 OFM "把高亮内容当纯文本" 的做法不同，这里把 `==…==` 之间的节点整体收进来，
 * 因此 `==🔴**粗体**==` 这类嵌套写法能正常解析。
 */

import type { Parent, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";
import { readColorMarker } from "./colors";

const MARKER = "==";
const HIGHLIGHT_CLASS = "text-highlight";

/** 渲染成 mark（带颜色）或 span（宿主默认高亮）由 hName 决定 */
interface HighlightNode extends Parent {
  type: "highlightColor";
  data: { hName: "mark" | "span"; hProperties: Record<string, string | string[]> };
  children: PhrasingContent[];
}

type ChildNode = Parent["children"][number];

function isText(node: ChildNode | undefined): node is Text {
  return node?.type === "text";
}

/** 全是空文本时视为没有内容（空的 `====` 不构成高亮） */
function isEmpty(nodes: PhrasingContent[]): boolean {
  return nodes.every((node) => node.type === "text" && node.value.length === 0);
}

interface HighlightMatch {
  /** 结束标记所在的子节点下标 */
  endIndex: number;
  /** 结束标记在该节点文本中的偏移 */
  endOffset: number;
  /** 高亮内容（已剥掉颜色标记表情） */
  inner: PhrasingContent[];
  color?: string;
}

/** 内容收集完毕后识别颜色标记：表情必须位于内容开头，且剥掉后仍有内容 */
function finalize(
  inner: PhrasingContent[],
  endIndex: number,
  endOffset: number,
): HighlightMatch | undefined {
  if (isEmpty(inner)) {
    return undefined;
  }

  const [first] = inner;
  // 与 OFM 的 tokenizer 一致：内容不能以 `=` 开头（`===a==` 不是高亮）
  if (first?.type === "text" && first.value.startsWith("=")) {
    return undefined;
  }

  if (first?.type === "text") {
    const marker = readColorMarker(first.value);
    if (marker) {
      const rest = first.value.slice(marker.length);
      const stripped: PhrasingContent[] = rest.length
        ? [{ type: "text", value: rest }, ...inner.slice(1)]
        : inner.slice(1);
      // 只有表情没有内容（如 `==🔴==`）时按普通高亮处理，表情原样显示
      if (!isEmpty(stripped)) {
        return { endIndex, endOffset, inner: stripped, color: marker.color };
      }
    }
  }

  return { endIndex, endOffset, inner };
}

/** 从 `startIndex` 节点 `openOffset` 处的 `==` 开始向后配对，失败返回 undefined */
function matchHighlight(
  children: ChildNode[],
  startIndex: number,
  openOffset: number,
): HighlightMatch | undefined {
  const head = (children[startIndex] as Text).value.slice(openOffset + MARKER.length);
  // 高亮不能跨行（与 OFM 的 tokenizer 一致）
  if (head.includes("\n")) {
    return undefined;
  }

  const closeInHead = head.indexOf(MARKER);
  if (closeInHead !== -1) {
    const inner: PhrasingContent[] =
      closeInHead > 0 ? [{ type: "text", value: head.slice(0, closeInHead) }] : [];
    return finalize(inner, startIndex, openOffset + MARKER.length + closeInHead);
  }

  const inner: PhrasingContent[] = [];
  if (head.length) {
    inner.push({ type: "text", value: head });
  }

  for (let index = startIndex + 1; index < children.length; index += 1) {
    const node = children[index];
    if (isText(node)) {
      if (node.value.includes("\n")) {
        return undefined;
      }
      const close = node.value.indexOf(MARKER);
      if (close === -1) {
        if (node.value.length) {
          inner.push({ type: "text", value: node.value });
        }
        continue;
      }
      if (close > 0) {
        inner.push({ type: "text", value: node.value.slice(0, close) });
      }
      return finalize(inner, index, close);
    }
    inner.push(node as PhrasingContent);
  }

  return undefined;
}

function createHighlightNode(inner: PhrasingContent[], color?: string): ChildNode {
  const hProperties: Record<string, string | string[]> = { className: [HIGHLIGHT_CLASS] };
  if (color) {
    hProperties["data-highlight"] = color;
  }
  const node: HighlightNode = {
    type: "highlightColor",
    data: { hName: color ? "mark" : "span", hProperties },
    children: inner,
  };
  return node as unknown as ChildNode;
}

/** 就地重组一层 children 里的 `==…==` */
function wrapHighlights(children: ChildNode[]): void {
  let index = 0;
  /** 当前 text 节点内从这个偏移继续找 `==`（跳过不能配对的） */
  let from = 0;

  while (index < children.length) {
    const node = children[index];
    if (!isText(node)) {
      index += 1;
      from = 0;
      continue;
    }

    const open = node.value.indexOf(MARKER, from);
    if (open === -1) {
      index += 1;
      from = 0;
      continue;
    }

    const match = matchHighlight(children, index, open);
    if (!match) {
      // 配对失败：`==` 原样保留，像 OFM 的 tokenizer 一样逐字符往后重试
      from = open + 1;
      continue;
    }

    const prefix = node.value.slice(0, open);
    const tail = (children[match.endIndex] as Text).value.slice(match.endOffset + MARKER.length);
    const replacement: ChildNode[] = [];
    if (prefix.length) {
      replacement.push({ type: "text", value: prefix });
    }
    replacement.push(createHighlightNode(match.inner, match.color));
    if (tail.length) {
      replacement.push({ type: "text", value: tail });
    }
    children.splice(index, match.endIndex - index + 1, ...replacement);
    // 收尾文本里可能还有高亮，让它成为下一轮扫描的起点；否则跳过整个替换块
    index += replacement.length - (tail.length ? 1 : 0);
    from = 0;
  }
}

/**
 * 遍历整棵树，把 `==…==` 重组为高亮节点。
 *
 * 只在 text 节点上匹配，因此行内代码与代码块里的 `==…==` 不会被误伤；
 * 各层级的 children 都会被处理（段落、标题、表格单元格、列表等）。
 */
export function transformHighlightSyntax(tree: Root): void {
  const parents: Parent[] = [];
  // 先收集、再变换，避免边遍历边改动 children
  visit(tree, (node) => {
    if ("children" in node) {
      parents.push(node as Parent);
    }
  });

  for (const parent of parents) {
    wrapHighlights(parent.children);
  }
}
