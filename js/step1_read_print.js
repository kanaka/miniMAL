// miniMAL
// Copyright (C) 2016 Joel Martin
// Licensed under MPL 2.0

function EVAL(ast, env) {
    return ast
}


// Node specific
require("repl").start({
    eval:     (...a) => a[3](!1,JSON.stringify(EVAL(JSON.parse(a[0]),{}))),
    writer:   (...a) => a[0],
    terminal: false})
