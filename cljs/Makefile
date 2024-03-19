STEPS = step0_repl step1_read_print step2_eval step3_env \
	step4_if_fn_do step5_tco step6_file step7_interop \
	step8_macros step9_try stepA_miniMAL

MIN_FILES = $(foreach S,$(STEPS),src-min/miniMAL/$(S).cljc) miniMAL
BUILD_FILES = $(foreach S,$(STEPS),build/$(S).js) miniMAL.js

.SECONDARY:

all: $(MIN_FILES) $(BUILD_FILES)

#
# Compressed
#
src-min/miniMAL/%.cljc: src/miniMAL/%.cljc
	@echo "Compressing $@"
	@mkdir -p src-min/miniMAL/
	@cat $< \
	    | egrep -v "^ *$$|^ *;" \
	    | sed 's/^ *//' \
	    | tr '\n' ' ' \
	    | sed \
	       -e 's/  *(/(/g' \
	       -e 's/)  */)/g' \
	       -e 's/  *"/"/g' \
	       -e 's/  *\[/[/g' \
	       -e 's/]  */]/g' \
	       -e 's/  *{/{/g' \
	       -e 's/"  *\([^n]\)/"\1/g' \
	       -e 's/\<new-env\>/Y/g' \
	       -e 's/\([^-]\)\<env\>/\1E/g' \
	       -e 's/\<ast\>/A/g' \
	       -e 's/\<EVAL\>/X/g' \
	       -e 's/\<a0\>/a/g' \
	       -e 's/\<a1\>/b/g' \
	       -e 's/\<a2\>/c/g' \
	       -e 's/\<a3\>/d/g' \
	       -e 's/\<rest\>/R/g' \
	       -e 's/\((ns [^)]*)\)/\1(def R rest)/' \
	       -e 's/\<js\/JSON.parse\>/P/g' \
	       -e 's/\((ns [^)]*)\)/\1(def P js\/JSON.parse)/' \
	       -e 's/ *#?(:org.babashka\/nbb *\(.*\) *#_nbb-end */\1/' \
	       -e 's/ *:cljs *\(.*\)) *#_cljs-end *//' \
	    > $@

miniMAL: src-min/miniMAL/stepA_miniMAL.cljc
	echo "Compressing $@"
	echo "#!/usr/bin/env nbb" > $@
	cat $< \
	    | sed "s/(ns [^)]*)//" \
	    | sed 's/defn -main\[& args\]/let [args (seq (.slice js\/process.argv 3))]/' \
	    >> $@
	chmod +x $@

node_modules/.bin/shadow-cljs:
	npm install

# Full ClojureScript Compiled
build/%.js: node_modules/.bin/shadow-cljs src/miniMAL/%.cljc
	node_modules/.bin/shadow-cljs release $*
	chmod +x $@

miniMAL.js: node_modules/shadow-cljs src/miniMAL/stepA_miniMAL.cljc
	node_modules/.bin/shadow-cljs release miniMAL
	chmod +x $@

#
# Stats
#
stats^%: src/miniMAL/%.cljc src-min/miniMAL/%.cljc
	@wc -l -c $^ | grep -v "total"


.PHONY: clean stats

stats: $(foreach s,$(STEPS),stats^$(s)) miniMAL core.json
	@wc -l -c miniMAL core.json | grep -v "total"

clean:
	rm -f $(MIN_FILES)
	rm -f $(BUILD_FILES)
	rm -fr build/cljs-runtime
	rmdir -p build || true
	rmdir -p src-min/miniMAL || true
