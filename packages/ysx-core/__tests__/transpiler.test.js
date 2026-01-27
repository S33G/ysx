const YSXTranspiler = require('../src/transpiler');

describe('YSXTranspiler', () => {
  let transpiler;

  beforeEach(() => {
    transpiler = new YSXTranspiler();
  });

  test('should transpile simple component', () => {
    const ast = {
      name: 'SimpleComponent',
      render: {
        div: {
          children: 'Hello World'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('function SimpleComponent');
    expect(code).toContain('React.createElement');
    expect(code).toContain('Hello World');
    expect(code).toContain('export default SimpleComponent');
  });

  test('should transpile component with hooks', () => {
    const ast = {
      name: 'Counter',
      hooks: [{
        useState: {
          variable: 'count',
          initialValue: 0
        }
      }],
      render: {
        div: {
          children: 'Count'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('useState(0)');
    expect(code).toContain('const [count, setCount]');
  });

  test('should transpile nested elements', () => {
    const ast = {
      name: 'NestedComponent',
      render: {
        div: {
          children: [
            { h1: 'Title' },
            { p: 'Paragraph' }
          ]
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('React.createElement("h1"');
    expect(code).toContain('React.createElement("p"');
    expect(code).toContain('Title');
    expect(code).toContain('Paragraph');
  });

  test('should transpile arrow functions from JSExpression', () => {
    const ast = {
      name: 'ButtonComponent',
      render: {
        button: {
          onClick: {
            type: 'JSExpression',
            code: '() => console.log("clicked")'
          },
          children: 'Click'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('onClick: () =>');
    expect(code).toContain('console.log');
  });

  test('should transpile style objects', () => {
    const ast = {
      name: 'StyledComponent',
      render: {
        div: {
          style: {
            color: 'red',
            fontSize: '16px'
          },
          children: 'Styled'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('color: "red"');
    expect(code).toContain('fontSize: "16px"');
  });

  test('should generate React import for simple component', () => {
    const ast = {
      name: 'SimpleComponent',
      render: {
        div: {
          children: 'Hello'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import React from "react"');
  });

  test('should generate React import with hooks for functional component', () => {
    const ast = {
      name: 'HookComponent',
      hooks: [{
        useState: {
          variable: 'count',
          initialValue: 0
        }
      }],
      render: {
        div: {
          children: 'Count'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import React, { useState } from "react"');
  });

  test('should generate React import with multiple hooks', () => {
    const ast = {
      name: 'MultiHookComponent',
      hooks: [
        {
          useState: {
            variable: 'count',
            initialValue: 0
          }
        },
        {
          useEffect: {
            effect: {
              type: 'JSExpression',
              code: '() => { console.log("mounted"); }'
            },
            dependencies: []
          }
        }
      ],
      render: {
        div: {
          children: 'Multi'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import React, { useState, useEffect } from "react"');
  });

  test('should use explicit imports when provided', () => {
    const ast = {
      name: 'ExplicitImportComponent',
      imports: [
        {
          from: 'react',
          default: 'React',
          named: ['useState']
        }
      ],
      hooks: [{
        useState: {
          variable: 'count',
          initialValue: 0
        }
      }],
      render: {
        div: {
          children: 'Count'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import React, { useState } from "react"');
  });

  test('should support multiple import statements', () => {
    const ast = {
      name: 'MultiImportComponent',
      imports: [
        {
          from: 'react',
          default: 'React',
          named: ['useState', 'useEffect']
        },
        {
          from: './utils',
          default: 'helper'
        },
        {
          from: 'lodash',
          named: ['map', 'filter']
        }
      ],
      render: {
        div: {
          children: 'Test'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import React, { useState, useEffect } from "react"');
    expect(code).toContain('import helper from "./utils"');
    expect(code).toContain('import { map, filter } from "lodash"');
  });

  test('should support default import only', () => {
    const ast = {
      name: 'DefaultOnlyComponent',
      imports: [
        {
          from: 'react',
          default: 'React'
        }
      ],
      render: {
        div: {
          children: 'Simple'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import React from "react"');
  });

  test('should support named imports only', () => {
    const ast = {
      name: 'NamedOnlyComponent',
      imports: [
        {
          from: 'lodash',
          named: ['map', 'filter']
        }
      ],
      render: {
        div: {
          children: 'Simple'
        }
      }
    };
    
    const code = transpiler.transpile(ast);
    expect(code).toContain('import { map, filter } from "lodash"');
  });
});
