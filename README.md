# content-collection

Build using node v 14.

```
nvm use 14
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Validation / JSON Schema

The in-progress schema for configuring an advanced listing component (the Content Collection) for [Ripple](https://github.com/dpc-sdp/ripple).

- `schema/schema.js` contains the working draft.
- A [JSON Schema](https://json-schema.org/) version can be found in `./src/validation/schema.json`.

```bash
npm install
npm run validate "./path-to-your-json-schema.json"
```

Or to test an example case:

``` bash
npm run example
```
