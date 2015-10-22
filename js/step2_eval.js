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
    var el = eval_ast(ast, env);
    var f = el[0];
    return f.apply(f, el.slice(1))
}

E = {};
E["+"]     = function(a,b) { return a+b; }
E["-"]     = function(a,b) { return a-b; }
E["*"]     = function(a,b) { return a*b; }
E["/"]     = function(a,b) { return a/b; }

// Node specific
function rep(a) { return JSON.stringify(EVAL(JSON.parse(a),E)); }

var rl = require('readline').createInterface(
        process.stdin, process.stdout, false, false);
function x(l) {
    l && console.log(rep(l));
    rl.question("user> ", x);
}
x()
