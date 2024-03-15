/// miniMAL
/// Copyright (C) 2024 Joel Martin
/// Licensed under MPL 2.0

module.exports = function(E) {

function new_env(env, binds, exprs) {
  // Return new Env with symbols in binds bound to
  // corresponding values in exprs
  env = Object.create(env)
  binds.some((b,i) => b == "&" ? env[binds[i+1]] = exprs.slice(i)
                               : (env[b] = exprs[i], 0))
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
          : E.throw(ast + " not found")         // undefined symbol
      } else {
        return (typeof ast == "object")
          ? ast
            ? Object.keys(ast).reduce(
              (a,k) => (a[k] = EVAL(env, ast[k]), a), {}) // eval object values
            : ast                               // return ast unchanged
          : ast
      }
    } else {
      // apply
      if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(env, ast[2])
      } else if (ast[0] == "~") {   // mark as macro
        return Object.assign(EVAL(env, ast[1]), {M: 1}) // mark as macro
      } else if (ast[0] == "`") {   // quote (unevaluated)
        return ast[1]
      } else if (ast[0] == ".-") {  // get or set attribute
        el = ast.slice(1).map(v => EVAL(env, v))
        x = el[0][el[1]]
        return 2 in el ? el[0][el[1]] = el[2] : x
      } else if (ast[0] == ".") {   // call object method
        el = ast.slice(1).map(v => EVAL(env, v))
        x = el[0][el[1]]
        return x.apply(el[0], el.slice(2))
      } else if (ast[0] == "try") { // try/catch
        try {
          return EVAL(env, ast[1])
        } catch (e) {
          return EVAL(new_env(env, [ast.at(-1)[1]], [e]), ast.at(-1)[2])
        }
      } else if (ast[0] == "fn") {  // define new function (lambda)
        return Object.assign(function(...a) {
          return EVAL(new_env(env, ast[1], a), ast.at(-1))
        }, [ast[2], env, ast[1]])
      // TCO cases
      } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env)
        ast[1].map((e,i) => i%2 ? env[ast[1][i-1]] = EVAL(env, ast[1][i]) : 0)
        ast = ast.at(-1)
      } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        ast.slice(1,-1).map(v => EVAL(env, v))
        ast = ast.at(-1)
      } else if (ast[0] == "if") {  // branching conditional
        ast = EVAL(env, ast[1]) ? ast[2] : ast.at(-1)
      } else {                      // invoke list form
        f = EVAL(env, ast[0])
        if (f.M) {
          ast = f(...ast.slice(1))
        } else {
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
}

E = Object.assign(Object.create(E), {
  "js":    eval,
  "eval":  (...a) => EVAL(E, a[0]),
  // TODO: figure out why global doesn't have this when non-interactive
  //"require":     require,

  // These could all also be interop
  "=":     (...a) => a[0]===a[1],
  "<":     (...a) => a[0]<a[1],
  "+":     (...a) => a[0]+a[1],
  "-":     (...a) => a[0]-a[1],
  "*":     (...a) => a[0]*a[1],
  "/":     (...a) => a[0]/a[1],
  ///"list":  (...a) => a,
  ///"map":   (...a) => a[1].map(x => a[0](x)),
  "throw": (...a) => { throw(a[0]) },
  /// isa can use isPrototypeOf
  ///"isa":   (...a) => a[0] instanceof a[1],
  /// classOf is similar but more specific
  ///"type":  (...a) => typeof a[0],
  /// new can use Reflect.construct
  ///"new":   (...a) => new (a[0].bind(...a)),
  /// delete can use Reflect.deleteProperty
  ///"del":   (...a) => delete a[0][a[1]],
  ///"load":  (...a) => EVAL(E, JSON.parse(require("fs").readFileSync(a[0],"utf8"))),

  "read":  (...a) => JSON.parse(a[0]),
  "slurp": (...a) => require("fs").readFileSync(a[0],"utf8"),

  "rep":   (...a) => JSON.stringify(EVAL(E, JSON.parse(a[0])))
})

// Lib specific
return E
}
