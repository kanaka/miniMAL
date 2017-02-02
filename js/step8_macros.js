// miniMAL
// Copyright (C) 2016 Joel Martin
// Licensed under MPL 2.0

// 2 args: eval_ast, 3 args: env_bind
var eval_ast_or_bind = function(ast, env, exprs) {
    if (exprs) {
        // Return new Env with symbols in ast bound to
        // corresponding values in exprs
        env = Object.create(env)
        ast.some((a,i) => a == "&" ? env[ast[i+1]] = exprs.slice(i)
                                   : (env[a] = exprs[i], false) )
        return env
    }
    // Evaluate the form/ast
    return Array.isArray(ast)                        // list?
        ? ast.map((...a) => EVAL(a[0], env))         // list
        : (typeof ast == "string")                   // symbol?
            ? ast in env                             // symbol in env?
                ? env[ast]                           // lookup symbol
                : E.throw(ast + " not found")        // undefined symbol
                ///: null[ast]                          // undefined symbol
            : ast                                    // ast unchanged
}

function macroexpand(ast, env) {
    while (Array.isArray(ast)
            && (typeof ast[0] == "string")
            && ast[0] in env
            && env[ast[0]].ast
            && env[ast[0]].ast[3]) {
        ast = env[ast[0]].apply(env[ast[0]], ast.slice(1))
    }
    return ast
}

function EVAL(ast, env) {
  while (true) {
    //console.log("EVAL:", ast)
    if (!Array.isArray(ast)) return eval_ast_or_bind(ast, env)

    // apply
    ast = macroexpand(ast, env)
    if (!Array.isArray(ast)) return ast

    if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env)
    } else if (ast[0] == "~") {  // mark as macro
        var f = EVAL(ast[1], env)  // eval regular function
        f.ast.push(1) // mark as macro
        return f
    } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env)
        for (var i in ast[1]) {
            if (i%2) {
                env[ast[1][i-1]] = EVAL(ast[1][i], env)
            }
        }
        ast = ast[2] // TCO
    } else if (ast[0] == "`") {   // quote (unevaluated)
        return ast[1]
    } else if (ast[0] == ".-") {  // get or set attribute
        var el = eval_ast_or_bind(ast.slice(1), env)
        var x = el[0][el[1]]
        return 2 in el ? el[0][el[1]] = el[2] : x
    } else if (ast[0] == ".") {   // call object method
        var el = eval_ast_or_bind(ast.slice(1), env)
        var x = el[0][el[1]]
        return x.apply(el[0], el.slice(2))
    } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        var el = eval_ast_or_bind(ast.slice(1,ast.length-1), env)
        ast = ast[ast.length-1] // TCO
    } else if (ast[0] == "if") {  // branching conditional
        ast = EVAL(ast[1], env) ? ast[2] : ast[3] // TCO
    } else if (ast[0] == "fn") {  // define new function (lambda)
        var f = (...a) => EVAL(ast[2], eval_ast_or_bind(ast[1], env, a))
        f.ast = [ast[2], env, ast[1]] // f.ast compresses more than f.data
        return f
    } else {                      // invoke list form
        var el = eval_ast_or_bind(ast, env)
        var f = el[0]
        if (f.ast) {
            ast = f.ast[0]
            env = eval_ast_or_bind(f.ast[2], f.ast[1], el.slice(1)) // TCO
        } else {
            return f.apply(f, el.slice(1))
        }
    }
  }
}

E = Object.create(global)
Object.assign(E, {
    "js":          eval,
    "eval":        (...a) => EVAL(a[0], E),

    // These could all also be interop
    "=":           (...a) => a[0]===a[1],
    "<":           (...a) => a[0]<a[1],
    "+":           (...a) => a[0]+a[1],
    "-":           (...a) => a[0]-a[1],
    "*":           (...a) => a[0]*a[1],
    "/":           (...a) => a[0]/a[1],
    //"list":        (...a) => a.slice(),
    //"map":         (...a) => a[1].map(a[0]),

    "read-string": (...a) => JSON.parse(a[0]),
    "slurp":       (...a) => require('fs').readFileSync(a[0],'utf-8'),
    "load-file":   (...a) => EVAL(JSON.parse(E["slurp"](a[0])),E),

    "*ARGV*":      process.argv.slice(3)
})

// Node specific
var rep = (...a) => JSON.stringify(EVAL(JSON.parse(a[0]),E))
if (process.argv[2]) {
    rep('["load-file", ["`", "' + process.argv[2] + '"]]')
} else {
    var rl = require('readline').createInterface(
            process.stdin, process.stdout, false, false)
    var x = (...a) => a[0] && console.log(rep(a[0])) || rl.question("user> ", x)
    x()
}
