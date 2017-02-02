// miniMAL
// Copyright (C) 2016 Joel Martin
// Licensed under MPL 2.0

function eval_ast(ast, env) {
    // Evaluate the form/ast
    return Array.isArray(ast)                        // list?
        ? ast.map((...a) => EVAL(a[0], env))         // list
        : (typeof ast == "string")                   // symbol?
            ? ast in env                             // symbol in env?
                ? env[ast]                           // lookup symbol
                : null[ast]                          // undefined symbol
            : ast                                    // ast unchanged
}

function EVAL(ast, env) {
    //console.log("EVAL:", ast)
    if (!Array.isArray(ast)) return eval_ast(ast, env);

    // apply
    var el = eval_ast(ast, env)
    var f = el[0]
    return f.apply(f, el.slice(1))
}

E = {
    "+":           (...a) => a[0]+a[1],
    "-":           (...a) => a[0]-a[1],
    "*":           (...a) => a[0]*a[1],
    "/":           (...a) => a[0]/a[1],
}

// Node specific
var rep = (...a) => JSON.stringify(EVAL(JSON.parse(a[0]),E))

var rl = require('readline').createInterface(
        process.stdin, process.stdout, false, false)
var x = (...a) => a[0] && console.log(rep(a[0])) || rl.question("user> ", x)
x()
