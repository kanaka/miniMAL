(ns miniMAL.step3-env)

(defn new-env [& [d B E]]
  (atom (js/Object.create d)))

(defn EVAL [ast env & [sq]]
    ;;(prn :EVAL :ast ast :sq sq)
    (cond
      sq
      (map #(EVAL % env) ast)

      (and (string? ast) (contains? @env ast))
      (@env ast)

      (string? ast)
      (throw (str ast " not found"))

      (sequential? ast)
      (let [[a0 a1 a2 a3] ast]
        (condp = a0
          "def" (let [x (EVAL a2 env)]
                  (swap! env assoc a1 x) x)
          "let" (let [env (new-env @env)]
                  (doseq [[s v] (partition 2 a1)]
                    (swap! env assoc s (EVAL v env)))
                  (EVAL a2 env))
          (let [[f & el] (EVAL ast env 1)]
            (apply f el))))

      :else
      ast))

(def E
  (new-env
    {"+" +
     "-" -
     "*" *
     "/" /
     }))

(defn -main [& args]
  (.start
    (js/require "repl")
    (clj->js {:eval #(%4 0 (EVAL (js->clj (js/JSON.parse %1)) E))
              :writer #(js/JSON.stringify (clj->js %))}))
  nil)
