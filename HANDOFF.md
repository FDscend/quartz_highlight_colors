# 交接任务书（HANDOFF）

状态：实现、测试、预构建产物、真实站点联调均已完成，GitHub 仓库已关联
（`https://github.com/FDscend/quartz_highlight_colors.git`，main 已同步）；剩下的是
**确认 npm scope 后发布、主站接线**。

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
  - `npm run build`：`dist/` 已生成并做过冒烟测试，`dist/index.js` 的外部 import 只有
    `module`（Node 内建），符合 CI 的 externals 校验
- 文档：`README.md`（英文）、`README.zh.md`（中文）、`AGENTS.md`（开发约定）。

## 联调记录（2026-10-11，已完成）

在 obsidian_tutorial 的 v5 分支**隔离副本**上实测通过（不影响主仓库：

```shell
# 联调环境搭建（一次性）
git clone --depth 1 -b v5 file:///D:/WorkSpace/obsidian_tutorial <site-dir>
cd <site-dir>
git remote set-url origin https://github.com/FDscend/obsidian_tutorial.git
git fetch --depth 1 origin v5 && git checkout FETCH_HEAD -- content   # 同步最新笔记内容
npm ci
npx quartz plugin add <绝对路径>/quartz_highlight_colors              # symlink，直接用 dist/
npx quartz build --serve                                              # http://localhost:8080
```

实测结论：

- [x] "高亮"一节 6 行分别为红/橙/黄/绿/蓝/紫，颜色 emoji 不再显示
- [x] 无颜色的 `==text==` 外观不变（宿主默认底色 `#ffec99`）
- [x] 行内代码里的 `` `==🔴重要==` `` 保持不变色
- [x] 表格单元格内的高亮正常渲染
- [x] 六色成功盖过宿主主题的统一底色（`article :is(mark, .text-highlight)`）
- [ ] 暗色模式未单独验证（颜色是 30% 半透明混合，预计表现一致）

注意：

- `plugin add` 会把**本地绝对路径**写进 `quartz.config.yaml`，只适用于联调；正式接线必须换成
  `github:FDscend/quartz_highlight_colors` 或 npm 包名。
- 报告用的联调副本在 `D:\code\网页\quartz_highlight_colors-site`，可保留复用或直接删除。
- 改完 `src/` 后必须 `npm run build`，symlink 的插件读的是 `dist/`。

## 待办 1：发布前准备

- [ ] **确认 npm 包名 / scope**：当前为 `@obsidian-tutorial/quartz-highlight-colors`。
      若没有这个 npm scope，改成自己的（如 `@fdscend/quartz-highlight-colors`），同步修改
      `package.json` 的 `name` 与两个 README 里的 npm 示例。
- [x] `package.json` 的 `repository` / `homepage` 已填（指向上述 GitHub 仓库）。
- [x] GitHub 仓库已关联（`origin`）。

## 待办 2：发布

两种方式任选：

1. **Changesets（模板默认）**：`npx changeset` → commit → 合并进 main → `release.yml` 自动开版本
   PR 并发布 npm（需在仓库 secrets 配 `NPM_TOKEN`）。
2. **手动**：`npm publish --access public`，然后 `git tag v0.1.0 && git push origin v0.1.0`。

只走 git 源分发则不需要发 npm：别人执行
`npx quartz plugin add github:FDscend/quartz_highlight_colors` 即可（仓库里已带 `dist/`，
安装时无需构建）。

## 待办 3：主站接线（obsidian_tutorial）

在 v5 分支的 `quartz.config.yaml` 的 `plugins` 列表里加一条（放在 OFM 条目之后）：

```yaml
- source: "@obsidian-tutorial/quartz-highlight-colors" # 或 github:FDscend/quartz_highlight_colors
  enabled: true
  order: 36 # 必须晚于 obsidian-flavored-markdown（order: 30）
```

- 走 npm：v5 `package.json` 加依赖 → `npm install` → **提交 `package-lock.json`**（CI 用 `npm ci`，
  lock 不一致会直接失败）。
- 走 git：`npx quartz plugin add github:FDscend/quartz_highlight_colors`，提交 `quartz.config.yaml`
  和 `quartz.lock.json`。
- 部署：push 到 main 触发同步工作流 → 手动 Run v5 的 `deploy.yml` → 核对线上
  `markdown格式总结#高亮` 一节。
- 注意：CSS 由插件注入，**不需要**再改 `.obsidian.default/snippets/.web-snippets`。
- 注意：主仓库本地 `v5` 分支曾落后 `origin/v5` 4 个提交（远程被 force push 过），
  操作前先 `git fetch origin`。

## 待办 4（可选）：让别人能发现

向 Quartz 仓库的 `docs/community.md` 提 PR 登记插件（目前唯一的官方社区列表；Quartz 没有插件市场）。

## 已知边界（不要当 bug 修）

- 用户手写的裸 `<span class="text-highlight">🔴…</span>` 不会被处理：`remark-parse` 会把它拆成多个
  HTML 节点，本插件的支持范围是 OFM 生成的"完整 span 字符串"形态。
- `==**粗体**==` 在 Quartz 上本来就是纯文本（上游 OFM 行为），本插件不改变这一点。
- 高亮内容中的其它 emoji 不受影响；只有紧邻起始 `==` 的六个颜色 emoji 会被识别。
