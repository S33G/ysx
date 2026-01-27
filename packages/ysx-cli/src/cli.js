#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const { YSXParser, YSXTranspiler } = require('ysx-core');

const program = new Command();

program
  .name('ysx')
  .description('CLI tool for transpiling YSX (YAML Syntax Extension) files')
  .version('1.0.0');

program
  .command('transpile')
  .description('Transpile a YSX file to JSX/TSX')
  .argument('<input>', 'Input YSX file')
  .argument('[output]', 'Output file (optional)')
  .option('--typescript', 'Generate TypeScript output')
  .action((input, output, options) => {
    try {
      const inputPath = path.resolve(input);
      const source = fs.readFileSync(inputPath, 'utf8');
      
      const parser = new YSXParser();
      const transpiler = new YSXTranspiler({
        typescript: options.typescript
      });
      
      const ast = parser.parse(source);
      const code = transpiler.transpile(ast);
      
      const outputPath = output 
        ? path.resolve(output)
        : inputPath.replace('.ysx', options.typescript ? '.tsx' : '.jsx');
      
      fs.writeFileSync(outputPath, code);
      console.log(`✓ Transpiled ${input} → ${path.basename(outputPath)}`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
