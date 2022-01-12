STEPS = step1_read_print step2_eval step3_env step4_if_fn_do step5_tco \
        step6_file step7_interop step8_macros step9_try stepA_miniMAL

MIN_FILES = miniMAL.py miniMAL.pyz

.SECONDARY:

all: $(MIN_FILES)

# Library
miniMAL.py: stepA_miniMAL.py
	echo '__all__ = ["EVAL","rep","repl_env"]' > $@
	python3 minipy/minipy.py -R -p EVAL,E $< | grep -v "^#!" >> $@

# Standalone
miniMAL.pyz: stepA_miniMAL.pyz
	cp $< $@


#
# minipy
#
%-minipy.py: %.py
	python3 minipy/minipy.py -R -o $@ $<

minipy^%: %-minipy.py
	@true

#
# pyz
#
%.pyz: %-minipy.py
	cp $< __main__.py
	zip __main__.zip __main__.py
	echo "#!/usr/bin/env python3" > $@
	cat __main__.zip >> $@
	rm -f __main__.py __main__.zip
	chmod +x $@


#
# Stats
#
stats^%: %.py %-minipy.py
	@wc $^ | grep -v "total"

stats-full^%: %.py %-minipy.py %.pyz
	@wc $^ | grep -v "total"

.PHONY: minipy stats clean
minipy: $(foreach s,$(STEPS),minipy^$(s))
stats: $(foreach s,$(STEPS),stats^$(s)) core.json $(MIN_FILES)
	@wc core.json $(MIN_FILES) | grep -v "total"
stats-full: $(foreach s,$(STEPS),stats-full^$(s)) core.json $(MIN_FILES)
	@wc core.json $(MIN_FILES) | grep -v "total"


clean:
	rm -f *-minipy.py *.pyz $(MIN_FILES)
