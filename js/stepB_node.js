// miniMAL
// Copyright (C) 2017 Joel Martin
// Licensed under MPL 2.0

module.exports = function(E) {

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
          : E.throw(ast + " not found")  // undefined symbol
      } else {
        return (typeof ast == "object")
          ? ast
            ? EVAL(ast, env, {})         // eval object values
            : ast                        // return ast unchanged
          : ast
      }
    } else {
      // apply
      if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env)
      } else if (ast[0] == "~") {   // mark as macro
        return Object.assign(EVAL(ast[1], env), {M: 1}) // mark as macro
      } else if (ast[0] == "`") {   // quote (unevaluated)
        return ast[1]
      } else if (ast[0] == ".-") {  // get or set attribute
        el = EVAL(ast.slice(1), env, [])
        x = el[0][el[1]]
        return 2 in el ? el[0][el[1]] = el[2] : x
      } else if (ast[0] == ".") {   // call object method
        el = EVAL(ast.slice(1), env, [])
        x = el[0][el[1]]
        return x.apply(el[0], el.slice(2))
      } else if (ast[0] == "try") { // try/catch
        try {
          return EVAL(ast[1], env)
        } catch (e) {
          return EVAL(ast[2][2], new_env([ast[2][1]], env, [e]))
        }
      } else if (ast[0] == "fn") {  // define new function (lambda)
        return Object.assign(function(...a) {
          return EVAL(ast[2], new_env(ast[1], env, a))
        }, {A: [ast[2], env, ast[1]]})
  
      // TCO cases
      } else if (ast[0] == "let") { // new environment with bindings
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
        if (f.M) {
          ast = f(...ast.slice(1))
        } else {
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
}

E = Object.assign(Object.create(E), {
  "js":    eval,
  "eval":  (a,b) => EVAL(a, E),
  // TODO: figure out why global doesn't have this when non-interactive
  //"require":     require,

  // These could all also be interop
  "=":     (a,b) => a===b,
  "<":     (a,b) => a<b,
  "+":     (a,b) => a+b,
  "-":     (a,b) => a-b,
  "*":     (a,b) => a*b,
  "/":     (a,b) => a/b,
  "isa":   (a,b) => a instanceof b,
  "type":  (a,b) => typeof a,
  "new":   (...a) => new (a[0].bind(...a)),
  "del":   (a,b) => delete a[b],
  //"list":  (...a) => a,
  //"map":   (...a) => a[1].map(x => a[0](x)),
  "throw": (a,b) => { throw(a) },

  "read":  (a,b) => JSON.parse(a),
  "slurp": (a,b) => require("fs").readFileSync(a,"utf8"),
  "load":  (a,b) => EVAL(JSON.parse(require("fs").readFileSync(a,"utf8")),E),

  "rep":   (a,b) => JSON.stringify(EVAL(JSON.parse(a),E))
})

// Lib specific
return E
}
