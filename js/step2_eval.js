// miniMAL
// Copyright (C) 2024 Joel Martin
// Licensed under MPL 2.0

function EVAL(env, ast, f, el) {
    //console.log("EVAL:", ast)
    if (!Array.isArray(ast)) {
      // eval
      if (typeof ast == "string") {
        return ast in env                       // symbol in env?
          ? env[ast]                            // lookup symbol
          : (a => {throw ast + " not found"})() // undefined symbol
      } else {
        return ast
      }
    } else {
      // apply
      f = EVAL(env, ast[0])
      el = ast.slice(1).map(v => EVAL(env, v))
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
    eval:     (...a) => a[3](0,JSON.stringify(EVAL(E, JSON.parse(a[0])))),
    writer:   (...a) => a[0]})
