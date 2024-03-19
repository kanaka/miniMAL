(ns miniMAL.step4-if-fn-do)

(defn new-env [d & [B E]]
  (let [[b [_ v]] (split-with #(not= "&" %) B)
        [e E] (split-at (count b) E)]
    (atom (merge (js/Object.create d)
                 (zipmap b e)
                 (if v {v E})))))

(defn EVAL [ast env & [sq]]
    ;;(prn :EVAL :ast ast :sq sq)
    (cond
      sq
      (doall (map #(EVAL % env) ast))

      (and (string? ast) (contains? @env ast))
      (@env ast)

      (string? ast)
      (throw (str ast " not found"))

      (or (array? ast) (sequential? ast))
      (let [[a0 a1 a2 a3] ast]
        (condp = a0
          "def" (let [x (EVAL a2 env)]
                  (swap! env assoc a1 x) x)
          "let" (let [env (new-env @env)]
                  (doseq [[s v] (partition 2 a1)]
                    (swap! env assoc s (EVAL v env)))
                  (EVAL a2 env))
          "do" (last (EVAL (rest ast) env 1))
          "if" (if ({0 1 nil 1 false 1 "" 1} (EVAL a1 env))
                 (EVAL a3 env)
                 (EVAL a2 env))
          "fn" #(EVAL a2 (new-env @env a1 %&))
          (let [[f & el] (EVAL ast env 1)]
            (apply f el))))

      :else
      ast))

(def E
  (new-env
    (merge
      {"=" =
       "<" <
       "+" +
       "-" -
       "*" *
       "/" /
       "list" list
       })))

(defn -main [& args]
  (.start
    (js/require "repl")
    #js {:eval #(%4 0 (try (EVAL (js/JSON.parse %1) E) (catch :default e (prn e))))
              :writer #(js/JSON.stringify % (fn [k v] (if (fn? v) nil (clj->js v))))})
  nil)
