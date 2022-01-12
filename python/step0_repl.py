#!/usr/bin/env python3
# miniMAL
# Copyright (C) 2022 Joel Martin
# Licensed under MPL 2.0

import readline

if __name__ == "__main__":
    while True:
        try:
            line = input("> ")
            if not line: continue
        except EOFError:
            break
        print(line)
