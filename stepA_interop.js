// Env implementation
function env_bind(env, binds, exprs, D) {
    // Returns a new Env with symbols in binds bound to
    // corresponding values in exprs
    for (var i=0; i<binds.length; i++) {
        if (binds[i] === "&") {
            // variable length arguments
            env[binds[i+1]] = Array.prototype.slice.call(exprs, i);
            break;
        } else {
            env[binds[i]] = exprs[i];
        }
    }
    return env;
}
function env_get(env,key,C,D) {
    if (env[key] === undefined) throw key + " not found"
    return env[key];
}

function eval_ast(ast,env) {
    return Array.isArray(ast)
        ? ast.map(function(e) { return EVAL(e, env); })
        : (typeof ast === "string") && ast[0] !== "'"
            ? env_get(env, ast)
            : ast;
}

function EVAL(ast, env) {
  while (true) {
    //console.log("EVAL:", ast);
    if (!Array.isArray(ast)) return eval_ast(ast, env);

    // apply
    if (ast[0] === "def") {
        return env[ast[1]] = EVAL(ast[2], env);
    } else if (ast[0] === "let") {
        env = Object.create(env);
        for (var i in ast[1]) {
            if (i%2) {
                env[ast[1][i-1]] = EVAL(ast[1][i], env);
            }
        }
        ast = ast[2]; // TCO
    } else if (ast[0] === "qw") {
        return ast[1];
    } else if (ast[0] === ".-") {
        var o = EVAL(ast[1], env);
        return o[ast[2]];
    } else if (ast[0] === ".") {
        var o = EVAL(ast[1], env);
        return o[ast[2]].apply(o, eval_ast(ast.slice(3), env));
    } else if (ast[0] === "do") {
        eval_ast(ast.slice(1,ast.length-1), env);
        ast = ast[ast.length-1]; // TCO
    } else if (ast[0] === "if") {
        ast = EVAL(ast[1], env) ? ast[2] : ast[3]; // TCO
    } else if (ast[0] === "fn") {
        var f = function() {
            return EVAL(ast[2], env_bind(Object.create(env), ast[1], arguments));
        }
        f.data = [ast[2], env, ast[1]];
        return f;
    } else {
        var el = eval_ast(ast, env), f = el[0];
        if (f.data) {
            ast = f.data[0];
            env = env_bind(Object.create(f.data[1]), f.data[2], el.slice(1))
            // TCO
        } else {
            return f.apply(f, el.slice(1))
        }
    }
  }
}

env = Object.create(window);
env["="]     = function(a,b,C,D) { return a===b; }
env["<"]     = function(a,b,C,D) { return a<b; }
env["+"]     = function(a,b,C,D) { return a+b; }
env["-"]     = function(a,b,C,D) { return a-b; }
env["*"]     = function(a,b,C,D) { return a*b; }
env["/"]     = function(a,b,C,D) { return a/b; }
env["get"]   = function(a,b,C,D) { return a[b]; } // and nth, first
env["eval"]  = function(a,B,C,D) { return EVAL(a, env); }
env["throw"] = function(a,b,C,D) { throw(a); }

//
// Node specific
//
function rep(a,A,B,C) { return JSON.stringify(EVAL(JSON.parse(a),env)); }
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l,c,f,cb) { console.log(rep(l.slice(1,l.length-2))); cb() }
});

