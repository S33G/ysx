const t = require('@babel/types');
const generate = require('@babel/generator').default;

class YSXTranspiler {
  constructor(options = {}) {
    this.typescript = options.typescript || false;
  }

  transpile(ysxAST) {
    const { name, props, state, hooks, render, imports } = ysxAST;
    
    const isFunctional = hooks && hooks.length > 0;
    
    if (isFunctional) {
      return this.generateFunctionalComponent(name, props, hooks, render, imports);
    } else {
      return this.generateSimpleFunctionalComponent(name, props, render, imports);
    }
  }

  generateSimpleFunctionalComponent(name, props, render, imports) {
    const componentName = name || 'Component';
    
    const hookStatements = [];
    const renderTree = this.buildElementTree(render);
    
    const importStatements = imports && imports.length > 0
      ? this.buildImportStatements(imports)
      : [t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier('React'))],
          t.stringLiteral('react')
        )];
    
    const componentFunction = t.functionDeclaration(
      t.identifier(componentName),
      [t.identifier('props')],
      t.blockStatement([
        ...hookStatements,
        t.returnStatement(renderTree)
      ])
    );

    const exportStatement = t.exportDefaultDeclaration(t.identifier(componentName));
    
    const program = t.program([...importStatements, componentFunction, exportStatement]);
    
    const output = generate(program, {}, '');
    return output.code;
  }

  generateFunctionalComponent(name, props, hooks, render, imports) {
    const componentName = name || 'Component';
    
    const hookStatements = hooks.map(hook => this.buildHook(hook));
    const renderTree = this.buildElementTree(render);
    
    const importStatements = imports && imports.length > 0
      ? this.buildImportStatements(imports)
      : this.generateDefaultReactImportsWithHooks(hooks);
    
    const componentFunction = t.functionDeclaration(
      t.identifier(componentName),
      [t.identifier('props')],
      t.blockStatement([
        ...hookStatements,
        t.returnStatement(renderTree)
      ])
    );

    const exportStatement = t.exportDefaultDeclaration(t.identifier(componentName));
    
    const program = t.program([...importStatements, componentFunction, exportStatement]);
    
    const output = generate(program, {}, '');
    return output.code;
  }

  generateDefaultReactImportsWithHooks(hooks) {
    const usedHooks = this.extractUsedHooks(hooks);
    
    return [t.importDeclaration(
      [
        t.importDefaultSpecifier(t.identifier('React')),
        ...usedHooks.map(hookName => 
          t.importSpecifier(t.identifier(hookName), t.identifier(hookName))
        )
      ],
      t.stringLiteral('react')
    )];
  }

  buildImportStatements(imports) {
    return imports.map(importSpec => {
      const specifiers = [];
      
      if (importSpec.default) {
        specifiers.push(t.importDefaultSpecifier(t.identifier(importSpec.default)));
      }
      
      if (importSpec.named && Array.isArray(importSpec.named)) {
        importSpec.named.forEach(name => {
          specifiers.push(t.importSpecifier(t.identifier(name), t.identifier(name)));
        });
      }
      
      return t.importDeclaration(specifiers, t.stringLiteral(importSpec.from));
    });
  }

  extractUsedHooks(hooks) {
    const hookNames = new Set();
    hooks.forEach(hook => {
      if (typeof hook === 'object') {
        const hookName = Object.keys(hook)[0];
        hookNames.add(hookName);
      }
    });
    return Array.from(hookNames);
  }

  buildHook(hook) {
    if (typeof hook === 'object') {
      const hookName = Object.keys(hook)[0];
      const hookConfig = hook[hookName];
      
      if (hookName === 'useState') {
        const varName = hookConfig.variable;
        const initialValue = this.parseValue(hookConfig.initialValue);
        
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.arrayPattern([
              t.identifier(varName),
              t.identifier(`set${this.capitalize(varName)}`)
            ]),
            t.callExpression(
              t.identifier('useState'),
              [initialValue]
            )
          )
        ]);
      }
      
      if (hookName === 'useEffect') {
        const effectCode = hookConfig.effect?.code || '';
        const dependencies = hookConfig.dependencies || [];
        
        const effectFn = t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.identifier('console'), t.identifier('log')),
                [t.stringLiteral('Effect running')]
              )
            )
          ])
        );
        
        const depsArray = t.arrayExpression(
          dependencies.map(dep => t.identifier(dep))
        );
        
        return t.expressionStatement(
          t.callExpression(
            t.identifier('useEffect'),
            [effectFn, depsArray]
          )
        );
      }
    }
    
    return t.emptyStatement();
  }

  buildElementTree(node) {
    if (node === null || node === undefined) {
      return t.nullLiteral();
    }
    
    if (typeof node === 'string') {
      return this.parseInterpolation(node);
    }
    
    if (typeof node === 'number' || typeof node === 'boolean') {
      return t.numericLiteral(node);
    }
    
    if (Array.isArray(node)) {
      return t.arrayExpression(node.map(child => this.buildElementTree(child)));
    }
    
    const entries = Object.entries(node);
    if (entries.length === 0) {
      return t.nullLiteral();
    }
    
    const [[tag, config]] = entries;
    
    if (!config || typeof config === 'string') {
      const tagName = /^[A-Z]/.test(tag) ? t.identifier(tag) : t.stringLiteral(tag);
      const content = typeof config === 'string' ? this.parseInterpolation(config) : t.nullLiteral();
      
      return t.callExpression(
        t.memberExpression(t.identifier('React'), t.identifier('createElement')),
        [tagName, t.nullLiteral(), content]
      );
    }
    
    const { children, ...attrs } = config;
    
    const tagName = /^[A-Z]/.test(tag) ? t.identifier(tag) : t.stringLiteral(tag);
    const props = this.buildProps(attrs);
    
    let childNodes = [];
    if (children !== undefined) {
      if (Array.isArray(children)) {
        childNodes = children.map(child => this.buildElementTree(child));
      } else {
        childNodes = [this.buildElementTree(children)];
      }
    }
    
    return t.callExpression(
      t.memberExpression(t.identifier('React'), t.identifier('createElement')),
      [tagName, props, ...childNodes]
    );
  }

  buildProps(attrs) {
    if (!attrs || Object.keys(attrs).length === 0) {
      return t.nullLiteral();
    }
    
    const properties = Object.entries(attrs).map(([key, value]) => {
      let val;
      
      if (value && value.type === 'JSExpression') {
        try {
          val = this.parseJSExpression(value.code.trim());
        } catch (e) {
          val = t.stringLiteral(value.code);
        }
      } else {
        val = this.parseValue(value);
      }
      
      return t.objectProperty(t.identifier(key), val);
    });
    
    return t.objectExpression(properties);
  }

  parseValue(value) {
    if (value === null || value === undefined) {
      return t.nullLiteral();
    }
    
    if (typeof value === 'string') {
      return this.parseInterpolation(value);
    }
    
    if (typeof value === 'number') {
      return t.numericLiteral(value);
    }
    
    if (typeof value === 'boolean') {
      return t.booleanLiteral(value);
    }
    
    if (Array.isArray(value)) {
      return t.arrayExpression(value.map(v => this.parseValue(v)));
    }
    
    if (typeof value === 'object' && value.type === 'JSExpression') {
      return this.parseJSExpression(value.code);
    }
    
    if (typeof value === 'object') {
      const properties = Object.entries(value).map(([k, v]) => {
        return t.objectProperty(t.identifier(k), this.parseValue(v));
      });
      return t.objectExpression(properties);
    }
    
    return t.stringLiteral(String(value));
  }

  parseInterpolation(str) {
    if (!str.includes('{')) {
      return t.stringLiteral(str);
    }
    
    const regex = /\{([^}]+)\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(t.templateElement({ raw: str.slice(lastIndex, match.index), cooked: str.slice(lastIndex, match.index) }, false));
      }
      
      parts.push(this.parseJSExpression(match[1]));
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < str.length) {
      parts.push(t.templateElement({ raw: str.slice(lastIndex), cooked: str.slice(lastIndex) }, true));
    } else {
      if (parts.length > 0 && parts[parts.length - 1].type === 'TemplateElement') {
        parts[parts.length - 1].tail = true;
      } else {
        parts.push(t.templateElement({ raw: '', cooked: '' }, true));
      }
    }
    
    const quasis = parts.filter(p => p.type === 'TemplateElement');
    const expressions = parts.filter(p => p.type !== 'TemplateElement');
    
    if (expressions.length === 0) {
      return t.stringLiteral(str);
    }
    
    return t.templateLiteral(quasis, expressions);
  }

  parseJSExpression(code) {
    const trimmed = code.trim();
    
    if (trimmed.startsWith('()') || (trimmed.startsWith('(') && trimmed.includes('=>'))) {
      try {
        const arrowMatch = trimmed.match(/^\(([^)]*)\)\s*=>\s*(.+)$/s);
        if (arrowMatch) {
          const paramsStr = arrowMatch[1].trim();
          const params = paramsStr ? paramsStr.split(',').map(p => t.identifier(p.trim())).filter(p => p.name) : [];
          const bodyCode = arrowMatch[2].trim();
          
          let body;
          if (bodyCode.startsWith('{')) {
            body = t.blockStatement([]);
          } else {
            const bodyExpr = this.parseComplexExpression(bodyCode);
            body = bodyExpr;
          }
          
          return t.arrowFunctionExpression(params, body);
        }
      } catch (e) {
        console.error('Failed to parse arrow function:', e);
      }
    }
    
    return this.parseComplexExpression(trimmed);
  }

  parseComplexExpression(trimmed) {
    if (trimmed.match(/^props\./)) {
      return t.memberExpression(
        t.identifier('props'),
        t.identifier(trimmed.slice(6))
      );
    }
    
    if (trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\(/)) {
      const funcName = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\(/)[1];
      const argsMatch = trimmed.match(/\((.+)\)/s);
      
      if (argsMatch) {
        const argsStr = argsMatch[1];
        const args = argsStr.split(',').map(arg => this.parseComplexExpression(arg.trim()));
        return t.callExpression(t.identifier(funcName), args);
      }
    }
    
    if (trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*[\+\-\*\/]\s*/)) {
      const match = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([\+\-\*\/])\s*(.+)$/);
      if (match) {
        const left = t.identifier(match[1]);
        const operator = match[2];
        const right = this.parseComplexExpression(match[3].trim());
        return t.binaryExpression(operator, left, right);
      }
    }
    
    if (trimmed.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
      return t.identifier(trimmed);
    }
    
    if (trimmed.match(/^['"`]/)) {
      return t.stringLiteral(trimmed.slice(1, -1));
    }
    
    if (trimmed.match(/^\d+$/)) {
      return t.numericLiteral(parseInt(trimmed));
    }
    
    return t.identifier(trimmed);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = YSXTranspiler;
