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

npm（发布之后）：

```yaml
plugins:
  - source: "@obsidian-tutorial/quartz-highlight-colors"
    enabled: true
    order: 36
```

> [!important]
> 插件必须运行在 Obsidian Flavored Markdown（`order: 30`）**之后**。清单里已声明
> `defaultOrder: 36`，只要保证配置中它排在 OFM 后面即可。

前置条件：Quartz v5 站点已启用 `@quartz-community/obsidian-flavored-markdown`（`highlight` 默认开启）。

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

`dist/` 已提交，必须与 `src/` 保持同步。两种方式：

1. **Changesets 流程（模板默认）**：`npx changeset` → 提交 → 合并；`release.yml` 会自动开版本 PR
   并用 `NPM_TOKEN` 发布。
2. **手动**：改 `package.json` 的 `version` → `npm publish --access public` →
   `git tag vX.Y.Z && git push origin vX.Y.Z`。

## 许可证

MIT
