// miniMAL
// Copyright (C) 2024 Joel Martin
// Licensed under MPL 2.0

function new_env(env, ast, exprs) {
  // Return new Env with symbols in ast bound to
  // corresponding values in exprs
  env = Object.create(env)
  ast.some((a,i) => a == "&" ? env[ast[i+1]] = exprs.slice(i)
                             : (env[a] = exprs[i], 0))
  return env
}

function EVAL(env, ast, f, el) {
  while (true) {
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
      if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(env, ast[2])
      } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env)
        ast[1].map((e,i) => i%2 ? env[ast[1][i-1]] = EVAL(env, ast[1][i]) : 0)
        ast = ast.at(-1)
      } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        ast.slice(1,-1).map(v => EVAL(env, v))
        ast = ast.at(-1)
      } else if (ast[0] == "if") {  // branching conditional
        ast = EVAL(env, ast[1]) ? ast[2] : ast.at(-1)
      } else if (ast[0] == "fn") {  // define new function (lambda)
        return Object.assign(function(...a) {
          return EVAL(new_env(env, ast[1], a), ast.at(-1))
        }, [ast[2], env, ast[1]])
      } else {                      // invoke list form
        f = EVAL(env, ast[0])
        el = ast.slice(1).map(v => EVAL(env, v))
        if (0 in f) {
          ast = f[0]
          env = new_env(f[1], f[2], el)
        } else {
          return f(...el)
        }
      }
    }
  }
}

E = {
  "=":     (...a) => a[0]===a[1],
  "<":     (...a) => a[0]<a[1],
  "+":     (...a) => a[0]+a[1],
  "-":     (...a) => a[0]-a[1],
  "*":     (...a) => a[0]*a[1],
  "/":     (...a) => a[0]/a[1],
  "list":  (...a) => a,
  "map":   (...a) => a[1].map(x => a[0](x)),
}

// Node specific
require("repl").start({
    eval:     (...a) => a[3](0,JSON.stringify(EVAL(E, JSON.parse(a[0])))),
    writer:   (...a) => a[0]})
