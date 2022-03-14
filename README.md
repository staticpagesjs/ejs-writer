# Static Pages / EJS Writer

Renders page data via EJS templates.

Uses the [EJS](https://www.npmjs.com/package/ejs) package under the hood.

This package is part of the StaticPagesJs project, see:
- Documentation: [staticpagesjs.github.io](https://staticpagesjs.github.io/)
- Core: [@static-pages/core](https://www.npmjs.com/package/@static-pages/core)
- CLI tool: [@static-pages/cli](https://www.npmjs.com/package/@static-pages/cli)

## Options

| Option | Type | Default value | Description |
|--------|------|---------------|-------------|
| `view` | `string \| (d: Data) => string` | `main.ejs` | Template to render. If it's a function it gets evaluated on each render call. |
| `viewsDir` | `string \| string[]` | `views` | One or more directory path where the templates are found. |
| `outDir` | `string` | `build` | Directory where the rendered output is saved. |
| `outFile` | `string \| (d: Data) => string` | *see outFile defaults section* | Path of the rendered output relative to `outDir`. |
| `showdownEnabled` | `boolean` | `true` | Register a markdown context function (`this.markdown()`); uses [showdown](http://showdownjs.com/). |
| `showdownOptions` | `showdown.ConverterOptions` | `{ simpleLineBreaks: true, ghCompatibleHeaderId: true, customizedHeaderId: true, tables: true }` | Custom options for the showdown markdown renderer. |

### `outFile` defaults
The default behaviour is to guess file path by a few possible properties of the data:

- if `data.output.path` is defined, use that.
- if `data.output.url` is defined, append `.html` and use that.
- if `data.header.path` is defined, replace extension to `.html` and use that.
- if nothing matches, name it `unnamed-{n}.html` where `{n}` is a counter.

## CLI
This module exports a `cli` function which used by the [CLI tool](https://www.npmjs.com/package/@static-pages/cli) to initialize configuration coming from config file or from command-line arguments.
Everything defined in the `Options` section is valid with the following additions:

| Option | Description |
|--------|-------------|
| `view` | If view looks like a function its evaluated it in a sandbox to a JS function. |
| `outFile` | If outFile looks like a function its evaluated it in a sandbox to a JS function. |

### CLI example
```sh
$ staticpages \
  --from ... \
  --to.module @static-pages/ejs-writer \
  --to.args.view content.ejs \
  --to.args.outFile "d => d.url" \
  --controller ...
```
