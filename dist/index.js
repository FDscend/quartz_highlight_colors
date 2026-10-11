import { createRequire } from 'module';

createRequire(import.meta.url);

// node_modules/unist-util-is/lib/index.js
var convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  })
);
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index === "number" ? index : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}

// node_modules/unist-util-visit-parents/lib/color.node.js
function color(d) {
  return "\x1B[33m" + d + "\x1B[39m";
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node, index, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node && typeof node === "object" ? node : {}
    );
    if (typeof value.type === "string") {
      const name = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}

// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
    test = void 0;
    visitor = testOrVisitor;
    reverse = visitorOrReverse;
  } else {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index = parent ? parent.children.indexOf(node) : void 0;
    return visitor(node, index, parent);
  }
}

// src/colors.ts
var colorPalette = [
  {
    emoji: "\u{1F534}",
    color: "red",
    background: "color-mix(in oklch, rgb(221, 44, 56) 30%, transparent)"
  },
  {
    emoji: "\u{1F7E0}",
    color: "orange",
    background: "color-mix(in oklch, rgb(222, 116, 23) 30%, transparent)"
  },
  {
    emoji: "\u{1F7E1}",
    color: "yellow",
    background: "color-mix(in oklch, rgb(192, 156, 12) 30%, transparent)"
  },
  {
    emoji: "\u{1F7E2}",
    color: "green",
    background: "color-mix(in oklch, rgb(29, 165, 29) 30%, transparent)"
  },
  {
    emoji: "\u{1F535}",
    color: "blue",
    background: "color-mix(in oklch, rgb(23, 117, 217) 30%, transparent)"
  },
  {
    emoji: "\u{1F7E3}",
    color: "purple",
    background: "color-mix(in oklch, rgb(143, 71, 225) 30%, transparent)"
  }
];
var VARIATION_SELECTOR = "\uFE0F";
var HIGHLIGHT_SPAN = /<span class="text-highlight">([\s\S]*?)<\/span>/g;
function readColorMarker(text) {
  for (const { emoji, color: color2 } of colorPalette) {
    if (text.startsWith(emoji + VARIATION_SELECTOR)) {
      return { color: color2, length: emoji.length + VARIATION_SELECTOR.length };
    }
    if (text.startsWith(emoji)) {
      return { color: color2, length: emoji.length };
    }
  }
  return void 0;
}
function applyHighlightColors(html) {
  return html.replace(HIGHLIGHT_SPAN, (span, inner) => {
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
function buildHighlightCss() {
  return colorPalette.map(
    ({ color: color2, background }) => `article :is(mark, .text-highlight)[data-highlight="${color2}"] {
  background-color: ${background};
}`
  ).join("\n\n");
}

// src/highlight-syntax.ts
var MARKER = "==";
var HIGHLIGHT_CLASS = "text-highlight";
function isText(node) {
  return node?.type === "text";
}
function isEmpty(nodes) {
  return nodes.every((node) => node.type === "text" && node.value.length === 0);
}
function finalize(inner, endIndex, endOffset) {
  if (isEmpty(inner)) {
    return void 0;
  }
  const [first] = inner;
  if (first?.type === "text" && first.value.startsWith("=")) {
    return void 0;
  }
  if (first?.type === "text") {
    const marker = readColorMarker(first.value);
    if (marker) {
      const rest = first.value.slice(marker.length);
      const stripped = rest.length ? [{ type: "text", value: rest }, ...inner.slice(1)] : inner.slice(1);
      if (!isEmpty(stripped)) {
        return { endIndex, endOffset, inner: stripped, color: marker.color };
      }
    }
  }
  return { endIndex, endOffset, inner };
}
function matchHighlight(children, startIndex, openOffset) {
  const head = children[startIndex].value.slice(openOffset + MARKER.length);
  if (head.includes("\n")) {
    return void 0;
  }
  const closeInHead = head.indexOf(MARKER);
  if (closeInHead !== -1) {
    const inner2 = closeInHead > 0 ? [{ type: "text", value: head.slice(0, closeInHead) }] : [];
    return finalize(inner2, startIndex, openOffset + MARKER.length + closeInHead);
  }
  const inner = [];
  if (head.length) {
    inner.push({ type: "text", value: head });
  }
  for (let index = startIndex + 1; index < children.length; index += 1) {
    const node = children[index];
    if (isText(node)) {
      if (node.value.includes("\n")) {
        return void 0;
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
    inner.push(node);
  }
  return void 0;
}
function createHighlightNode(inner, color2) {
  const hProperties = { className: [HIGHLIGHT_CLASS] };
  if (color2) {
    hProperties["data-highlight"] = color2;
  }
  const node = {
    type: "highlightColor",
    data: { hName: color2 ? "mark" : "span", hProperties },
    children: inner
  };
  return node;
}
function wrapHighlights(children) {
  let index = 0;
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
      from = open + 1;
      continue;
    }
    const prefix = node.value.slice(0, open);
    const tail = children[match.endIndex].value.slice(match.endOffset + MARKER.length);
    const replacement = [];
    if (prefix.length) {
      replacement.push({ type: "text", value: prefix });
    }
    replacement.push(createHighlightNode(match.inner, match.color));
    if (tail.length) {
      replacement.push({ type: "text", value: tail });
    }
    children.splice(index, match.endIndex - index + 1, ...replacement);
    index += replacement.length - (tail.length ? 1 : 0);
    from = 0;
  }
}
function transformHighlightSyntax(tree) {
  const parents = [];
  visit(tree, (node) => {
    if ("children" in node) {
      parents.push(node);
    }
  });
  for (const parent of parents) {
    wrapHighlights(parent.children);
  }
}

// src/highlight-colors.ts
var remarkHighlightColors = () => (tree) => {
  transformHighlightSyntax(tree);
  visit(tree, "html", (node) => {
    node.value = applyHighlightColors(node.value);
  });
};
var HighlightColors = () => {
  return {
    name: "HighlightColors",
    markdownPlugins() {
      return [remarkHighlightColors];
    },
    externalResources() {
      return {
        css: [{ content: buildHighlightCss(), inline: true }]
      };
    }
  };
};

export { HighlightColors, applyHighlightColors, buildHighlightCss, colorPalette, remarkHighlightColors, transformHighlightSyntax };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map