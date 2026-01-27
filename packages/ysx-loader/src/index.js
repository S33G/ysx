const { YSXParser, YSXTranspiler } = require('ysx-core');

module.exports = function(source) {
  const callback = this.async();
  const options = this.getOptions ? this.getOptions() : {};
  
  try {
    const isTypeScript = /\.tsx?$/.test(this.resourcePath);
    
    const parser = new YSXParser();
    const transpiler = new YSXTranspiler({
      typescript: isTypeScript
    });
    
    const ast = parser.parse(source);
    const jsxCode = transpiler.transpile(ast);
    
    callback(null, jsxCode);
  } catch (err) {
    callback(err);
  }
};
