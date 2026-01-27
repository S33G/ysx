# YSX Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Install Dependencies

```bash
cd /home/seeg/code/jsy-demo
make install
```

### 2. Build All Packages

```bash
make build
```

### 3. Run Tests

```bash
make test
```

### 4. Build Example Counter App

```bash
make example
```

The built app will be in `examples/webpack-app/dist/index.html`

## Try It Yourself

### Create a New YSX Component

**File: `MyComponent.ysx`**
```yaml
---
name: Greeting

hooks:
  - useState:
      variable: name
      initialValue: "World"

render:
  div:
    style:
      padding: "20px"
      fontFamily: "Arial, sans-serif"
    children:
      - h1: "Hello, {name}!"
      - input:
          type: text
          value: "{name}"
          onChange: !!js |
            (e) => setName(e.target.value)
          style:
            padding: "8px"
            fontSize: "16px"
```

### Transpile with CLI

```bash
cd packages/ysx-cli
node src/cli.js transpile MyComponent.ysx Output.jsx
```

### Use in Webpack Project

1. Add to `webpack.config.js`:
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.ysx$/,
        use: ['babel-loader', 'ysx-loader']
      }
    ]
  }
};
```

2. Import in your app:
```javascript
import MyComponent from './MyComponent.ysx';

function App() {
  return <MyComponent />;
}
```

## Makefile Commands Reference

```bash
make help       # Show all available commands
make install    # Install dependencies
make build      # Build all packages
make test       # Run all tests
make clean      # Remove build artifacts
make example    # Build example app
make publish    # Publish to NPM (not executed)
```

## Package Scripts

### Root
```bash
npm run build    # Build all packages
npm run test     # Test all packages
npm run version  # Version packages with Lerna
npm run publish  # Publish to NPM
```

### ysx-core
```bash
cd packages/ysx-core
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Example App
```bash
cd examples/webpack-app
npm run build   # Production build
npm start       # Dev server (port 8080)
```

## Publishing to NPM

**When ready to publish:**

```bash
# 1. Commit all changes
git add .
git commit -m "feat: initial YSX implementation"

# 2. Version packages
npm run version
# Follow prompts to select version bump

# 3. Publish
npm run publish
# Or push tag to trigger GitHub Actions:
git push --follow-tags
```

## Project Structure

```
ysx-react/
├── Makefile                      # Build automation
├── lerna.json                    # Monorepo config
├── package.json                  # Root package
├── packages/
│   ├── ysx-core/                # Core transpiler
│   ├── ysx-loader/              # Webpack loader
│   ├── ysx-cli/                 # CLI tool
│   └── ysx-types/               # TypeScript defs
└── examples/
    └── webpack-app/             # Counter demo
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in examples/webpack-app/webpack.config.js
devServer: {
  port: 8080  // Change to available port
}
```

### Tests Failing
```bash
# Reinstall dependencies
make clean
make install
```

### Build Errors
```bash
# Check all dependencies installed
npm install
cd examples/webpack-app && npm install
```

## Next Steps

1. ✅ All packages working
2. ✅ Tests passing
3. ✅ Example building
4. ⏭️ **Ready to publish to NPM** (when you're ready)
5. ⏭️ Add more examples
6. ⏭️ Create Vite plugin
7. ⏭️ Build VSCode extension

## Support

- Read the full docs: `README.md`
- Check implementation details: `IMPLEMENTATION_SUMMARY.md`
- Review tests: `packages/ysx-core/__tests__/`
- See examples: `examples/webpack-app/`
