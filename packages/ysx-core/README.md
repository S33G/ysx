# YSX Core

Core parser and transpiler for YSX (YAML Syntax Extension) - a build-time transpiler that converts YAML-based React components to standard JSX.

## Installation

```bash
npm install ysx-core
```

## Usage

```javascript
const { YSXParser, YSXTranspiler } = require('ysx-core');

const yamlSource = `
name: MyComponent
render:
  div:
    children: Hello World
`;

const parser = new YSXParser();
const transpiler = new YSXTranspiler();

const ast = parser.parse(yamlSource);
const jsxCode = transpiler.transpile(ast);

console.log(jsxCode);
```

## API

### YSXParser

Parses YSX (YAML) source code into an AST.

**Methods:**
- `parse(yamlString: string): YSXDocument` - Parse YAML to AST

### YSXTranspiler

Transpiles YSX AST to JSX/TSX code.

**Constructor:**
- `new YSXTranspiler(options?)` 
  - `options.typescript: boolean` - Generate TypeScript output

**Methods:**
- `transpile(ast: YSXDocument): string` - Generate JSX/TSX code

## Features

- Custom YAML tags (`!!js`, `!!ts`)
- String interpolation with `{variable}`
- Arrow function support
- Object and array handling
- React hooks integration

## License

MIT
