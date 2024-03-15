#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2024 Joel Martin
# Licensed under MPL 2.0

import sys, readline, builtins
from json import loads, dumps

def throw(a): raise Exception(a)

def Env(outer=object, binds=[], exprs=[], d=None):
    d = d or {}
    for i in range(len(binds)):
        if binds[i] == "&":
            d[binds[i+1]] = exprs[i:]
            break
        else:
            d[binds[i]] = exprs[i]
    return type("Env", (outer,), d)

def EVAL(ast, env):
  while True:
    #print("EVAL ast: %s" % ast)
    # eval
    if type(ast) != list:
        return getattr(env, ast) if type(ast) == str else ast

    # apply
    elif "def" == ast[0]:
        setattr(env, ast[1], EVAL(ast[2], env))
        return getattr(env, ast[1])
    elif "~" == ast[0]: # mark as macro
        fn = EVAL(ast[1], env)
        fn.M = 1
        return fn
    elif "let" == ast[0]:
        env = Env(env)
        for i in range(0, len(ast[1]), 2):
            setattr(env, ast[1][i], EVAL(ast[1][i+1], env))
        ast = ast[2]  # TCO
    elif "`" == ast[0]:
        return ast[1]
    elif ".-" == ast[0]:
        el = [EVAL(a, env) for a in ast[1:]]
        if len(el) > 2:
            setattr(el[0], el[1], el[2])
        return getattr(el[0], el[1])
    elif "do" == ast[0]:
        [EVAL(a, env) for a in ast[1:-1]]
        ast = ast[-1]  # TCO
    elif "if" == ast[0]:
        ast = ast[2] if EVAL(ast[1], env) else ast[3] # TCO
    elif "fn" == ast[0]:
        fn = lambda *a: EVAL(ast[2], Env(env, ast[1], [*a]))
        fn.A = [ast[2], env, ast[1]]
        return fn
    else:
        fn = EVAL(ast[0], env)
        if hasattr(fn, "M"):
            ast = fn(*ast[1:]) # TCO
        else:
            el = [EVAL(a, env) for a in ast[1:]]
            if hasattr(fn, 'A'):
                ast = fn.A[0]
                env = Env(fn.A[1], fn.A[2], el) # TCO
            else:
                return fn(*el)

E = Env(d={**builtins.__dict__,
    'py':        eval,
    'eval':      lambda a: EVAL(a, E),

    '=':         lambda a,b: a==b,
    '<':         lambda a,b: a<b,
    '+':         lambda a,b: a+b,
    '-':         lambda a,b: a-b,
    '*':         lambda a,b: a*b,
    '/':         lambda a,b: int(a/b),
    'list':      lambda *a: [*a],
    #'map':       lambda a,b: list(map(a,b)),
    'apply':     lambda a,b: a(*b),

    'read':      loads,
    'pr*':       lambda a: dumps(a, separators=(',', ':')),
    'slurp':     lambda a: open(a).read(),

    'argv':      sys.argv[2:]
    })

if __name__ == "__main__":
    if len(sys.argv) >= 2:
        EVAL(loads(E.slurp(sys.argv[1])), E)
        sys.exit(0)

    while True:
        try:
            line = input("> ")
            if not line: continue
        except EOFError:
            break
        try:
            print(getattr(E, 'pr*')(EVAL(loads(line), E)))
        except Exception as e:
            print(repr(e))
        #import traceback
        #except Exception:
        #    print("".join(traceback.format_exception(*sys.exc_info())))
