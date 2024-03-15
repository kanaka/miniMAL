#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2024 Joel Martin
# Licensed under MPL 2.0

import sys, readline
from json import loads, dumps

def throw(a): raise Exception(a)

def EVAL(ast, env):
    #print("EVAL ast: %s" % ast)
    # eval
    if type(ast) != list:
        return env[ast] if type(ast) == str else ast

    # apply
    else:
        el = [EVAL(a, env) for a in ast]
        fn = el[0]
        return fn(*el[1:])

E = {
    '+':         lambda a,b: a+b,
    '-':         lambda a,b: a-b,
    '*':         lambda a,b: a*b,
    '/':         lambda a,b: int(a/b),
    }

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
