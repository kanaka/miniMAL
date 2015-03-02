// miniMAL
// Copyright (C) 2014 Joel Martin
// Licensed under MPL 2.0

function EVAL(ast, env) {
    return ast;
}


// Node specific
function rep(a) { return JSON.stringify(EVAL(JSON.parse(a),"")); }
require('repl').start({
    prompt: "user> ",
    ignoreUndefined: true,
    eval: function(l,c,f,cb) { console.log(rep(l.slice(1,l.length-2))); cb() }
});
