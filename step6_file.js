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
  while (true) {
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
        ast = ast[2]; // TCO
    } else if (ast[0] == "`") {   // quote (unevaluated)
        return ast[1];
    } else if (ast[0] == "do") {  // multiple forms (for side-effects)
        var el = eval_ast_or_bind(ast.slice(1,ast.length-1), env);
        ast = ast[ast.length-1]; // TCO
    } else if (ast[0] == "if") {  // branching conditional
        ast = EVAL(ast[1], env) ? ast[2] : ast[3]; // TCO
    } else if (ast[0] == "fn") {  // define new function (lambda)
        var f = function() {
            return EVAL(ast[2], eval_ast_or_bind(ast[1], env, arguments));
        }
        f.ast = [ast[2], env, ast[1]]; // f.ast compresses more than f.data
        return f;
    } else {                      // invoke list form
        var el = eval_ast_or_bind(ast, env);
        var f = el[0];
        if (f.ast) {
            ast = f.ast[0];
            env = eval_ast_or_bind(f.ast[2], f.ast[1], el.slice(1)); // TCO
        } else {
            return f.apply(f, el.slice(1))
        }
    }
  }
}

E = Object.create(GLOBAL);
E["eval"]  = function(a)   { return EVAL(a, E); }

E["="]     = function(a,b) { return a===b; }
E["<"]     = function(a,b) { return a<b; }
E["+"]     = function(a,b) { return a+b; }
E["-"]     = function(a,b) { return a-b; }
E["*"]     = function(a,b) { return a*b; }
E["/"]     = function(a,b) { return a/b; }
E["list"]  = function(a,b) { return Array.prototype.slice.call(arguments); }
E["map"]   = function(a,b) { return b.map(a); }

E["read-string"] = function(a) { return JSON.parse(a); }
E["slurp"] = function(a)   { return require('fs').readFileSync(a,'utf-8'); }
E["load-file"] = function(a) { return EVAL(JSON.parse(E["slurp"](a)),E);  }

// Node specific
function rep(a) { return JSON.stringify(EVAL(JSON.parse(a),E)); }
if (process.argv.length > 2) {
    E['*ARGV*'] = process.argv.slice(3);
    rep('["load-file", ["`", "' + process.argv[2] + '"]]');
} else {
    require('repl').start({
        prompt: "user> ",
        ignoreUndefined: true,
        eval: function(l,c,f,cb) { console.log(rep(l.slice(1,l.length-2))); cb() }
    });
}
