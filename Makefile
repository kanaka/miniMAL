STEPS = step1_read_print step2_eval step3_env step4_if_fn_do step5_tco \
        step6_file step7_quote step8_macros step9_try stepA_interop \
        stepB_web stepB_node stepB_js1k

.SECONDARY:

all: crush regpack stats miniMAL-min.js

#
# Uglify
#
UGLIFY_OPTS=-c hoist_funs=true,unsafe=true,keep_fargs=true,pure_getters=true,screw-ie8=true,unused=false -m -e

node_modules/uglify-js:
	npm install

%-uglify-pretty.js: %.js node_modules/uglify-js
	node_modules/uglify-js/bin/uglifyjs $< -b $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' > $@

%-uglify.js: %.js node_modules/uglify-js
	node_modules/uglify-js/bin/uglifyjs $<    $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' > $@

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
	node ./RegPack/regPack.js $< > $@

regpack^%: %-regpack.js
	@true

#
# Stats
#
stats^%: %.js %-uglify.js %-crush.js %-regpack.js
	@wc $^ | grep -v "total"

#
# Web
#
miniMAL-min.js: stepB_web-regpack.js
	cp $< $@


.PHONY: crush regpack stats clean
crush: $(foreach s,$(STEPS),crush^$(s))
regpack: $(foreach s,$(STEPS),regpack^$(s))
stats: $(foreach s,$(STEPS),stats^$(s))

clean:
	rm -f *-uglify.js *-uglify-pretty.js *-crush.js *-regpack.js
