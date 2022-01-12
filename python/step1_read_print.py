#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2022 Joel Martin
# Licensed under MPL 2.0

import sys, readline
from json import loads, dumps

def EVAL(ast, env):
    return ast


if __name__ == "__main__":
    while True:
        try:
            line = input("> ")
            if not line: continue
        except EOFError:
            break
        try:
            print("%s" % dumps(EVAL(loads(line), {}), separators=(',', ':')))
        except Exception as e:
            print(repr(e))
        #import traceback
        #except Exception:
        #    print("".join(traceback.format_exception(*sys.exc_info())))
