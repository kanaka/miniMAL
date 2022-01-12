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
  while (true) {
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
      } else if (ast[0] == "`") {   // quote (unevaluated)
        return ast[1]
      } else if (ast[0] == "fn") {  // define new function (lambda)
        return Object.assign(function(...a) {
          return EVAL(ast[2], new_env(ast[1], env, a))
        }, {A: [ast[2], env, ast[1]]})
  
      // TCO cases
      } else if (ast[0] == "let") {        // new environment with bindings
        env = Object.create(env)
        ast[1].map((e,i) => i%2 ? env[ast[1][i-1]] = EVAL(ast[1][i], env) : 0)
        ast = ast[2]
      } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        EVAL(ast.slice(1,-1), env, [])
        ast = ast[ast.length-1]
      } else if (ast[0] == "if") {  // branching conditional
        ast = EVAL(ast[1], env) ? ast[2] : ast[3]
      } else {                      // invoke list form
        f = EVAL(ast[0], env)
        el = EVAL(ast.slice(1), env, [])
        if (f.A) {
          ast = f.A[0]
          env = new_env(f.A[2], f.A[1], el)
        } else {
          return f(...el)
        }
      }
    }
  }
}

E = {
  "eval":  (...a) => EVAL(a[0], E),

  // These could all also be interop
  "=":     (...a) => a[0]===a[1],
  "<":     (...a) => a[0]<a[1],
  "+":     (...a) => a[0]+a[1],
  "-":     (...a) => a[0]-a[1],
  "*":     (...a) => a[0]*a[1],
  "/":     (...a) => a[0]/a[1],
  "list":  (...a) => a,
  //"map":   (...a) => a[1].map(x => a[0](x)),

  "read":  (...a) => JSON.parse(a[0]),
  "slurp": (...a) => require("fs").readFileSync(a[0],"utf8"),
  "load":  (...a) => EVAL(JSON.parse(require("fs").readFileSync(a[0],"utf8")),E),

  "ARGS":  process.argv.slice(3)
}

// Node specific
if (process.argv[2]) {
  E.load(process.argv[2])
} else {
  require("repl").start({
    eval:     (...a) => a[3](0,EVAL(JSON.parse(a[0]),E)),
    writer:   JSON.stringify})
}
