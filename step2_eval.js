function eval_ast(ast,env) {
    return Array.isArray(ast) ? ast.map(function(e) { return EVAL(e, env); })
        : typeof ast === 'undefined' ? null
        : symQ(ast[0]) ? env[ast]
        : ast;
}

function EVAL(ast, env) {
    //console.log("EVAL:", ast);
    if (!Array.isArray(ast)) return eval_ast(ast, env);

    // apply
    var el = eval_ast(ast, env);
    return el[0].apply(el[0], el.slice(1))
}

env = {"+": function(a,b) { return a+b; },
       "-": function(a,b) { return a-b; },
       "*": function(a,b) { return a*b; },
       "/": function(a,b) { return a/b; }};

//
// Node specific
//
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l, c, f, cb) {
        console.log(JSON.stringify(EVAL(JSON.parse(l.slice(1,l.length-2)),env)));
        cb();
    }
});
