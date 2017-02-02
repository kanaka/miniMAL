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
    if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env)
    } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env)
        for (var i in ast[1]) {
            if (i%2) {
                env[ast[1][i-1]] = EVAL(ast[1][i], env)
            }
        }
        return EVAL(ast[2], env)
    } else {                      // invoke list form
        var el = eval_ast(ast, env)
        var f = el[0]
        return f.apply(f, el.slice(1))
    }
}

E = Object.create(global)
Object.assign(E, {
    "+":           (...a) => a[0]+a[1],
    "-":           (...a) => a[0]-a[1],
    "*":           (...a) => a[0]*a[1],
    "/":           (...a) => a[0]/a[1],
})

// Node specific
var rep = (...a) => JSON.stringify(EVAL(JSON.parse(a[0]),E))

var rl = require('readline').createInterface(
        process.stdin, process.stdout, false, false)
var x = (...a) => a[0] && console.log(rep(a[0])) || rl.question("user> ", x)
x()
