(ns miniMAL.step3-env)

(defn new-env [& [data binds exprs]]
  (atom (.create js/Object data)))

(declare EVAL)
(defn eval-ast [ast env]
  (cond (or (array? ast) (seq? ast)) (map #(EVAL % env) ast)
        (and (string? ast) (contains? @env ast)) (get @env ast)
        (string? ast) (throw (str ast " not found"))
        :else ast))

(defn EVAL [ast env]
  (if (not (array? ast))
    (eval-ast ast env)
    (let [[a0 a1 a2 a3] ast]
      (condp = a0
        "def" (let [e (EVAL a2 env)] (swap! env assoc a1 e) e)
        "let" (let [env (new-env @env)]
                (doseq [[b e] (partition 2 a1)]
                  (swap! env assoc b (EVAL e env)))
                (EVAL a2 env))
        (let [[f & el] (eval-ast ast env)]
          (apply f el))))))

(def E (new-env {"+" + "-" - "*" * "/" /}))

(defn -main [& args]
  (let [efn #(%4 nil (js/JSON.stringify (EVAL (js/JSON.parse %1) E)))]
    (.start
      (js/require "repl")
      (clj->js {:eval efn :writer identity :terminal false}))))
