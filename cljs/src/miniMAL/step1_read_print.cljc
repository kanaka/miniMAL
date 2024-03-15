(ns miniMAL.step1-read-print)

(defn EVAL [ast env]
    ast)

(defn -main [& args]
  (.start
    (js/require "repl")
    (clj->js {:eval #(%4 0 (EVAL (js->clj (js/JSON.parse %1)) {}))
              :writer #(js/JSON.stringify (clj->js %))}))
  nil)
