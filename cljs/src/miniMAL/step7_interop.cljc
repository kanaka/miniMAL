(ns miniMAL.step7-interop)

(defn new-env [d & [B E]]
  (let [[b [_ v]] (split-with #(not= "&" %) B)
        [e E] (split-at (count b) E)]
    (atom (merge (js/Object.create d)
                 (zipmap b e)
                 (if v {v E})))))

(defn EVAL [ast env & [sq]]
  (loop [ast ast
         env env]
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
                  (recur a2 env))
          "do" (recur (do (EVAL (-> ast drop-last rest) env 1)
                          (last ast))
                      env)
          "if" (recur (if ({0 1 nil 1 false 1 "" 1} (EVAL a1 env))
                        a3
                        a2)
                      env)
          "fn" (with-meta #(EVAL a2 (new-env @env a1 %&))
                          [a2 env a1])
          "`" a1
          ".-" (let [[o k & [v]] (EVAL (rest ast) env 1)]
                 (if v (aset o k v) (aget o k)))
          "." (let [[o & el] (EVAL (rest ast) env 1)]
                (apply (get o (first el)) (rest el)))
          (let [[f & el] (EVAL ast env 1)
                [ast env p] (meta f)]
            (if ast
              (recur ast (new-env @env p el))
              (apply f el)))))

      :else
      ast)))

(def E
  (new-env
    (merge
      ;; Formatted like this for easy sed'ing
      #?(:org.babashka/nbb
         (into {} (for [[k v] (ns-map *ns*)]
                    [(str k) (if (var? v) @v)])) #_nbb-end
         :cljs
         (into {} (for [[k v] (js->clj cljs.core)]
                    [(demunge k) v]))) #_cljs-end
      {"map" (comp doall map)
       "read" #(js/JSON.parse %)
       "eval" #(EVAL % E)
       "pr*" #(js/JSON.stringify % (fn [k v] (if (fn? v) nil (clj->js v))))
       "slurp" #(.readFileSync (js/require "fs") % "utf8")
       ;;"load" #(EVAL (js/JSON.parse ((@E "slurp") %)) E)
       "js" js/eval})))

(defn -main [& args]
  (swap! E assoc "argv" (clj->js (rest args)))
  (if args
    (EVAL (js/JSON.parse ((@E "slurp") (first args))) E)
    (.start
      (js/require "repl")
      #js {:eval #(%4 0 (try (EVAL (js/JSON.parse %1) E) (catch :default e (prn e))))
           :writer (@E "pr*")}))
  nil)
