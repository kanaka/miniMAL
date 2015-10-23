#
# Command line settings
#

miniMAL_IMPL = js

PYTHON = python

# Extra options to pass to runtest.py
TEST_OPTS =

# Extra implementation specific options to pass to runtest.py
mal_TEST_OPTS = --start-timeout 60 --test-timeout 120

#
# Settings
#

IMPLS = js python

step1 = step1_read_print
step2 = step2_eval
step3 = step3_env
step4 = step4_if_fn_do
step5 = step5_tco
step6 = step6_file
step7 = step7_interop
step8 = step8_macros
step9 = step9_try
stepA = stepA_miniMAL

#
# Utility functions
#

STEP_TEST_FILES = $(strip $(wildcard $(1)/tests/$($(2)).json) $(wildcard tests/$($(2)).json))

js_STEP_TO_PROG =      js/$($(1)).js
python_STEP_TO_PROG =  python/$($(1)).py

js_RUNSTEP =      node ../$(2) $(3)
python_RUNSTEP =  $(PYTHON) ../$(2) $(3)

# Derived lists
STEPS = $(sort $(filter step%,$(.VARIABLES)))
DO_IMPLS = $(filter-out $(SKIP_IMPLS),$(IMPLS))
IMPL_TESTS = $(foreach impl,$(DO_IMPLS),test^$(impl))
STEP_TESTS = $(foreach step,$(STEPS),test^$(step))
ALL_TESTS = $(filter-out $(EXCLUDE_TESTS),\
              $(strip $(sort \
                $(foreach impl,$(DO_IMPLS),\
                  $(foreach step,$(STEPS),test^$(impl)^$(step))))))

IMPL_STATS = $(foreach impl,$(DO_IMPLS),stats^$(impl))
IMPL_STATS_LISP = $(foreach impl,$(DO_IMPLS),stats-lisp^$(impl))

#
# Build rules
#

# Build a program in an implementation directory
$(foreach i,$(DO_IMPLS),$(foreach s,$(STEPS),$(call $(i)_STEP_TO_PROG,$(s)))):
	$(MAKE) -C $(dir $(@)) $(notdir $(@))

# Allow test, test^STEP, test^IMPL, and test^IMPL^STEP
.SECONDEXPANSION:
$(IMPL_TESTS): $$(filter $$@^%,$$(ALL_TESTS))

.SECONDEXPANSION:
$(STEP_TESTS): $$(foreach step,$$(subst test^,,$$@),$$(filter %^$$(step),$$(ALL_TESTS)))

.SECONDEXPANSION:
$(ALL_TESTS): $$(call $$(word 2,$$(subst ^, ,$$(@)))_STEP_TO_PROG,$$(word 3,$$(subst ^, ,$$(@))))
	@$(foreach impl,$(word 2,$(subst ^, ,$(@))),\
	  $(foreach step,$(word 3,$(subst ^, ,$(@))),\
	    cd $(if $(filter mal,$(impl)),$(miniMAL_IMPL),$(impl)); \
	    $(foreach test,$(call STEP_TEST_FILES,$(impl),$(step)),\
	      echo '----------------------------------------------'; \
	      echo 'Testing $@, step file: $+, test file: $(test)'; \
	      echo 'Running: ../runtest.py $(TEST_OPTS) $(call $(impl)_TEST_OPTS) ../$(test) -- $(call $(impl)_RUNSTEP,$(step),$(+))'; \
	      ../runtest.py $(TEST_OPTS) $(call $(impl)_TEST_OPTS) ../$(test) -- $(call $(impl)_RUNSTEP,$(step),$(+));)))

test: $(ALL_TESTS)
tests: $(ALL_TESTS)


# Stats rules

stats: $(IMPL_STATS)
stats-lisp: $(IMPL_STATS_LISP)

.SECONDEXPANSION:
$(IMPL_STATS):
	@echo "----------------------------------------------"; \
	$(foreach impl,$(word 2,$(subst ^, ,$(@))),\
	  echo "Stats for $(impl):"; \
	  $(MAKE) --no-print-directory -C $(impl) stats)

.SECONDEXPANSION:
$(IMPL_STATS_LISP):
	@echo "----------------------------------------------"; \
	$(foreach impl,$(word 2,$(subst ^, ,$(@))),\
	  echo "Stats (lisp only) for $(impl):"; \
	  $(MAKE) --no-print-directory -C $(impl) stats-lisp)
