# Quartz Highlight Colors

| [English](README.md) | [中文](README.zh.md) |
| -------------------- | -------------------- |

[Quartz](https://quartz.jzhao.xyz/) v5 插件：把 Obsidian 的彩色高亮 `==🔴重要==` 渲染成真正的彩色高亮，
颜色表情作为颜色标记被隐藏。

| 颜色 | Markdown 语法    | 渲染结果                                                        |
| ---- | ---------------- | --------------------------------------------------------------- |
| 红色 | `==🔴重要==`     | `<mark class="text-highlight" data-highlight="red">重要</mark>` |
| 橙色 | `==🟠跟进==`     | `<mark … data-highlight="orange">跟进</mark>`                   |
| 黄色 | `==🟡记住这个==` | `<mark … data-highlight="yellow">记住这个</mark>`               |
| 绿色 | `==🟢已完成==`   | `<mark … data-highlight="green">已完成</mark>`                  |
| 蓝色 | `==🔵参考==`     | `<mark … data-highlight="blue">参考</mark>`                     |
| 紫色 | `==🟣想法==`     | `<mark … data-highlight="purple">想法</mark>`                   |

规则与 Obsidian 及
[VS Code 扩展 markdown-highlight-mark](https://github.com/FDscend/vscode_markdown_highlight) 一致：

- 颜色表情必须**紧跟在起始 `==` 之后**，且其后必须有内容；`==🔴==`、`==重要🔴==` 按普通高亮渲染，
  表情原样显示。
- 没有颜色表情的高亮保持站点默认样式。
- 只额外添加 `data-highlight`，圆角、内边距等外观仍由你的主题决定。

## 工作原理

`@quartz-community/obsidian-flavored-markdown`（OFM）会把 `==文字==` 变成原始 HTML 节点
`<span class="text-highlight">文字</span>`；本插件在 OFM **之后**运行，把它改写成
`<mark class="text-highlight" data-highlight="…">`（剥离颜色表情），并注入一份按颜色区分的样式。

若站点关闭了 OFM 的高亮解析（`highlight: false`），`==文字==` 会以普通文本进入 mdast，
本插件会在 mdast 层接管并生成同样的 `<mark>` / `<span>`，此时高亮内容里的 Markdown 会被正常解析
（见下文"嵌套 Markdown"）。两种形态可以共存，同一份站点先改配置再装插件都不会出问题。

## 安装

Git 源（无需发布到 npm）：

```shell
npx quartz plugin add github:FDscend/quartz_highlight_colors
```

或在 `quartz.config.yaml` 中：

```yaml
plugins:
  - source: github:FDscend/quartz_highlight_colors
    enabled: true
    order: 36
```

> [!note]
> 插件目前只通过 GitHub 分发（尚未发布 npm）。将来若发到 npm，写法同样是
> `source: "@你的scope/quartz-highlight-colors"`。

> [!important]
> 插件必须运行在 Obsidian Flavored Markdown（`order: 30`）**之后**。清单里已声明
> `defaultOrder: 36`，只要保证配置中它排在 OFM 后面即可。

前置条件：Quartz v5 站点已启用 `@quartz-community/obsidian-flavored-markdown`（默认
`highlight: true`；若改为 `false` 由本插件接管，见下文）。

## 嵌套 Markdown（可选）

OFM 默认把高亮内容当**纯文本**处理：`==🔴**粗体**==` 只会显示字面的星号。若希望高亮内能用
加粗、斜体、行内代码、链接等写法，把 OFM 的高亮解析关掉，交给本插件接管：

```yaml
plugins:
  - source: "@quartz-community/obsidian-flavored-markdown"
    enabled: true
    options:
      highlight: false # 由 highlight-colors 接管 ==…==
    order: 30
  - source: github:FDscend/quartz_highlight_colors
    enabled: true
    order: 36
```

接管模式的颜色规则与默认模式完全一致，额外支持嵌套：

| Markdown                      | 渲染结果                                                 |
| ----------------------------- | -------------------------------------------------------- |
| `==🔴**重要**==`              | `<mark …><strong>重要</strong></mark>`                   |
| `==🔵*参考*==`                | `<mark …><em>参考</em></mark>`                           |
| `==🟡[链接](https://q.dev)==` | `<mark …><a href="https://q.dev">链接</a></mark>`        |
| `==**普通高亮**==`            | `<span class="text-highlight"><strong>…</strong></span>` |

> [!warning]
> `highlight: false` 与启用本插件要**成对配置**：只关掉 OFM 而不启用本插件，页面上的
> `==…==` 会原样显示成字面文本。

## 开发

```shell
npm install
npm run build        # tsup 打包到 dist/（dist 需提交，随包分发）
npm test             # vitest
npm run check        # typecheck + lint + format + test
```

本地联调：让 Quartz 站点直接引用本目录。

```shell
cd <你的 Quartz 站点>
npx quartz plugin add ./path/to/quartz-highlight-colors
npx quartz build --serve
```

本地路径是符号链接，改完源码先 `npm run build` 再刷新即可。

## 发布

`dist/` 已提交，必须与 `src/` 保持同步。以 tag 发版：

1. **打 tag（当前流程）**：改 `package.json` 的 `version` → `npm run build` → 提交 →
   `git tag vX.Y.Z && git push origin vX.Y.Z`。站点可用
   `npx quartz plugin add github:FDscend/quartz_highlight_colors#vX.Y.Z` 固定版本。
2. **npm（可选）**：模板自带的 changesets 自动发布 workflow 已移除（本插件只走 git 源分发）。
   将来若需发 npm，可从仓库历史恢复 `release.yml`、配置 `NPM_TOKEN`，再 `npx changeset` → 提交 → 合并。

## 许可证

MIT
