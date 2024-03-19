STEPS = step0_repl step1_read_print step2_eval step3_env \
	step4_if_fn_do step5_tco step6_file step7_interop \
	step8_macros step9_try stepA_miniMAL \
	stepB_web stepB_node stepB_js1k

NODE_FILES = miniMAL-node.js miniMAL-core.js
WEB_FILES = web/miniMAL-js1k.js web/miniMAL-min.js web/miniMAL-core.js

.SECONDARY:

all: $(NODE_FILES) $(WEB_FILES)

#
# Uglify
#
UGLIFY = node_modules/.bin/uglifyjs
UGLIFY_OPTS=-c hoist_funs=true,unsafe=true,keep_fargs=true,pure_getters=true,unused=false -e -m

REGPACK = node regpack/bin/regpack
REGPACK_OPTS=--crushGainFactor 2 --crushLengthFactor 1 --crushCopiesFactor 0 --crushTiebreakerFactor=1
# This compresses js1k better but results in an error on load
#REGPACK_OPTS=--crushGainFactor 1 --crushLengthFactor 0 --crushCopiesFactor 0 --crushTiebreakerFactor=1

node_modules/uglify-js:
	npm install

%-uglify-pretty.js: %.js node_modules/uglify-js
	$(UGLIFY) $< -b $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' | sed 's/"object"/ typeof {}/g' | sed 's/"string"/ typeof ""/g' | sed 's/\([^A-Za-z0-9_]\) typeof/\1typeof/g' > $@

%-uglify.js: %.js node_modules/uglify-js
	$(UGLIFY) $<    $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' | sed 's/"object"/ typeof {}/g' | sed 's/"string"/ typeof ""/g' | sed 's/\([^A-Za-z0-9_]\) typeof/\1typeof/g' > $@

%-uglify.json: %.json node_modules/uglify-js
	echo -n "ugvar=" > $@.tmp
	cat $< >> $@.tmp
	$(UGLIFY) $@.tmp $(UGLIFY_OPTS) reserved=['ugvar'] -c booleans=false | sed -e 's/ugvar=//' -e 's/;$$//' > $@
	rm $@.tmp

#
# RegPack
#
regpack/node_modules/minimist:
	cd regpack && npm install

%-regpack.js: %-uglify.js regpack/node_modules/minimist
	$(REGPACK) $(REGPACK_OPTS) $< | tr -d '\n' > $@

regpack^%: %-regpack.js
	@true

#
# Stats
#
stats^%: %.js %-regpack.js
	@wc -l -c $^ | grep -v "total"

stats-full^%: %.js %-uglify.js %-regpack.js
	@wc -l -c $^ | grep -v "total"

#
# Web
#
web/miniMAL-min.js: stepB_web-regpack.js
	cp $< $@

web/miniMAL-core.js: core.json
	echo -n "core_ns =" > $@
	cat $< >> $@
	$(UGLIFY) $@ $(UGLIFY_OPTS) reserved=['core_ns'] | sed 's/^!function() *{\(.*\)}();/\1/' > $@.tmp
	$(REGPACK) $(REGPACK_OPTS) $@.tmp > $@
	rm $@.tmp

web/miniMAL-js1k.js: stepB_js1k-regpack.js
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
.PHONY: regpack stats stats-full clean
regpack: $(foreach s,$(STEPS),regpack^$(s))
stats: $(foreach s,$(STEPS),stats^$(s)) core.json $(NODE_FILES) $(WEB_FILES)
	@wc -l -c core.json $(NODE_FILES) $(WEB_FILES) | grep -v "total"
stats-full: $(foreach s,$(STEPS),stats-full^$(s)) core.json $(NODE_FILES) $(WEB_FILES)
	@wc -l -c core.json $(NODE_FILES) $(WEB_FILES) | grep -v "total"

clean:
	rm -f *-uglify.js *-uglify-pretty.js *-regpack.js miniMAL-js1k.b64 $(NODE_FILES) $(WEB_FILES)
