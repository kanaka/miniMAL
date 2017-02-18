## miniMAL

A Delightfully Dimuntive Lisp.

The miniMAL core interpreter is implemented in less than 1024 bytes of
JavaScript (uglify/regpack). There is also an implementation of
miniMAL in python (1.4K as a pyz file) and ClojureScript (2K after
minification).

The design of miniMAL started with
[mal](https://github.com/kanaka/mal) (a Clojure-insipred pedagogical
Lisp interpreter with implementations in over sixty languages).
And in fact, in the miniMAL repository you can see the incremental
steps to build up the interpreter just like for each of the mal
implementations. However, the syntax and functionality of miniMAL is
fairly different from mal so it is a standalone project.

Even though miniMAL is tiny it is actually a very powerful Lisp with
advanced features including: higher-order functions, tail-call
optimization, macros, JavaScript interop, and error-handling. miniMAL
is powerful enough that it has been used to create a full
[implementation of mal](https://github.com/kanaka/mal/tree/master/miniMAL).

### Usage

You can try out miniMAL with the [online REPL](http://kanaka.github.io/miniMAL/).

Install the miniMAL binary using npm:

```bash
sudo npm install -g minimal-lisp
```

There are several different ways to use and/or integrate miniMAL:

* **Start a REPL**: run the miniMAL REPL (read-eval-print-loop). Requires
  Node.js.
```bash
miniMAL
```

* **Run a miniMAL program**: run a miniMAL program and then exit.
  Requires Node.js.
```bash
miniMAL hello.json
```

* **As a shebang script**: add a shebang line to the top of your
  miniMAL program and turn it into an executable script. Requires
  Node.js.
```bash
echo "#!/usr/bin/env miniMAL" > hello2.json
cat hello.json >> hello2.json
chmod +x hello2.json
./hello2.json
```

To use miniMAL as a library in another project, first install the
module locally using npm:

```bash
sudo npm install minimal-lisp
```

* **Node.js library**: you can use the miniMAL Node.js library to
  evaluate miniMAL source code in a regular Node.js program.
```javascript
var miniMAL = require('minimal-lisp'),
    m = miniMAL();
m.eval(["+", 2, 3]);
```

* **Web library**: you can use the miniMAL web library to evaluate
  miniMAL code in your web application.
```html
<script src="node_modules/minimal-lisp/js/web/miniMAL-min.js"></script>
<script>
var m = miniMAL();
m.eval(["+", 2, 3]);
</script>
```


### Features and Examples

* **JSON source**: the source code of miniMAL programs is just plain
  JSON (JavaScript object notation).
```json
["+", 2, 3]
=>5
["if", ["=", 5, 5], 7, 8]
=>7
["+", 2, ["*", 3, 4]]
=>14
```

* **"Lisp-0"**: Functions, symbols and strings
  are all in the same namespace making miniMAL a "Lisp-0". In
  contrast, Lisp-2 languages have functions and symbols (and strings)
  that are in separate namespaces. In Lisp-1 languages functions and
  symbols are in the same namespace (and strings are still separate).
  Strings in miniMAL are just quoted symbols.
```json
["def", "a_symbol", 3]
=>3
"a_symbol"
=>3
["*", "a_symbol", 6]
=>18
["`", "a quoted symbol is a string"]
=>"a quoted symbol is a string"
```

* **Lambdas**: miniMAL has anonymous and named functions.
```json
[ ["fn", ["a"], ["*", "a", "a"]], 8]
=>64
["def", "sqr", ["fn", ["a"], ["*", "a", "a"]]]
["sqr", 7]
=>49
```

* **Variadic Functions**: miniMAL functions/lambdas can support
  variable numbers of parameters using the Clojure style "&"
  delimeter.
```json
["def", "drop1", ["fn", ["a", "&", "b"], "b"]]
["drop1", 1, 2, 3]
=>[2,3]
```

* **Lexical scope and let blocks**: miniMAL has full lexical scoping
  within let blocks and lambdas. In the following example, "add5" is
  defined as a function that refers to a lexicallly scoped variable
  "x". The "x" variable is available to the function because the
  definition of the function happened within same lexical scope
  (it is a function closure), but it is not accessible outside the
  "let" block lexical scope.
```json
["def", "add5", ["let", ["x", 5], ["fn", ["a"], ["+", "x", "a"]]]]
["add5", 7]
=>12
"x"
=>__ERROR__
```

* **First class functions/lambdas**: functions/lambdas are first class
  values in miniMAL. They can be bound to variables, passed into and
  returned from functions just like normal values.
```json
["def", "addX", ["fn", ["X"], ["fn", ["a"], ["+", "X", "a"]]]]
["def", "add9", ["addX", 9]]
["add9", 20]
=>29
["map", "add9", ["`", [2, 3, 4]]]
=>[11,12,13]
```

* **Automatic tail call optimization (TCO)**: when a function calls
  itself (recursion) as the very last thing it does (tail call), this
  is automatically optimized so that the call does not consume any
  stack.  This allows recursion to be as efficient as iteration. In
  this example, "sum1" is not tail optimized because an addition
  happens after the recursive call to "sum1". "sum2" is tail optimized
  by miniMAL because the recursive "sum2" call happens in tail
  position.
```json
["def", "sum1", ["fn", ["n"], ["if", ["=", "n", 0], 0, ["+", "n", ["sum1", ["-", "n", 1]]]]]]
["sum1", 10000]
=>__ERROR: stack overflow__
["def", "sum2", ["fn", ["n", "a"], ["if", ["=", "n", 0], "a", ["sum2", ["-", "n", 1], ["+", "n", "a"]]]]]
["sum2", 10000, 0]
=>500500
```

* **JavaScript Interop**: miniMAL uses native JavaScript types (e.g.
  lists are implemented as arrays) and supports JavaScript interop
  using the method call function (`"."`) and the property get/set
  function (`".-"`).
```json
["def", "randInt", ["fn", ["max"], ["parseInt", ["*", "max", [".", "Math", ["`", "random"]]]]]]
["randInt", 100]
=>16
["def", "rand-hsl", ["fn", [], ["+", ["+", ["`", "hsl("], ["randInt", 360]], ["`", ", 50%, 70%)"]]]]
["def", "set-style", ["fn", ["o", "k", "v"],  [".-",  [".-", "o", ["`", "style"]], "k", "v"]]]
["def", "by-tag", ["fn", ["tag"], [".", "document", ["`", "getElementsByTagName"], "tag"]]]
["set-style", [".-", ["by-tag", ["`", "body"]],0], ["`", "backgroundColor"], ["rand-hsl"]]
=>__background color set to random hsl value__
```

*The following features are omitted from JS1K version of the
implementation in order to make space for example code.*

* **Exception Handling**: miniMAL supports try/catch/throw style
  exception handling. The thrown exceptions can be any arbitrary type.
```json
["try", "abc", ["catch", "exc", ["list", ["`", "exc was:"], "exc"]]]
=>["exc was:","abc not found"]
["try", ["throw", 123], ["catch", "exc", ["list", ["`", "exc was:"], "exc"]]]
=>["exc was:",123]
["try", ["throw", 123], ["catch", "exc", ["list", ["`", "exc was:"], "exc"]]]
=>["exc was:",123]
```

* **Macros**: miniMAL has the ability to define macros. Macros allow
  a program to create new syntactic structures. When a normal
  function call is handled, the arguments to the function are all
  evaluated first before the function is called. A macro receives all
  its arguments unevaluated and can manipulate the raw arguments.
  Whatever value is returned from the macro (perhaps a re-written
  function call) is evaluated again. In the following example, the
  "unless" macro reverses the logic of the if statement. If "unless"
  was a defined as a regular function both of the true and false
  positions would all be evaluated before the "unless" function was
  called.  However, defining "unless" as a macro allows either the
  true or false position to be evaluated but not both .
```json
["def", "unless", ["~", ["fn", ["p", "a", "b"], ["list", ["`", "if"], "p", "b", "a"]]]]
["unless", false, 7, 8]
=>7
["unless", true, 7, 8]
=>8
```

### Rationale

I originally started implementing a tiny Lisp interpreter as a quick
hack to submit to the [2015 JS1K
competition](http://js1k.com/2015-hypetrain/)
([demo 2209](http://js1k.com/2015-hypetrain/demo/2209)). However,
I soon realized that I could fit far more functionality into 1024
bytes of JavaScript than I expected and so miniMAL was born as
a "full-fledged" Lisp in its own right.

### License

miniMAL is licensed under the [MPL 2.0](http://www.mozilla.org/MPL/2.0/) (Mozilla Public License 2.0).
See LICENSE for more details.

