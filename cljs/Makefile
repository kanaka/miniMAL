STEPS = step0_repl step1_read_print step2_eval step3_env \
	step4_if_fn_do step5_tco step6_file step7_interop \
	step8_macros step9_try stepA_miniMAL

MIN_FILES = src/miniMAL/miniMAL.cljs miniMAL

all: $(MIN_FILES)

src/miniMAL/miniMAL.cljs: src/miniMAL/stepA_miniMAL.cljs
	@cat $< \
	    | egrep -v "^ *$$|^ *;" \
	    | sed 's/^ *//' \
	    | tr '\n' ' ' \
	    | sed 's/  *(/(/g' \
	    | sed 's/)  */)/g' \
	    | sed 's/  *"/"/g' \
	    | sed 's/  *\[/[/g' \
	    | sed 's/]  */]/g' \
	    | sed 's/"  *\([^n]\)/"\1/g' \
	    | sed 's/\<ast\>/A/g' \
	    | sed 's/\<env\>/E/g' \
	    | sed 's/\<a0\>/a/g' \
	    | sed 's/\<a1\>/b/g' \
	    | sed 's/\<a2\>/c/g' \
	    | sed 's/\<a3\>/d/g' \
	    | sed 's/stepA-miniMAL/miniMAL/' \
	    | sed 's/\<EVAL\>/X/g' \
	    | sed 's/\<eval-ast\>/Y/g' \
	    | sed 's/\<new-env\>/Z/g' \
	    > $@

miniMAL: src/miniMAL/miniMAL.cljs
	@echo "#!/usr/bin/lumo -q" > $@
	@cat $< \
	    | sed "s/(ns.*:require\([^)]*)\))/(require \'\1/" \
	    | sed 's/defn -main\[& args\]/let [args (seq (.slice js\/process.argv 4))]/' \
	    >> $@
	@chmod +x $@


.PHONY: clean

stats: $(foreach S,$(STEPS),src/miniMAL/$(S).cljs) $(MIN_FILES)
	@wc $^ | grep -v "total"

clean:
	rm -f $(MIN_FILES)
