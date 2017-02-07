#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2017 Joel Martin
# Licensed under MPL 2.0

import sys, traceback, readline
from json import loads, dumps

def eval_ast(ast, env):
    if type(ast) == list:  return list(map(lambda e: EVAL(e, env), ast))
    elif type(ast) == str: return env[ast]
    else:                  return ast

def EVAL(ast, env):
    if type(ast) != list: return eval_ast(ast, env)

    # apply
    el = eval_ast(ast, env)
    fn = el[0]
    return fn(*el[1:])

repl_env = {'+': lambda a,b: a+b,
            '-': lambda a,b: a-b,
            '*': lambda a,b: a*b,
            '/': lambda a,b: int(a/b)}

def rep(line):
    return dumps(EVAL(loads(line), repl_env), separators=(',', ':'))

if __name__ == "__main__":
    while True:
        try:
            line = input("> ")
            if not line: continue
        except EOFError:
            break
        try:
            print("%s" % rep(line))
        except ValueError as e:
            print("%s" % e.args[0])
        except Exception:
            print("".join(traceback.format_exception(*sys.exc_info())))
