(ns miniMAL.step4-if-fn-do
  (:require [clojure.string :refer [replace]]))

(defn new-env [& [d B E]]
  (atom (loop [d (js/Object.create d)
               B B
               E E]
          (let [[b & B'] B
                [e & E'] E]
            (condp = b
              nil d
              "&" (assoc d (nth B 1) E)
              (recur (assoc d b e) B' E'))))))

(declare EVAL)
(defn eval-ast [ast env]
  (cond (or (array? ast) (seq? ast)) (doall (map #(EVAL % env) ast))
        (and (string? ast) (contains? @env ast)) (get @env ast)
        (string? ast) (throw (str ast " not found"))
        :else ast))

(defn EVAL [ast env]
  ;(prn :EVAL :ast ast)
  (if (not (or (array? ast) (seq? ast)))
    (eval-ast ast env)
    (let [[a0 a1 a2 a3] ast]
      (condp = a0
        "def" (let [x (EVAL a2 env)] (swap! env assoc a1 x) x)
        "let" (let [env (new-env @env)]
                (doseq [[s v] (partition 2 a1)]
                  (swap! env assoc s (EVAL v env)))
                (EVAL a2 env))
        "do" (last (eval-ast (rest ast) env))
        "if" (if (contains? #{0 nil false ""} (EVAL a1 env))
               (EVAL a3 env)
               (EVAL a2 env))
        "fn" #(EVAL a2 (new-env @env a1 %&))
        (let [[f & el] (eval-ast ast env)]
          (apply f el))))))

(def E (new-env
         (merge (into {} (for [[k v] (js->clj cljs.core)]
                           [(demunge k) v]))
                {"list" array
                 "print" #(js/JSON.stringify
                            % (fn [k v] (cond (fn? v) nil
                                              (seq? v) (apply array v)
                                              :else v)))
                 })))

(defn -main [& args]
  (let [efn #(%4 nil ((@E "print") (EVAL (js/JSON.parse %1) E)))]
    (.start
      (js/require "repl")
      (clj->js {:eval efn :writer identity :terminal 0}))))
