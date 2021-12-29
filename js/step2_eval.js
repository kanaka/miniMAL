// miniMAL
// Copyright (C) 2017 Joel Martin
// Licensed under MPL 2.0

!function() {

function EVAL(ast, env, seq, f, el) {
    //console.log("EVAL:", ast)
    if (seq) {
      // Evaluate the list or object (i.e. eval_ast)
      return Object.keys(ast).reduce((a,k) => (a[k] = EVAL(ast[k], env), a), seq)
    } else if (!Array.isArray(ast)) {
      // eval
      if (typeof ast == "string") {
        return ast in env                // symbol in env?
          ? env[ast]                     // lookup symbol
          : null[ast]                    // undefined symbol
      } else {
        return (typeof ast == "object")
          ? ast
            ? EVAL(ast, env, {})         // eval object values
            : ast                        // return ast unchanged
          : ast
      }
    } else {
      // apply
      f = EVAL(ast[0], env)
      el = EVAL(ast.slice(1), env, [])
      return f(...el)
    }
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
