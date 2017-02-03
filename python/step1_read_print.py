#!/usr/bin/env python

import sys, traceback, readline

try:    import simplejson as json
except: import json

if sys.version_info[0] >= 3: rl = input
else:                        rl = raw_input


def EVAL(ast, env):
    return ast

def rep(line):
    return json.dumps(EVAL(json.loads(line), ""), separators=(',', ':'))

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
