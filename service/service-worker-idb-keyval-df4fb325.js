define("./service-worker-idb-keyval-df4fb325.js", ["exports"], (function(e) {
    "use strict";
    class t {
        constructor(e="keyval-store", t="keyval") {
            this.storeName = t,
            this._dbp = new Promise((r,o)=>{
                const n = indexedDB.open(e, 1);
                n.onerror = ()=>o(n.error),
                n.onsuccess = ()=>r(n.result),
                n.onupgradeneeded = ()=>{
                    n.result.createObjectStore(t)
                }
            }
            )
        }
        _withIDBStore(e, t) {
            return this._dbp.then(r=>new Promise((o,n)=>{
                const s = r.transaction(this.storeName, e);
                s.oncomplete = ()=>o(),
                s.onabort = s.onerror = ()=>n(s.error),
                t(s.objectStore(this.storeName))
            }
            ))
        }
    }
    let r;
    function o() {
        return r || (r = new t),
        r
    }
    e.get = function(e, t=o()) {
        let r;
        return t._withIDBStore("readonly", t=>{
            r = t.get(e)
        }
        ).then(()=>r.result)
    }
    ,
    e.set = function(e, t, r=o()) {
        return r._withIDBStore("readwrite", r=>{
            r.put(t, e)
        }
        )
    }
}
));
//# sourceMappingURL=service-worker-idb-keyval-df4fb325.js.map
