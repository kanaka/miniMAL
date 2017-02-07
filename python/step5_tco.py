#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2017 Joel Martin
# Licensed under MPL 2.0

import sys, traceback, readline
from json import loads, dumps

def throw(a):
    raise Exception(a)

def Env(outer=object, binds=[], exprs=[], data=None):
    data = data or {}
    for ix in range(len(binds)):
        if binds[ix] == "&":
            data[binds[ix+1]] = exprs[ix:]
            break
        else:
            data[binds[ix]] = exprs[ix]
    return type("Env", (outer,), data or {})

def eval_ast(ast, env):
    if type(ast) == list:  return list(map(lambda e: EVAL(e, env), ast))
    elif type(ast) == str:
        if not hasattr(env, ast): throw(ast + " not found")
        return getattr(env, ast)
    else:                  return ast

def EVAL(ast, env):
  while True:
    #print("EVAL ast: %s" % ast)
    if type(ast) != list: return eval_ast(ast, env)

    # apply
    if "def" == ast[0]:
        setattr(env, ast[1], EVAL(ast[2], env))
        return getattr(env, ast[1])
    elif "let" == ast[0]:
        env = Env(env)
        for ix in range(0, len(ast[1]), 2):
            setattr(env, ast[1][ix], EVAL(ast[1][ix+1], env))
        ast = ast[2]  # TCO
    elif "do" == ast[0]:
        eval_ast(ast[1:-1], env)
        ast = ast[-1]  # TCO
    elif "if" == ast[0]:
        if EVAL(ast[1], env):
            ast = ast[2]  # TCO
        else:
            ast = ast[3]  # TCO
    elif "fn" == ast[0]:
        fn = lambda *args: EVAL(ast[2], Env(env, ast[1], list(args)))
        fn.ast = ast[2]
        fn.env = env
        fn.params = ast[1]
        return fn
    else:
        el = eval_ast(ast, env)
        fn = el[0]
        if hasattr(fn, 'ast'):
            ast = fn.ast;
            env = Env(fn.env, fn.params, el[1:])
        else:
            return fn(*el[1:])

def PRINT(o):
    return dumps(o, separators=(',', ':'), default=lambda o: None)

import builtins
repl_env = Env(outer=Env(data=builtins.__dict__), data={
    '=':         lambda a,b: a==b,
    '<':         lambda a,b: a<b,
    '<=':        lambda a,b: a<=b,
    '>':         lambda a,b: a>b,
    '>=':        lambda a,b: a>=b,
    '+':         lambda a,b: a+b,
    '-':         lambda a,b: a-b,
    '*':         lambda a,b: a*b,
    '/':         lambda a,b: int(a/b),
    'list':      lambda *a: list(a),
    'map':       lambda a,b: list(map(a,b)),
    })

def rep(line):
    return PRINT(EVAL(loads(line), repl_env))

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
