(ns miniMAL.step1-read-print)

(defn EVAL [ast env]
  ast)

(defn -main [& args]
  (let [efn #(%4 nil (js/JSON.stringify (EVAL (js/JSON.parse %1) {})))]
    (.start
      (js/require "repl")
      (clj->js {:eval efn :writer identity :terminal false}))))
