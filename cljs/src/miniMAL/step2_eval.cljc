(ns miniMAL.step2-eval)

(defn EVAL [ast env & [sq]]
    ;;(prn :EVAL :ast ast :sq sq)
    (cond
      sq
      (map #(EVAL % env) ast)

      (and (string? ast) (contains? env ast))
      (env ast)

      (string? ast)
      (throw (str ast " not found"))

      (sequential? ast)
      (let [[f & el] (EVAL ast env 1)]
        (apply f el))

      :else
      ast))

(def E
  {"+" +
   "-" -
   "*" *
   "/" /
   })

(defn -main [& args]
  (.start
    (js/require "repl")
    (clj->js {:eval #(%4 0 (EVAL (js->clj (js/JSON.parse %1)) E))
              :writer #(js/JSON.stringify (clj->js %))}))
  nil)
