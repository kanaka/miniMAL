// miniMAL
// Copyright (C) 2024 Joel Martin
// Licensed under MPL 2.0

// Node specific
require("repl").start({
    eval:     (...a) => a[3](0,a[0].trim()),
    writer:   (...a) => a[0]})
