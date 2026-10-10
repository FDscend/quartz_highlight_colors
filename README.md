# Quartz Highlight Colors

A [Quartz](https://quartz.jzhao.xyz/) v5 transformer plugin that renders Obsidian's coloured
highlights — `==🔴重要==` — as real coloured highlights, hiding the colour emoji.

| Color  | Markdown         | Rendered                                                        |
| ------ | ---------------- | --------------------------------------------------------------- |
| Red    | `==🔴重要==`     | `<mark class="text-highlight" data-highlight="red">重要</mark>` |
| Orange | `==🟠跟进==`     | `<mark … data-highlight="orange">跟进</mark>`                   |
| Yellow | `==🟡记住这个==` | `<mark … data-highlight="yellow">记住这个</mark>`               |
| Green  | `==🟢已完成==`   | `<mark … data-highlight="green">已完成</mark>`                  |
| Blue   | `==🔵参考==`     | `<mark … data-highlight="blue">参考</mark>`                     |
| Purple | `==🟣想法==`     | `<mark … data-highlight="purple">想法</mark>`                   |

Rules (same as Obsidian and the
[VS Code markdown-highlight-mark extension](https://github.com/FDscend/vscode_markdown_highlight)):

- The colour emoji must come **immediately after the opening `==`** and must be followed by content.
  `==🔴==` and `==重要🔴==` are plain highlights with the emoji kept as text.
- Highlights without a colour emoji keep the site's default highlight styling.
- Only `data-highlight` is added — border radius, padding etc. still come from your theme.

## How it works

`@quartz-community/obsidian-flavored-markdown` (OFM) turns `==text==` into a raw HTML node
`<span class="text-highlight">text</span>`. This plugin runs **after** OFM and rewrites that span
into `<mark class="text-highlight" data-highlight="…">`, dropping the colour emoji, and injects a
small stylesheet with one rule per colour.

## Installation

Git source (works today, no npm release needed):

```shell
npx quartz plugin add github:OWNER/quartz-highlight-colors
```

Or in `quartz.config.yaml`:

```yaml
plugins:
  - source: github:OWNER/quartz-highlight-colors
    enabled: true
    order: 36
```

npm (after publishing):

```yaml
plugins:
  - source: "@obsidian-tutorial/quartz-highlight-colors"
    enabled: true
    order: 36
```

> [!important]
> The plugin must run **after** Obsidian Flavored Markdown (`order: 30`). Its manifest declares
> `defaultOrder: 36`, so just keep the entry after OFM in the plugin list.

Requirements: a Quartz v5 site with `@quartz-community/obsidian-flavored-markdown` enabled
(default `highlight: true`).

## Development

```shell
npm install
npm run build        # tsup → dist/ (committed, ships pre-built)
npm test             # vitest
npm run check        # typecheck + lint + format + test
```

For local integration testing, point a Quartz site at this directory:

```shell
cd <your-quartz-site>
npx quartz plugin add ./path/to/quartz-highlight-colors
npx quartz build --serve
```

Local sources are symlinked, so edits here are picked up immediately (run `npm run build` first).

## Releasing

`dist/` is committed and must stay in sync with `src/`. Two options:

1. **Changesets workflow (template default)** — run `npx changeset`, commit, merge; the
   `release.yml` workflow opens a version PR and publishes with `NPM_TOKEN`.
2. **Manual** — bump `version` in `package.json`, `npm publish --access public`, then tag
   `git tag vX.Y.Z && git push origin vX.Y.Z`.

Keep the `quartz.version` field in `package.json` in sync for manifest consumers.

## License

MIT
