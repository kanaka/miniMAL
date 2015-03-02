// miniMAL
// Copyright (C) 2014 Joel Martin
// Licensed under MPL 2.0

// 2 args: eval_ast, 3 args: env_bind
function eval_ast_or_bind(ast, env, exprs) {
    if (exprs) {
        // Return new Env with symbols in ast bound to
        // corresponding values in exprs
        env = Object.create(env);
        for (var i=0; i<ast.length; i++) {
            if (ast[i] == "&") {
                // variable length arguments
                env[ast[i+1]] = Array.prototype.slice.call(exprs, i);
                break;
            } else {
                env[ast[i]] = exprs[i];
            }
        }
        return env;
    }
    // Evaluate the form/ast
    return Array.isArray(ast)                        // list?
        ? ast.map(function(e){return EVAL(e, env);}) // list
        : (typeof ast == "string")                   // symbol?
            ? ast in env                             // symbol in env?
                ? env[ast]                           // lookup symbol
                : E.throw(ast + " not found")        // undefined symbol
                ///: null[ast]                          // undefined symbol
            : ast;                                   // ast unchanged
}

function EVAL(ast, env) {
    //console.log("EVAL:", ast);
    if (!Array.isArray(ast)) return eval_ast_or_bind(ast, env);

    // apply
    if (ast[0] == "def") {        // update current environment
        return env[ast[1]] = EVAL(ast[2], env);
    } else if (ast[0] == "let") { // new environment with bindings
        env = Object.create(env);
        for (var i in ast[1]) {
            if (i%2) {
                env[ast[1][i-1]] = EVAL(ast[1][i], env);
            }
        }
        return EVAL(ast[2], env);
    } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        return eval_ast_or_bind(ast.slice(1), env)[ast.length-2];
    } else if (ast[0] == "if") {  // branching conditional
        if (EVAL(ast[1], env)) {
            return EVAL(ast[2]);
        } else {
            return EVAL(ast[3]);
        }
    } else if (ast[0] == "fn") {  // define new function (lambda)
        return function() {
            return EVAL(ast[2], eval_ast_or_bind(ast[1], env, arguments));
        }
    } else {                      // invoke list form
        var el = eval_ast_or_bind(ast, env);
        var f = el[0];
        return f.apply(f, el.slice(1))
    }
}

E = Object.create(GLOBAL);
E["="]     = function(a,b) { return a===b; }
E["<"]     = function(a,b) { return a<b; }
E["+"]     = function(a,b) { return a+b; }
E["-"]     = function(a,b) { return a-b; }
E["*"]     = function(a,b) { return a*b; }
E["/"]     = function(a,b) { return a/b; }
E["list"]  = function(a,b) { return Array.prototype.slice.call(arguments); }
E["map"]   = function(a,b) { return b.map(a); }

// Node specific
function rep(a) { return JSON.stringify(EVAL(JSON.parse(a),E)); }
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l,c,f,cb) { console.log(rep(l.slice(1,l.length-2))); cb() }
});
