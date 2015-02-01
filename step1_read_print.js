function EVAL(ast, env) {
    return ast;
}


//
// Node specific
//
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l, c, f, cb) {
        console.log(JSON.stringify(EVAL(JSON.parse(l.slice(1,l.length-2)),"")));
        cb();
    }
});
