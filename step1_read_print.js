function EVAL(ast, env) {
    return ast;
}


//
// Node specific
//
function rep(a,A,B,C) { return JSON.stringify(EVAL(JSON.parse(a),E)); }
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l,c,f,cb) { console.log(rep(l.slice(1,l.length-2))); cb() }
});
