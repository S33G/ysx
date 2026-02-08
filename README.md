# YSX - YAML Syntax Extension for React

**YSX** (YAML Syntax Extension) is a build-time transpiler that lets you write React components in YAML format. It provides a clean, declarative syntax that compiles to standard JSX/TSX at build time.

## Features

- ✅ **Build-time transpilation** - Zero runtime overhead
- ✅ **Full React support** - Hooks, state, props, events
- ✅ **TypeScript ready** - Type definitions included
- ✅ **Webpack & Vite integration** - Drop-in loaders available
- ✅ **Hot reload support** - Works seamlessly with dev servers
- ✅ **Standalone CLI** - Transpile files directly
- ✅ **React 19 compatible** - Uses latest React APIs

## Quick Start

### Installation

```bash
npm install ysx-core ysx-loader --save-dev
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ysx$/,
        use: [
          'babel-loader',
          'ysx-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ysx']
  }
};
```

### Example Component

Create an `App.ysx` file:

```yaml
---
name: App

imports:
  - from: react
    default: React
  - from: ./logo.svg
    default: logo
  - from: ./App.css

render:
  div:
    className: App
    children:
      - header:
          className: App-header
          children:
            - img:
                src: !!js |
                  logo
                className: App-logo
                alt: logo
            - p:
                children:
                  - "Edit "
                  - code:
                      children: "src/App.js"
                  - " and save to reload."
            - a:
                className: App-link
                href: "https://reactjs.org"
                target: _blank
                rel: noopener noreferrer
                children: Learn React
```

Use it in your app:

```javascript
import App from './App.ysx';

function Main() {
  return <App />;
}
```

## YSX Syntax Reference

### Basic Component Structure

```yaml
---
version: 1.0
name: ComponentName

# Explicit imports (recommended)
imports:
  - from: react
    default: React
    named: [useState, useEffect]
  - from: ./styles.css
  - from: ./utils
    default: helper

# Component hooks
hooks:
  - useState:
      variable: count
      initialValue: 0

# Render tree
render:
  div:
    className: "container"
    children: Hello World
```

### Imports Syntax

YSX supports explicit import declarations:

```yaml
imports:
  # Default + named imports
  - from: react
    default: React
    named: [useState, useEffect, useMemo]

  # Default import only
  - from: ./MyComponent
    default: MyComponent

  # Named imports only
  - from: lodash
    named: [map, filter, reduce]

  # Side-effect import (CSS, etc.)
  - from: ./styles.css
```

If no `imports` field is provided, YSX will auto-generate React imports based on hooks usage (backward compatible).

### JSExpression Tag

Use `!!js` for inline JavaScript expressions:

```yaml
render:
  button:
    onClick: !!js |
      () => console.log('Clicked!')
    children: Click Me
```

### String Interpolation

Use `{variable}` syntax for template strings:

```yaml
render:
  p: "Welcome, {props.username}!"
```

### Nested Elements

```yaml
render:
  div:
    children:
      - h1: Title
      - p: Paragraph text
      - button:
          onClick: !!js | () => handleClick()
          children: Action
```

### Styling

```yaml
render:
  div:
    style:
      display: flex
      padding: "10px"
      backgroundColor: "#f0f0f0"
    children: Styled content
```

## CLI Usage

Transpile YSX files directly:

```bash
npx ysx transpile src/Component.ysx output.jsx
npx ysx transpile src/Component.ysx output.tsx --typescript
```

## Monorepo Packages

- **ysx-core** - Parser and transpiler
- **ysx-loader** - Webpack/Vite loader
- **ysx-cli** - Command-line tool
- **ysx-types** - TypeScript definitions

## Development

```bash
# Install dependencies
make install

# Build all packages
make build

# Run tests
make test

# Build example
make example
```

## Publishing

```bash
# Version packages
npm run version

# Publish to NPM
npm run publish
```

## TypeScript Support

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["ysx-types"]
  }
}
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © 2026

## Links

- [Documentation](docs/)
- [Examples](examples/)
- [Issue Tracker](https://github.com/S33G/ysx/issues)
