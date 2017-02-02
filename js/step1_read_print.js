// miniMAL
// Copyright (C) 2016 Joel Martin
// Licensed under MPL 2.0

function EVAL(ast, env) {
    return ast
}


// Node specific
var rep = (...a) => JSON.stringify(EVAL(JSON.parse(a[0]),{}))

var rl = require('readline').createInterface(
        process.stdin, process.stdout, false, false)
var x = (...a) => a[0] && console.log(rep(a[0])) || rl.question("user> ", x)
x()
