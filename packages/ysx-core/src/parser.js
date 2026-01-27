const yaml = require('js-yaml');

class YSXParser {
  constructor() {
    // Define custom YAML types for YSX
    this.schema = yaml.DEFAULT_SCHEMA.extend([
      new yaml.Type('tag:yaml.org,2002:js', {
        kind: 'scalar',
        construct: (data) => ({ type: 'JSExpression', code: data })
      }),
      new yaml.Type('tag:yaml.org,2002:ts', {
        kind: 'scalar',
        construct: (data) => ({ type: 'TSAnnotation', code: data })
      })
    ]);
  }

  parse(yamlString) {
    try {
      const ast = yaml.load(yamlString, { schema: this.schema });
      this.validateSchema(ast);
      return ast;
    } catch (error) {
      throw new Error(`YSX Parse Error: ${error.message}`);
    }
  }

  validateSchema(ast) {
    if (!ast || typeof ast !== 'object') {
      throw new Error('Invalid YSX: Root must be an object');
    }

    if (!ast.render) {
      throw new Error('Invalid YSX: Missing required "render" key');
    }

    // Basic validation - can be expanded
    return true;
  }
}

module.exports = YSXParser;
