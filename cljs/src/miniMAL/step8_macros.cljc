(ns miniMAL.step8-macros
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
  (loop [ast ast
         env env]
    ;(prn :EVAL :ast ast)
    (if (not (or (array? ast) (seq? ast)))
      (eval-ast ast env)
      ;; inlined macroexpand
      (let [ast (loop [ast ast]
                  (if (and (or (array? ast) (seq? ast))
                           (:M (meta (get @env (first ast)))))
                    (recur (apply (get @env (first ast)) (rest ast)))
                    ast))]
        (if (not (or (array? ast) (seq? ast)))
          (eval-ast ast env)
          (let [[a0 a1 a2 a3] ast]
            (condp = a0
              "def" (let [x (EVAL a2 env)] (swap! env assoc a1 x) x)
              "~" (with-meta (EVAL a1 env) {:M true})
              "let" (let [env (new-env @env)]
                      (doseq [[s v] (partition 2 a1)]
                        (swap! env assoc s (EVAL v env)))
                      (recur a2 env))
              "`" a1
              ".-" (let [[o k & [v]] (eval-ast (rest ast) env)]
                     (if v (aset o k v) (aget o k)))
              "." (let [[o & el] (eval-ast (rest ast) env)]
                    (apply (get o (first el)) (rest el)))
              "do" (do (eval-ast (->> ast drop-last rest) env)
                       (recur (last ast) env))
              "if" (if (contains? #{0 nil false ""} (EVAL a1 env))
                     (recur a3 env)
                     (recur a2 env))
              "fn" (with-meta #(EVAL a2 (new-env @env a1 %&))
                              [a2 env a1])
              (let [[f & el] (eval-ast ast env)
                    [ast env p] (meta f)]
                (if ast
                  (recur ast (new-env @env p el))
                  (apply f el))))))))))

(def E (new-env
         (merge (into {} (for [[k v] (js->clj cljs.core)]
                           [(demunge k) v]))
                {"js" js/eval
                 "eval" #(EVAL %1 E)

                 "list" array

                 "read" #(js/JSON.parse %)
                 "print" #(js/JSON.stringify
                            % (fn [k v] (cond (fn? v) nil
                                              (seq? v) (apply array v)
                                              :else v)))
                 "slurp" #(.readFileSync (js/require "fs") % "utf8")
                 "load" #(EVAL (js/JSON.parse ((@E "slurp") %)) E)})))

(defn -main [& args]
  (swap! E assoc "ARGS" (apply array (rest args)))
  (if args
    ((@E "load") (first args))
    (let [efn #(%4 nil ((@E "print") (EVAL (js/JSON.parse %1) E)))]
      (.start
        (js/require "repl")
        (clj->js {:eval efn :writer identity :terminal 0})))))
