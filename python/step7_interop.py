#!/usr/bin/env python

from __future__ import print_function
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
    if type(ast) == list:        return list(map(lambda e: EVAL(e, env), ast))
    elif type(ast) == type(u''): return env.get(ast)
    else:                        return ast

def EVAL(ast, env):
  while True:
    #print("EVAL ast: %s" % ast)
    if type(ast) != list: return eval_ast(ast, env)

    # apply
    if "def" == ast[0]:
        return env.set(ast[1], EVAL(ast[2], env))
    elif "let" == ast[0]:
        env = Env(env)
        for i in range(0, len(ast[1]), 2):
            env.set(ast[1][i], EVAL(ast[1][i+1], env))
        ast = ast[2]  # TCO
    elif "`" == ast[0]:
        return ast[1]
    elif ".-" == ast[0]:
        el = eval_ast(ast[1:], env)
        if len(el) > 2:
            setattr(el[0], el[1], el[2])
            return el[2]
        else:
            return getattr(el[0], el[1])
    elif "." == ast[0]:
        el = eval_ast(ast[1:], env)
        x = getattr(el[0], el[1])
        return x(el[0], *el[2:])
    elif "do" == ast[0]:
        eval_ast(ast[1:-1], env)
        ast = ast[-1]  # TCO
    elif "if" == ast[0]:
        if EVAL(ast[1], env):
            ast = ast[2]  # TCO
        else:
            ast = ast[3]  # TCO
    elif "fn" == ast[0]:
        f = lambda *args: EVAL(ast[2], Env(env, ast[1], args))
        f.ast = ast[2]
        f.env = env
        f.params = ast[1]
        return f
    else:
        el = eval_ast(ast, env)
        f = el[0]
        if hasattr(f, 'ast'):
            ast = f.ast;
            env = Env(f.env, f.params, el[1:])
        else:
            return f(*el[1:])

def PRINT(o): return dumps(o, separators=(',', ':'),
                              default=lambda o: None)

repl_env = Env(outer=Env(data=__builtins__.__dict__))
def rep(line):
    return PRINT(EVAL(READ(line), repl_env))

repl_env.set('py', lambda a: eval(a))
repl_env.set('eval', lambda a: EVAL(a, repl_env))

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
repl_env.set('get', lambda a,b: a[b])
repl_env.set('map', lambda a,b: list(map(a,b)))
repl_env.set('apply', lambda a,b: a(*b))

repl_env.set('read', READ)
repl_env.set('pr-str*', PRINT)
repl_env.set('slurp', lambda a: open(a).read())
repl_env.set('load', lambda a: EVAL(READ(open(a).read()),repl_env))
repl_env.set('typeof', lambda a: type(a).__name__)

repl_env.set('ARGS', sys.argv[2:])
if len(sys.argv) >= 2:
    try:
        rep('["load", ["`", "' + sys.argv[1] + '"]]')
    except EOFError:
        pass
    sys.exit(0)

while True:
    try:
        line = rl("> ")
        if not line: continue
    except EOFError:
        break
    try:
        print("%s" % rep(line))
    except ValueError as e:
        print("%s" % e.args[0])
    except Exception:
        print("".join(traceback.format_exception(*sys.exc_info())))
