# Changelog

## 0.2.0

- 新增接管模式：站点把 Obsidian Flavored Markdown 的高亮解析关闭（`highlight: false`）时，
  插件在 mdast 层接管 `==…==`，高亮内的加粗、斜体、行内代码与链接会正常解析；
  两种形态（OFM 的 span 与裸文本）可以在同一插件里共存。
- 接管模式的边界与 OFM 的 tokenizer 对齐：空内容（`====`）、以 `=` 开头（`===a==`）、未闭合、
  跨行的高亮都保持原样，配对失败时逐字符向后重试。

## 0.1.0

- 首个版本：把 Obsidian 彩色高亮 `==🔴重要==` 渲染为
  `<mark class="text-highlight" data-highlight="red">重要</mark>`（颜色表情被剥离），
  并由插件注入六色样式；无颜色标记的高亮保持站点默认外观。
