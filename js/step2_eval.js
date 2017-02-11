// miniMAL
// Copyright (C) 2017 Joel Martin
// Licensed under MPL 2.0

!function() {

let eval_ast = function(ast, env) {
    // Evaluate the form/ast
    return ast instanceof Array                      // list?
        ? ast.map((...a) => EVAL(a[0], env))         // list
        : (typeof ast == "string")                   // symbol?
            ? ast in env                             // symbol in env?
                ? env[ast]                           // lookup symbol
                : null[ast]                          // undefined symbol
            : ast                                    // ast unchanged
}

function EVAL(ast, env) {
    //console.log("EVAL:", ast)
    if (!(ast instanceof Array)) return eval_ast(ast, env)

    // apply
    let el = eval_ast(ast, env),
        f = el[0]
    return f.apply(f, el.slice(1))
}

E = {
    "+":     (...a) => a[0]+a[1],
    "-":     (...a) => a[0]-a[1],
    "*":     (...a) => a[0]*a[1],
    "/":     (...a) => a[0]/a[1],
}

// Node specific
require("repl").start({
    eval:     (...a) => a[3](0,EVAL(JSON.parse(a[0]),E)),
    writer:   JSON.stringify,
    terminal: 0})

}()
