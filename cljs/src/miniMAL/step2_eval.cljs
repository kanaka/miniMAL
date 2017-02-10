(ns miniMAL.step2-eval)

(declare EVAL)

(defn eval-ast [ast env]
  (cond (array? ast) (map #(EVAL % env) ast)
        (and (string? ast) (contains? env ast)) (get env ast)
        (string? ast) (throw (str ast " not found"))
        :else ast))

(defn EVAL [ast env]
  (if (not (array? ast))
    (eval-ast ast env)
    (let [[f & el] (eval-ast ast env)]
      (apply f el))))

(def E {"+" + "-" - "*" * "/" /})

(defn -main [& args]
  (let [efn #(%4 nil (js/JSON.stringify (EVAL (js/JSON.parse %1) E)))]
    (.start
      (js/require "repl")
      (clj->js {:eval efn :writer identity :terminal false}))))
