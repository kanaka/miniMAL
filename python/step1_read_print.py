#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2017 Joel Martin
# Licensed under MPL 2.0

import sys, traceback, readline
from json import loads, dumps

def EVAL(ast, env):
    return ast

def rep(line):
    return dumps(EVAL(loads(line), {}), separators=(',', ':'))

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
