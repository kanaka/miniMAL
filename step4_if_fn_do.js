/////////////////////////////////////////////////////////////////

// Env implementation
function env_bind(env, binds, exprs) {
    // Returns a new Env with symbols in binds bound to
    // corresponding values in exprs
    for (var i in binds) {
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
function env_get(env,key,A,B) {
    var val = env[key];
    if (val === undefined) throw key + " not found"
    return val;
}

/////////////////////////////////////////////////////////////////

function eval_ast(ast,env) {
    return Array.isArray(ast)
        ? ast.map(function(e) { return EVAL(e, env); })
        : ast === undefined
            ? null
            : (typeof ast === "string") && ast[0] !== '"'
                ? env_get(env, ast)
                : ast;
}

function EVAL(ast, env) {
    //console.log("EVAL:", ast);
    if (!Array.isArray(ast)) return eval_ast(ast, env);

    // apply
    var a0 = ast[0], a1 = ast[1], a2 = ast[2];
    switch (a0) {
    case "def!":
        return env[a1] = EVAL(a2, env);
    case "let*":
        var env = Object.create(env);
        for (var i in a1) {
            if (i%2) {
                env[a1[i-1]] = EVAL(a1[i], env);
            }
        }
        return EVAL(a2, env);
    case "do":
        return eval_ast(ast.slice(1), env)[ast.length-2]
    case "if":
        var cond = EVAL(a1, env)
        return (cond === false || cond === null) ?
            EVAL(ast[3], env) : EVAL(a2, env);
    case "fn*":
        return function(C,D,E,F) {
            return EVAL(a2, env_bind(Object.create(env), a1, arguments));
        }
    default:
        var el = eval_ast(ast, env), f = el[0];
        return f.apply(f, el.slice(1))
    }
}

env = {
    "=": function(a,b,A,B) { return a===b; },
    "<": function(a,b,A,B) { return a<b; },
    "<=": function(a,b,A,B) { return a<=b; },
    ">": function(a,b,A,B) { return a>b; },
    ">=": function(a,b,A,B) { return a>=b; },
    "+": function(a,b,A,B) { return a+b; },
    "-": function(a,b,A,B) { return a-b; },
    "*": function(a,b,A,B) { return a*b; },
    "/": function(a,b,A,B) { return a/b; },
    "list": function(A,B,C,D) { return Array.prototype.slice.call(arguments, 0); },
    "list?": Array.isArray,
    "empty?": function(a,A,B,C) { return a.length === 0 },
    "count": function(a,A,B,C) { return a.length }
    };

//
// Node specific
//
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l, c, f, cb) {
        console.log(JSON.stringify(EVAL(JSON.parse(l.slice(1,l.length-2)),env)));
        cb();
    }
});
