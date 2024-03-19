(ns miniMAL.step0-repl)

(defn -main [& args]
  (.start
    (js/require "repl")
    (clj->js {:eval #(%4 0 (.trim %1))
              :writer identity}))
  nil)
