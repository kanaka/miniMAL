#!/usr/bin/env python

import sys, traceback, readline

try:    import simplejson as json
except: import json

if sys.version_info[0] >= 3: rl = input
else:                        rl = raw_input

def eval_ast(ast, env):
    if type(ast) == list:  return list(map(lambda e: EVAL(e, env), ast))
    elif type(ast) == str: return env[ast]
    else:                  return ast

def EVAL(ast, env):
    if type(ast) != list: return eval_ast(ast, env)

    # apply
    el = eval_ast(ast, env)
    f = el[0]
    return f(*el[1:])

repl_env = {'+': lambda a,b: a+b,
            '-': lambda a,b: a-b,
            '*': lambda a,b: a*b,
            '/': lambda a,b: int(a/b)}

def rep(line):
    return json.dumps(EVAL(json.loads(line), repl_env), separators=(',', ':'))

while True:
    try:
        line = rl("user> ")
        if not line: continue
    except EOFError:
        break
    try:
        print("%s" % rep(line))
    except ValueError as e:
        print("%s" % e.args[0])
    except Exception:
        print("".join(traceback.format_exception(*sys.exc_info())))
