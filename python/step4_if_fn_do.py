#!/usr/bin/env python

import sys, traceback, readline

try:    from simplejson import loads, dumps
except: from json import loads, dumps

if sys.version_info[0] >= 3: rl = input
else:                        rl = raw_input

# Environment
class Env(object):
    def __init__(self, outer=None, binds=[], exprs=[], data=None):
        self.data = data or {}
        self.outer = outer

        for i in range(len(binds)):
            if binds[i] == "&":
                self.data[binds[i+1]] = exprs[i:]
                break
            else:
                self.data[binds[i]] = exprs[i]

    def find(self, key):
        if key in self.data: return self
        elif self.outer:     return self.outer.find(key)
        else:                return None

    def set(self, key, value):
        return self.data.__setitem__(key, value) or value

    def get(self, key):
        try:    return self.find(key).data[key]
        except: raise Exception(key + " not found")

def READ(s): return loads(s)

def eval_ast(ast, env):
    if type(ast) == list:  return list(map(lambda e: EVAL(e, env), ast))
    elif type(ast) == str: return env.get(ast)
    else:                  return ast

def EVAL(ast, env):
    #print("EVAL ast: %s" % ast)
    if type(ast) != list: return eval_ast(ast, env)

    # apply
    if "def" == ast[0]:
        return env.set(ast[1], EVAL(ast[2], env))
    elif "let" == ast[0]:
        let_env = Env(env)
        for i in range(0, len(ast[1]), 2):
            let_env.set(ast[1][i], EVAL(ast[1][i+1], let_env))
        return EVAL(ast[2], let_env)
    elif "do" == ast[0]:
        return eval_ast(ast[1:], env)[-1]
    elif "if" == ast[0]:
        if EVAL(ast[1], env):
            return EVAL(ast[2], env)
        else:
            return EVAL(ast[3], env)
    elif "fn" == ast[0]:
        return lambda *args: EVAL(ast[2], Env(env, ast[1], args))
    else:
        el = eval_ast(ast, env)
        f = el[0]
        return f(*el[1:])

def PRINT(o): return dumps(o, separators=(',', ':'),
                              default=lambda o: None)

repl_env = Env()
def rep(line):
    return PRINT(EVAL(READ(line), repl_env))

repl_env.set('=', lambda a,b: a==b)
repl_env.set('<', lambda a,b: a<b)
repl_env.set('<=', lambda a,b: a<=b)
repl_env.set('>', lambda a,b: a>b)
repl_env.set('>=', lambda a,b: a>=b)
repl_env.set('+', lambda a,b: a+b)
repl_env.set('-', lambda a,b: a-b)
repl_env.set('*', lambda a,b: a*b)
repl_env.set('/', lambda a,b: a/b)
repl_env.set('list', lambda *a: list(a))
repl_env.set('map', lambda a,b: list(map(a,b)))

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
