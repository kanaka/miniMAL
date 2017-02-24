STEPS = step1_read_print step2_eval step3_env step4_if_fn_do step5_tco \
        step6_file step7_interop step8_macros step9_try stepA_miniMAL \
        stepB_web stepB_node stepB_js1k

WEB_FILES = web/miniMAL-min.js web/miniMAL-core.js

.SECONDARY:

all: miniMAL-js1k.js miniMAL-node.js miniMAL-min.js $(WEB_FILES)

#
# Uglify
#
UGLIFY_OPTS=-c hoist_funs=true,unsafe=true,keep_fargs=true,pure_getters=true,screw-ie8=true,unused=false -m -e

REGPACK_OPTS=--crushGainFactor 2 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor=1
#REGPACK_OPTS=--crushGainFactor 1 --crushLengthFactor 0 --crushCopiesFactor 0 --crushTiebreakerFactor=1

node_modules/uglify-js:
	npm install

%-uglify-pretty.js: %.js node_modules/uglify-js
	UglifyJS2/bin/uglifyjs $< -b $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' | sed 's/"string"/typeof ""/g' > $@

%-uglify.js: %.js node_modules/uglify-js
	UglifyJS2/bin/uglifyjs $<    $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' | sed 's/"string"/typeof ""/g' > $@

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
RegPack/node_modules/minimist:
	cd RegPack && npm install

%-regpack.js: %-uglify.js RegPack/node_modules/minimist
	node ./RegPack/bin/regpack $(REGPACK_OPTS) $< | tr -d '\n' > $@

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

web/miniMAL-core.js: core.json
	echo -n "core_ns =" > $@
	cat $< >> $@
	UglifyJS2/bin/uglifyjs -r core_ns $@ $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' > $@.tmp
	node ./RegPack/bin/regpack $(REGPACK_OPTS) $@.tmp > $@
	rm $@.tmp

miniMAL-js1k.js: stepB_js1k-regpack.js
	cp $< $@

miniMAL-js1k.b64: stepB_js1k-regpack.js
	node -e "console.log(require('fs').readFileSync('$<').toString('base64'))" > $@

#
# Node
#
miniMAL-node.js: stepB_node-regpack.js
	cp $< $@

.PHONY: crush regpack stats stats-full clean
crush: $(foreach s,$(STEPS),crush^$(s))
regpack: $(foreach s,$(STEPS),regpack^$(s))
stats: $(foreach s,$(STEPS),stats^$(s)) $(WEB_FILES)
	@wc $(WEB_FILES) | grep -v "total"
stats-full: $(foreach s,$(STEPS),stats-full^$(s)) $(WEB_FILES)
	@wc $(WEB_FILES) | grep -v "total"

clean:
	rm -f *-uglify.js *-uglify-pretty.js *-crush.js *-regpack.js miniMAL-js1k.b64 $(WEB_FILES)
