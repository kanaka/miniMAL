STEPS = step1_read_print step2_eval step3_env step4_if_fn_do step5_tco step6_file step7_quote stepA_interop stepB_web

.SECONDARY:

all: compress

index.html: stepB_web-crush.js
	@echo "<html>" > $@
	@echo "<body>" >> $@
	@echo "</body>" >> $@
	@echo "<script>" >> $@
	@echo "window.b = document.body;" >> $@
	@echo "</script>" >> $@
	@echo "<script>" >> $@
	@cat $< >> $@
	@echo "</script>" >> $@
	@echo "</html>" >> $@

UGLIFY_OPTS=-c hoist_funs=true,unsafe=true,keep_fargs=true,pure_getters=true,screw-ie8=true,unused=false -m -e

%-uglify-pretty.js: %.js
	node_modules/uglify-js/bin/uglifyjs $< -b $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' > $@

%-uglify.js: %.js
	node_modules/uglify-js/bin/uglifyjs $<    $(UGLIFY_OPTS) | sed 's/^!function() *{\(.*\)}();/\1/' > $@

%-crush.js: %-uglify.js
	cat $< | node_modules/jscrush/bin/jscrush > $@
	
compress^%: %-crush.js
	@wc $*.js $*-uglify.js $*-crush.js | grep -v "total"

.PHONY: compress
compress: $(foreach s,$(STEPS),compress^$(s))

clean:
	rm -f index.html *-uglify.js *-crush.js
