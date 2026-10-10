# AGENTS.md

Quartz v5 插件仓库（`@obsidian-tutorial/quartz-highlight-colors`）的开发约定。面向 AI 助手与人类贡献者。

## 项目目标

把 Obsidian 的彩色高亮语法（`==🔴重要==`）在 Quartz 站点上渲染为彩色高亮：

```
<span class="text-highlight">🔴重要</span>   →   <mark class="text-highlight" data-highlight="red">重要</mark>
```

规则必须与 Obsidian 及参考实现 `D:\code\网页\vscode_markdown_highlight`（VS Code 扩展）保持一致。

## 常用命令

```shell
npm install
npm run build        # tsup 打包（会先跑 src/build/validate-manifest.ts 校验清单）
npm test             # vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint --max-warnings=0
npm run format:write # prettier --write（提交前跑）
npm run check        # typecheck + lint + format + test
```

## 目录结构

- `src/colors.ts`：颜色调色板、`==` 高亮 span 的正则改写、CSS 生成（**颜色只在这里定义一处**）。
- `src/highlight-colors.ts`：插件工厂 `HighlightColors` 与 remark 插件 `remarkHighlightColors`。
- `src/index.ts` / `src/types.ts`：对外导出。
- `test/highlight-colors.test.ts`：vitest 用例。
- `dist/`：预构建产物，**提交进仓库**（Quartz 的 git/npm 安装都直接用它，不再构建）。
- `tsup.config.ts`：打包配置；`SINGLETON_EXTERNALS` 之外的依赖全部内联进 dist。

## 硬性约定

1. **提交 dist**：改完 `src/` 必须 `npm run build` 并提交 `dist/`；CI 会校验 dist 的外部 import
   只允许单例依赖与 `@quartz-community/*`。
2. **执行顺序**：插件必须晚于 `@quartz-community/obsidian-flavored-markdown`（`order: 30`）运行，
   清单里 `defaultOrder: 36` 就是为了这个；改顺序前先确认 OFM 的输出形态。
3. **只处理 OFM 的节点形态**：插件遍历 mdast 的 `html` 节点，匹配完整字符串
   `<span class="text-highlight">…</span>`（OFM 会把 `==…==` 整体替换成这样一个节点）。
   reminder：`remark-parse` 会把用户手写的裸 `<span>` 拆成多个节点，那种情况不在支持范围。
4. **样式只覆盖背景色**：保留 `class="text-highlight"`，选择器用
   `article :is(mark, .text-highlight)[data-highlight="…"]` 提高特异性，以便盖过宿主站点主题的
   统一高亮底色；不要引入 `!important`。
5. **新增颜色**：只在 `src/colors.ts` 的 `colorPalette` 里加一条，CSS 与测试会自动覆盖（测试按调色板遍历）。
6. **文案与注释用中文**，提交信息用中文或英文均可但需一致、简洁。
7. **不要引入构建期依赖**：运行时只允许 import 类型（`@quartz-community/types`）；其它依赖交给 tsup 内联。

## 边界规则（不要"顺手修复"）

- `==🔴==`（只有表情）与 `==重要🔴==`（表情不在开头）都**不是**颜色标记，保持默认高亮 + 表情原样。
- 行内代码与代码块里的 `==…==` 不经本插件处理。
- OFM 会把高亮内容当纯文本，`==**粗体**==` 在 Quartz 上本来就不会加粗，属上游现状。

## 测试要求

- 新增规则必须补 `test/highlight-colors.test.ts` 用例（颜色映射、位置规则、U+FE0F、多高亮、CSS 规则）。
- `npm run check` 必须全绿。

## 发布与交接

发布流程、主站接线、联调步骤见 `HANDOFF.md`。
