# Quartz Highlight Colors

| [English](README.md) | [中文](README.zh.md) |
| -------------------- | -------------------- |

A [Quartz](https://quartz.jzhao.xyz/) v5 transformer plugin that renders Obsidian's coloured
highlights — `==🔴Important==` — as real coloured highlights, hiding the colour emoji.

| Color  | Markdown              | Rendered                                                             |
| ------ | --------------------- | -------------------------------------------------------------------- |
| Red    | `==🔴Important==`     | `<mark class="text-highlight" data-highlight="red">Important</mark>` |
| Orange | `==🟠Follow up==`     | `<mark … data-highlight="orange">Follow up</mark>`                   |
| Yellow | `==🟡Remember this==` | `<mark … data-highlight="yellow">Remember this</mark>`               |
| Green  | `==🟢Done==`          | `<mark … data-highlight="green">Done</mark>`                         |
| Blue   | `==🔵Reference==`     | `<mark … data-highlight="blue">Reference</mark>`                     |
| Purple | `==🟣Idea==`          | `<mark … data-highlight="purple">Idea</mark>`                        |

Rules (same as Obsidian and the
[VS Code markdown-highlight-mark extension](https://github.com/FDscend/vscode_markdown_highlight)):

- The colour emoji must come **immediately after the opening `==`** and must be followed by content.
  `==🔴==` and `==Important🔴==` are plain highlights with the emoji kept as text.
- Highlights without a colour emoji keep the site's default highlight styling.
- Only `data-highlight` is added — border radius, padding etc. still come from your theme.

## How it works

`@quartz-community/obsidian-flavored-markdown` (OFM) turns `==text==` into a raw HTML node
`<span class="text-highlight">text</span>`. This plugin runs **after** OFM and rewrites that span
into `<mark class="text-highlight" data-highlight="…">`, dropping the colour emoji, and injects a
small stylesheet with one rule per colour.

When the site turns OFM's highlight parsing off (`highlight: false`), `==text==` reaches the mdast
as plain text instead. The plugin then takes over at the mdast level, producing the same
`<mark>` / `<span>` output, and Markdown inside the highlight is parsed normally (see
"Nested Markdown" below). Both shapes can coexist, so switching the option before or after
installing the plugin is safe.

## Installation

Git source (works today, no npm release needed):

```shell
npx quartz plugin add github:FDscend/quartz_highlight_colors
```

Or in `quartz.config.yaml`:

```yaml
plugins:
  - source: github:FDscend/quartz_highlight_colors
    enabled: true
    order: 36
```

> [!note]
> The plugin is currently distributed through GitHub only — there is no npm release yet. If you
> publish it to npm later, register it as `source: "@your-scope/quartz-highlight-colors"` in the
> same way.

> [!important]
> The plugin must run **after** Obsidian Flavored Markdown (`order: 30`). Its manifest declares
> `defaultOrder: 36`, so just keep the entry after OFM in the plugin list.

Requirements: a Quartz v5 site with `@quartz-community/obsidian-flavored-markdown` enabled
(default `highlight: true`; set it to `false` to let this plugin take over — see below).

## Nested Markdown (optional)

OFM treats highlight content as **plain text**: `==🔴**bold**==` renders literal asterisks. To get
emphasis, inline code and links inside highlights, turn OFM's highlight parsing off and let this
plugin take over:

```yaml
plugins:
  - source: "@quartz-community/obsidian-flavored-markdown"
    enabled: true
    options:
      highlight: false # handled by highlight-colors
    order: 30
  - source: github:FDscend/quartz_highlight_colors
    enabled: true
    order: 36
```

Colour rules are identical to the default mode; nesting is the only difference:

| Markdown                      | Rendered                                                 |
| ----------------------------- | -------------------------------------------------------- |
| `==🔴**Important**==`         | `<mark …><strong>Important</strong></mark>`              |
| `==🔵*Reference*==`           | `<mark …><em>Reference</em></mark>`                      |
| `==🟡[link](https://q.dev)==` | `<mark …><a href="https://q.dev">link</a></mark>`        |
| `==**plain highlight**==`     | `<span class="text-highlight"><strong>…</strong></span>` |

> [!warning]
> `highlight: false` and this plugin must be configured **together**: turning OFM's parsing off
> without enabling the plugin leaves `==…==` as literal text on your pages.

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

`dist/` is committed and must stay in sync with `src/`. Git tags are the release:

1. **Git tag (current flow)** — bump `version` in `package.json`, run `npm run build`, commit,
   then `git tag vX.Y.Z && git push origin vX.Y.Z`. Sites can pin it with
   `npx quartz plugin add github:FDscend/quartz_highlight_colors#vX.Y.Z`.
2. **npm (optional)** — the template's changesets workflow was removed because this plugin is
   distributed via git only. If you ever publish to npm, restore `release.yml` from the repository
   history, set `NPM_TOKEN`, then run `npx changeset`, commit and merge.

Keep the `quartz.version` field in `package.json` in sync for manifest consumers.

## License

MIT
