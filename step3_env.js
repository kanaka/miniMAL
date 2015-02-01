/////////////////////////////////////////////////////////////////

// Env implementation
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
    default:
        var el = eval_ast(ast, env), f = el[0];
        return f.apply(f, el.slice(1))
    }
}

env = {
    "+": function(a,b,A,B) { return a+b; },
    "-": function(a,b,A,B) { return a-b; },
    "*": function(a,b,A,B) { return a*b; },
    "/": function(a,b,A,B) { return a/b; }
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
