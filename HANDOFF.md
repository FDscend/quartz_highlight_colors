# 交接任务书（HANDOFF）

状态：插件骨架、实现、测试、预构建产物均已完成并通过本地校验；剩下的是**联调、发布、主站接线**。

## 已完成

- 仓库基于官方模板 [quartz-community/plugin-template](https://github.com/quartz-community/plugin-template)
  建立（tsup 打包 + vitest + eslint/prettier + CI + changesets 发布流程），模板示例代码已清理。
- 实现：
  - `src/colors.ts`：六色调色板、`applyHighlightColors()`（span → mark 正则改写）、`buildHighlightCss()`
  - `src/highlight-colors.ts`：`HighlightColors` 插件（remark 阶段改写 + `externalResources` 注入 CSS）
  - `src/index.ts` / `src/types.ts`：对外导出
  - `package.json` 清单：`quartz.name = highlight-colors`，`defaultOrder = 36`（晚于 OFM 的 30）
- 本地验证结果：
  - `npm run typecheck`、`npm run lint`、`npm run format --check`：通过
  - `npm test`：10 个用例全部通过
  - `npm run build`：`dist/` 已生成并做过冒烟测试：
    `applyHighlightColors('<span class="text-highlight">🔴重要</span>')`
    → `<mark class="text-highlight" data-highlight="red">重要</mark>`
  - `dist/index.js` 的外部 import 只有 `module`（Node 内建），符合 CI 的 externals 校验
- 文档：`README.md`（英文）、`README.zh.md`（中文）、`AGENTS.md`（开发约定）。

## 待办 1：本地联调（在真实 Quartz 站点验证）

```shell
# 在任意 Quartz v5 站点的本地工作副本里
cd <quartz-site>
npx quartz plugin add <绝对路径>/quartz_highlight_colors    # 本地路径会被 symlink 进 .quartz/plugins
npx quartz build --serve
```

检查清单：

- [ ] `markdown格式总结.md` 的"高亮"一节：6 行显示为对应颜色，且颜色 emoji 不再显示
- [ ] 无颜色的 `==text==` 外观与之前一致（宿主主题的默认高亮底色）
- [ ] 行内代码里的 `` `==🔴重要==` `` 保持不变色
- [ ] 表格单元格内的高亮正常渲染
- [ ] 暗色模式下颜色可读
- [ ] 宿主主题若有统一底色（例如 obsidian_tutorial 的 `--border-mark-background: #ffec99`），
      确认六色能盖住它（插件选择器已按 `[data-highlight]` 提高特异性）

改完 `src/` 后必须 `npm run build`，symlink 的插件读的是 `dist/`。

## 待办 2：发布前准备

- [ ] **确认 npm 包名 / scope**：当前为 `@obsidian-tutorial/quartz-highlight-colors`。
      若没有这个 npm scope，改成自己的（如 `@fdscend/quartz-highlight-colors`），同步修改
      `package.json` 的 `name` 和两个 README 里的示例。
- [ ] 填写 `package.json` 的 `repository` / `homepage`（当前未填，npm 页面会缺链接）。
- [ ] 新建 GitHub 仓库并关联：`git remote add origin <你的仓库地址>`（模板的 `.git` 已删除，
      历史从这里重新开始；若想保留模板历史需重新 clone 模板）。

## 待办 3：发布

两种方式任选：

1. **Changesets（模板默认）**：`npx changeset` → commit → 合并进 main → `release.yml` 自动开版本
   PR 并发布 npm（需在仓库 secrets 配 `NPM_TOKEN`）。
2. **手动**：`npm publish --access public`，然后 `git tag v0.1.0 && git push origin v0.1.0`。

只走 git 源分发则不需要发 npm：别人执行
`npx quartz plugin add github:<owner>/quartz-highlight-colors` 即可（仓库里已带 `dist/`，
安装时无需构建）。

## 待办 4：主站接线（obsidian_tutorial）

在 v5 分支的 `quartz.config.yaml` 的 `plugins` 列表里加一条（放在 OFM 条目之后）：

```yaml
- source: "@obsidian-tutorial/quartz-highlight-colors" # 或 github:<owner>/quartz-highlight-colors
  enabled: true
  order: 36 # 必须晚于 obsidian-flavored-markdown（order: 30）
```

- 走 npm：v5 `package.json` 加依赖 → `npm install` → **提交 `package-lock.json`**（CI 用 `npm ci`，
  lock 不一致会直接失败）。
- 走 git：`npx quartz plugin add github:<owner>/quartz-highlight-colors`，提交 `quartz.config.yaml`
  和 `quartz.lock.json`。
- 部署：push 到 main 触发同步工作流 → 手动 Run v5 的 `deploy.yml` → 核对线上
  `markdown格式总结#高亮` 一节。
- 注意：CSS 由插件注入，**不需要**再改 `.obsidian.default/snippets/.web-snippets`。

## 待办 5（可选）：让别人能发现

向 Quartz 仓库的 `docs/community.md` 提 PR 登记插件（目前唯一的官方社区列表；Quartz 没有插件市场）。

## 已知边界（不要当 bug 修）

- 用户手写的裸 `<span class="text-highlight">🔴…</span>` 不会被处理：`remark-parse` 会把它拆成多个
  HTML 节点，本插件的支持范围是 OFM 生成的"完整 span 字符串"形态。
- `==**粗体**==` 在 Quartz 上本来就是纯文本（上游 OFM 行为），本插件不改变这一点。
- 高亮内容中的其它 emoji 不受影响；只有紧邻起始 `==` 的六个颜色 emoji 会被识别。
