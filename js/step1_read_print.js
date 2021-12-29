// miniMAL
// Copyright (C) 2017 Joel Martin
// Licensed under MPL 2.0

!function() {

function EVAL(ast, env) {
    return ast
}

// Node specific
require("repl").start({
    eval:     (...a) => a[3](0,EVAL(JSON.parse(a[0]),{})),
    writer:   JSON.stringify,
    terminal: 0})

}()
