const YSXParser = require('../src/parser');

describe('YSXParser', () => {
  let parser;

  beforeEach(() => {
    parser = new YSXParser();
  });

  test('should parse valid YSX document', () => {
    const yaml = `
version: 1.0
name: TestComponent
render:
  div:
    children: Hello World
`;
    
    const ast = parser.parse(yaml);
    expect(ast).toHaveProperty('version', 1);
    expect(ast).toHaveProperty('name', 'TestComponent');
    expect(ast).toHaveProperty('render');
  });

  test('should parse YSX with hooks', () => {
    const yaml = `
name: Counter
hooks:
  - useState:
      variable: count
      initialValue: 0
render:
  div:
    children: Count
`;
    
    const ast = parser.parse(yaml);
    expect(ast.hooks).toHaveLength(1);
    expect(ast.hooks[0]).toHaveProperty('useState');
    expect(ast.hooks[0].useState.variable).toBe('count');
  });

  test('should parse !!js tagged expressions', () => {
    const yaml = `
name: ButtonComponent
render:
  button:
    onClick: !!js |
      () => console.log('clicked')
    children: Click me
`;
    
    const ast = parser.parse(yaml);
    const buttonConfig = ast.render.button;
    expect(buttonConfig.onClick).toHaveProperty('type', 'JSExpression');
    expect(buttonConfig.onClick.code).toContain('console.log');
  });

  test('should throw on missing render key', () => {
    const yaml = `
name: InvalidComponent
props:
  title: Hello
`;
    
    expect(() => parser.parse(yaml)).toThrow('Missing required "render" key');
  });

  test('should throw on invalid YAML', () => {
    const yaml = `
name: BadComponent
render: [
  invalid syntax here
`;
    
    expect(() => parser.parse(yaml)).toThrow('YSX Parse Error');
  });
});
