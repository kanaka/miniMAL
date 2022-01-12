#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2022 Joel Martin
# Licensed under MPL 2.0

import sys, readline
from json import loads, dumps

def throw(a): raise Exception(a)

def Env(outer=object, binds=[], exprs=[], d=None):
    d = d or {}
    return type("Env", (outer,), d)

def EVAL(ast, env):
    #print("EVAL ast: %s" % ast)
    # eval
    if type(ast) != list:
        return getattr(env, ast) if type(ast) == str else ast

    # apply
    elif "def" == ast[0]:
        setattr(env, ast[1], EVAL(ast[2], env))
        return getattr(env, ast[1])
    elif "let" == ast[0]:
        env = Env(env)
        for i in range(0, len(ast[1]), 2):
            setattr(env, ast[1][i], EVAL(ast[1][i+1], env))
        return EVAL(ast[2], env)
    else:
        el = [EVAL(a, env) for a in ast]
        fn = el[0]
        return fn(*el[1:])

E = Env(d={
    '+':         lambda a,b: a+b,
    '-':         lambda a,b: a-b,
    '*':         lambda a,b: a*b,
    '/':         lambda a,b: int(a/b),
    })

if __name__ == "__main__":
    while True:
        try:
            line = input("> ")
            if not line: continue
        except EOFError:
            break
        try:
            print("%s" % dumps(EVAL(loads(line), E), separators=(',', ':')))
        except Exception as e:
            print(repr(e))
        #import traceback
        #except Exception:
        #    print("".join(traceback.format_exception(*sys.exc_info())))
