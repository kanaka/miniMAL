// miniMAL
// Copyright (C) 2017 Joel Martin
// Licensed under MPL 2.0

function new_env(ast, env, exprs) {
  // Return new Env with symbols in ast bound to
  // corresponding values in exprs
  env = Object.create(env)
  ast.some((a,i) => a == "&" ? env[ast[i+1]] = exprs.slice(i)
                             : (env[a] = exprs[i], 0))
  return env
}

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
        return ast
      }
    } else {
      // apply
      if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env)
      } else if (ast[0] == "fn") {  // define new function (lambda)
        return function(...a) {
          return EVAL(ast[2], new_env(ast[1], env, a))
        }
      } else if (ast[0] == "let") {        // new environment with bindings
        env = Object.create(env)
        ast[1].map((e,i) => i%2 ? env[ast[1][i-1]] = EVAL(ast[1][i], env) : 0)
        return EVAL(ast[2], env)
      } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        return EVAL(ast.slice(1), env, [])[ast.length-2]
      } else if (ast[0] == "if") {  // branching conditional
        return EVAL(ast[1], env) ? EVAL(ast[2], env) : EVAL(ast[3], env)
      } else {                      // invoke list form
        f = EVAL(ast[0], env)
        el = EVAL(ast.slice(1), env, [])
        return f(...el)
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
    eval:     (...a) => a[3](0,EVAL(JSON.parse(a[0]),E)),
    writer:   JSON.stringify})
