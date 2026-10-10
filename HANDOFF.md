# 交接任务书（HANDOFF）

状态：实现、测试、预构建产物、真实站点联调均已完成，GitHub 仓库已关联
（`https://github.com/FDscend/quartz_highlight_colors.git`，main 已同步），分发方式确定为
**git 源**（暂不注册 npm）；剩下的是**打 tag 发版、主站接线**。

## 已完成

- 仓库基于官方模板 [quartz-community/plugin-template](https://github.com/quartz-community/plugin-template)
  建立（tsup 打包 + vitest + eslint/prettier + CI），模板示例代码已清理。
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
- 已移除模板自带的 `.github/workflows/release.yml`（changesets 自动发 npm）：它在每次 push main
  时会执行 `changeset publish`，因未配置 `NPM_TOKEN` 而失败（Run 注解为 "Publish command exited
  with code 1"，不影响 CI 与插件分发）。本插件只走 git 源，无需该 workflow；恢复方式：
  `git show 1665d9f:.github/workflows/release.yml > .github/workflows/release.yml`。

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
- [x] 深色模式已验证可读（30% 半透明混合在深色底上表现正常）

注意：

- `plugin add` 会把**本地绝对路径**写进 `quartz.config.yaml`，只适用于联调；正式接线必须换成
  `github:FDscend/quartz_highlight_colors`（将来若发 npm 才可改用包名）。
- 报告用的联调副本在 `D:\code\网页\quartz_highlight_colors-site`，可保留复用或直接删除。
- 改完 `src/` 后必须 `npm run build`，symlink 的插件读的是 `dist/`。

## 待办 1（可选）：发布到 npm

当前决定：**只走 git 源分发**（`github:FDscend/quartz_highlight_colors`），不注册 npm。
仓库已提交预构建 `dist/`，Quartz 安装 git 源插件时直接使用 dist、不做构建，安装体验与 npm 接近。

将来需要时再发 npm（好处：语义化版本范围、registry 分发、版本不可篡改、便于被社区采用）：

- [ ] 确认 npm 包名 / scope（原计划 `@obsidian-tutorial/quartz-highlight-colors`，也可用个人 scope），
      同步修改 `package.json` 的 `name` 与两个 README 的示例。
- [ ] `npm publish --access public`（手动），或从仓库历史恢复模板的 `release.yml` 并配
      `NPM_TOKEN` 自动发布。

- [x] `package.json` 的 `repository` / `homepage` 已填（指向上述 GitHub 仓库）。
- [x] GitHub 仓库已关联（`origin`）。

## 待办 2：发版（git 源）

改完代码后：`npm run build` → 提交 `dist/` → 打 tag。两种等价做法：

- 命令行：`git tag -a v0.1.0 -m "v0.1.0" && git push origin v0.1.0`
- GitHub UI：Releases → Draft a new release → 在「Choose a tag」里**直接输入一个新 tag 名**
  （如 `v0.1.0`），选择 "Create new tag on publish"，目标选 `main`，填 release notes 后 Publish；
  GitHub 会自动创建该 tag，无需先在命令行建 tag。

站点侧固定版本：`npx quartz plugin add github:FDscend/quartz_highlight_colors#v0.1.0`；
不写 `#ref` 则跟随默认分支（升级用 `npx quartz plugin install --latest`）。

（可选）将来若发 npm：手动 `npm publish --access public`，或从仓库历史恢复 changesets 的
`release.yml`。

## 待办 3：主站接线（obsidian_tutorial）

在 v5 分支的 `quartz.config.yaml` 的 `plugins` 列表里加一条（放在 OFM 条目之后）：

```yaml
- source: github:FDscend/quartz_highlight_colors
  enabled: true
  order: 36 # 必须晚于 obsidian-flavored-markdown（order: 30）
```

- 执行 `npx quartz plugin add github:FDscend/quartz_highlight_colors`（会同时写 `quartz.config.yaml`
  与 `quartz.lock.json`），提交这两个文件。
- （将来若走 npm）v5 `package.json` 加依赖 → `npm install` → **提交 `package-lock.json`**（CI 用
  `npm ci`，lock 不一致会直接失败）。
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
