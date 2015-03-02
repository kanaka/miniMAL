// miniMAL
// Copyright (C) 2014 Joel Martin
// Licensed under MPL 2.0

function eval_ast(ast, env) {
    // Evaluate the form/ast
    return Array.isArray(ast)                        // list?
        ? ast.map(function(e){return EVAL(e, env);}) // list
        : (typeof ast == "string")                   // symbol?
            ? ast in env                             // symbol in env?
                ? env[ast]                           // lookup symbol
                : null[ast]                          // undefined symbol
            : ast;                                   // ast unchanged
}

function EVAL(ast, env) {
    //console.log("EVAL:", ast);
    if (!Array.isArray(ast)) return eval_ast(ast, env);

    // apply
    if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env);
    } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env);
        for (var i in ast[1]) {
            if (i%2) {
                env[ast[1][i-1]] = EVAL(ast[1][i], env);
            }
        }
        return EVAL(ast[2], env);
    } else {                      // invoke list form
        var el = eval_ast(ast, env);
        var f = el[0];
        return f.apply(f, el.slice(1))
    }
}

E = Object.create(GLOBAL);
E["+"]     = function(a,b) { return a+b; }
E["-"]     = function(a,b) { return a-b; }
E["*"]     = function(a,b) { return a*b; }
E["/"]     = function(a,b) { return a/b; }

// Node specific
function rep(a) { return JSON.stringify(EVAL(JSON.parse(a),E)); }
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l,c,f,cb) { console.log(rep(l.slice(1,l.length-2))); cb() }
});
