// miniMAL
// Copyright (C) 2024 Joel Martin
// Licensed under MPL 2.0

function EVAL(env, ast) {
    return ast
}

// Node specific
require("repl").start({
    eval:     (...a) => a[3](0,JSON.stringify(EVAL({}, JSON.parse(a[0])))),
    writer:   (...a) => a[0]})
