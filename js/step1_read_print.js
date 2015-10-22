// miniMAL
// Copyright (C) 2014 Joel Martin
// Licensed under MPL 2.0

function EVAL(ast, env) {
    return ast;
}


// Node specific
function rep(a) { return JSON.stringify(EVAL(JSON.parse(a),"")); }

var rl = require('readline').createInterface(
        process.stdin, process.stdout, false, false);
function x(l) {
    l && console.log(rep(l));
    rl.question("user> ", x);
}
x()
