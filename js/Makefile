STEPS = step0_repl step1_read_print step2_eval step3_env step4_if_fn_do \
        step5_tco step6_file step7_interop step8_macros step9_try \
        stepA_miniMAL stepB_web stepB_node stepB_js1k

WEB_FILES = web/miniMAL-min.js web/miniMAL-core.js

.SECONDARY:

all: miniMAL-js1k.js miniMAL-node.js miniMAL-min.js $(WEB_FILES)

#
# Uglify
#
UGLIFY = node_modules/.bin/uglifyjs
UGLIFY_OPTS=-c hoist_funs=true,unsafe=true,keep_fargs=true,pure_getters=true,unused=false -e -m

REGPACK = node_modules/.bin/regpack
REGPACK_OPTS=--crushGainFactor 2 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor=1
# This compresses js1k better but results in an error on load
#REGPACK_OPTS=--crushGainFactor 1 --crushLengthFactor 0 --crushCopiesFactor 0 --crushTiebreakerFactor=1

node_modules/uglify-js:
	npm install

%-uglify-pretty.js: %.js node_modules/uglify-js
	$(UGLIFY) $< -b $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' | sed 's/"object"/ typeof {}/g' | sed 's/"string"/ typeof ""/g' > $@

%-uglify.js: %.js node_modules/uglify-js
	$(UGLIFY) $<    $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' | sed 's/"object"/ typeof {}/g' | sed 's/"string"/ typeof ""/g' > $@

#
# JsCrush
#
node_modules/jscrush:
	npm install

%-crush.js: %-uglify.js node_modules/jscrush
	cat $< | node_modules/jscrush/bin/jscrush > $@

crush^%: %-crush.js
	@true

#
# RegPack
#
node_modules/regpack:
	npm install

%-regpack.js: %-uglify.js node_modules/regpack
	$(REGPACK) $(REGPACK_OPTS) $< | tr -d '\n' > $@

regpack^%: %-regpack.js
	@true

#
# Stats
#
stats^%: %.js %-regpack.js
	@wc $^ | grep -v "total"

stats-full^%: %.js %-uglify.js %-crush.js %-regpack.js
	@wc $^ | grep -v "total"

#
# Web
#
miniMAL-min.js: stepB_web-regpack.js
	cp $< $@

web/miniMAL-min.js: miniMAL-min.js
	cp $< $@

web/miniMAL-core.js: miniMAL-core.js
	sed 's/module.exports =/core_ns =/' $< > $@

miniMAL-js1k.js: stepB_js1k-regpack.js
	cp $< $@

miniMAL-js1k.b64: stepB_js1k-regpack.js
	node -e "console.log(require('fs').readFileSync('$<').toString('base64'))" > $@

#
# Node
#
miniMAL-node.js: stepB_node-regpack.js
	cp $< $@

miniMAL-core.js: core.json
	echo -n "module.exports =" > $@
	cat $< >> $@
	$(UGLIFY) $@ $(UGLIFY_OPTS) reserved=['exports'] | sed 's/^!function() *{\(.*\)}();/\1/' > $@.tmp
	$(REGPACK) $(REGPACK_OPTS) $@.tmp > $@
	rm $@.tmp
#
# multiple
#
.PHONY: crush regpack stats stats-full clean
crush: $(foreach s,$(STEPS),crush^$(s))
regpack: $(foreach s,$(STEPS),regpack^$(s))
stats: $(foreach s,$(STEPS),stats^$(s)) core.json miniMAL-core.js $(WEB_FILES)
	@wc core.json miniMAL-core.js $(WEB_FILES) | grep -v "total"
stats-full: $(foreach s,$(STEPS),stats-full^$(s)) core.json miniMAL-core.js $(WEB_FILES)
	@wc core.json miniMAL-core.js $(WEB_FILES) | grep -v "total"

clean:
	rm -f *-uglify.js *-uglify-pretty.js *-crush.js *-regpack.js miniMAL-js1k.b64 $(WEB_FILES)
