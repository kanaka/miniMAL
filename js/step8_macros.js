// miniMAL
// Copyright (C) 2017 Joel Martin
// Licensed under MPL 2.0

!function() {

// 2 args: eval_ast, 3 args: env_bind
let eval_ast_or_bind = function(ast, env, exprs) {
    if (exprs) {
        // Return new Env with symbols in ast bound to
        // corresponding values in exprs
        env = Object.create(env)
        ast.some((a,i) => a == "&" ? env[ast[i+1]] = exprs.slice(i)
                                   : (env[a] = exprs[i], 0))
        return env
    }
    // Evaluate the form/ast
    return ast instanceof Array                      // list?
        ? ast.map((...a) => EVAL(a[0], env))         // list
        : (typeof ast == "string")                   // symbol?
            ? ast in env                             // symbol in env?
                ? env[ast]                           // lookup symbol
                : null[ast]                          // undefined symbol
            : ast                                    // ast unchanged
}

function macroexpand(ast, env) {
    while (ast instanceof Array
            && ast[0] in env
            && env[ast[0]].M) {
        ast = env[ast[0]](...ast.slice(1))
    }
    return ast
}

function EVAL(ast, env) {
  while (true) {
    //console.log("EVAL:", ast)
    if (!(ast instanceof Array)) return eval_ast_or_bind(ast, env)

    // apply
    ast = macroexpand(ast, env)
    if (!(ast instanceof Array)) return ast

    if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env)
    } else if (ast[0] == "~") {  // mark as macro
        let f = EVAL(ast[1], env)  // eval regular function
        f.M = 1 // mark as macro
        return f
    } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env)
        for (let i in ast[1]) {
            if (i%2) {
                env[ast[1][i-1]] = EVAL(ast[1][i], env)
            }
        }
        ast = ast[2] // TCO
    } else if (ast[0] == "`") {   // quote (unevaluated)
        return ast[1]
    } else if (ast[0] == ".-") {  // get or set attribute
        let el = eval_ast_or_bind(ast.slice(1), env),
            x = el[0][el[1]]
        return 2 in el ? el[0][el[1]] = el[2] : x
    } else if (ast[0] == ".") {   // call object method
        let el = eval_ast_or_bind(ast.slice(1), env),
            x = el[0][el[1]]
        return x.apply(el[0], el.slice(2))
    } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        let el = eval_ast_or_bind(ast.slice(1,ast.length-1), env)
        ast = ast[ast.length-1] // TCO
    } else if (ast[0] == "if") {  // branching conditional
        ast = EVAL(ast[1], env) ? ast[2] : ast[3] // TCO
    } else if (ast[0] == "fn") {  // define new function (lambda)
        let f = function(...a) {
            return EVAL(ast[2], eval_ast_or_bind(ast[1], env, a))
        }
        f.A = [ast[2], env, ast[1]] // f.A compresses more than f.data
        return f
    } else {                      // invoke list form
        let el = eval_ast_or_bind(ast, env),
            f = el[0]
        if (f.A) {
            ast = f.A[0]
            env = eval_ast_or_bind(f.A[2], f.A[1], el.slice(1)) // TCO
        } else {
            return f(...el.slice(1))
        }
    }
  }
}

let E = Object.assign(this, {
    "js":    eval,
    "eval":  (...a) => EVAL(a[0], E),

    // These could all also be interop
    "=":     (...a) => a[0]===a[1],
    "<":     (...a) => a[0]<a[1],
    "+":     (...a) => a[0]+a[1],
    "-":     (...a) => a[0]-a[1],
    "*":     (...a) => a[0]*a[1],
    "/":     (...a) => a[0]/a[1],
    "isa":   (...a) => a[0] instanceof a[1],
    // new can use Reflect.construct
    //"new":   (...a) => new (a[0].bind(...a)),
    // delete can use Reflect.deleteProperty
    //"del":   (...a) => delete a[0][a[1]],
    //"list":  (...a) => a,
    //"map":   (...a) => a[1].map(x => a[0](x)),

    "read":  (...a) => JSON.parse(a[0]),
    "slurp": (...a) => require("fs").readFileSync(a[0],"utf8"),
    "load":  (...a) => EVAL(JSON.parse(require("fs").readFileSync(a[0],"utf8")),E),

    "ARGS":  process.argv.slice(3)
})

// Node specific
if (process.argv[2]) {
    E.load(process.argv[2])
} else {
    require("repl").start({
        eval:     (...a) => a[3](0,EVAL(JSON.parse(a[0]),E)),
        writer:   JSON.stringify,
        terminal: 0})
}

}()
