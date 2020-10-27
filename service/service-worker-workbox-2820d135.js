define("./service-worker-workbox-2820d135.js", ["exports"], (function(e) {
    "use strict";
    try {
        self["workbox:core:5.1.3"] && _()
    } catch (e) {}
    const t = (e,...t)=>{
        let s = e;
        return t.length > 0 && (s += ` :: ${JSON.stringify(t)}`),
        s
    }
    ;
    class s extends Error {
        constructor(e, s) {
            super(t(e, s)),
            this.name = e,
            this.details = s
        }
    }
    const n = e=>new URL(String(e),location.href).href.replace(new RegExp(`^${location.origin}`), "");
    class a {
        constructor(e, t, {onupgradeneeded: s, onversionchange: n}={}) {
            this._db = null,
            this._name = e,
            this._version = t,
            this._onupgradeneeded = s,
            this._onversionchange = n || (()=>this.close())
        }
        get db() {
            return this._db
        }
        async open() {
            if (!this._db)
                return this._db = await new Promise((e,t)=>{
                    let s = !1;
                    setTimeout(()=>{
                        s = !0,
                        t(new Error("The open request was blocked and timed out"))
                    }
                    , this.OPEN_TIMEOUT);
                    const n = indexedDB.open(this._name, this._version);
                    n.onerror = ()=>t(n.error),
                    n.onupgradeneeded = e=>{
                        s ? (n.transaction.abort(),
                        n.result.close()) : "function" == typeof this._onupgradeneeded && this._onupgradeneeded(e)
                    }
                    ,
                    n.onsuccess = ()=>{
                        const t = n.result;
                        s ? t.close() : (t.onversionchange = this._onversionchange.bind(this),
                        e(t))
                    }
                }
                ),
                this
        }
        async getKey(e, t) {
            return (await this.getAllKeys(e, t, 1))[0]
        }
        async getAll(e, t, s) {
            return await this.getAllMatching(e, {
                query: t,
                count: s
            })
        }
        async getAllKeys(e, t, s) {
            return (await this.getAllMatching(e, {
                query: t,
                count: s,
                includeKeys: !0
            })).map(e=>e.key)
        }
        async getAllMatching(e, {index: t, query: s=null, direction: n="next", count: a, includeKeys: r=!1}={}) {
            return await this.transaction([e], "readonly", (i,c)=>{
                const o = i.objectStore(e)
                  , h = t ? o.index(t) : o
                  , u = []
                  , l = h.openCursor(s, n);
                l.onsuccess = ()=>{
                    const e = l.result;
                    e ? (u.push(r ? e : e.value),
                    a && u.length >= a ? c(u) : e.continue()) : c(u)
                }
            }
            )
        }
        async transaction(e, t, s) {
            return await this.open(),
            await new Promise((n,a)=>{
                const r = this._db.transaction(e, t);
                r.onabort = ()=>a(r.error),
                r.oncomplete = ()=>n(),
                s(r, e=>n(e))
            }
            )
        }
        async _call(e, t, s, ...n) {
            return await this.transaction([t], s, (s,a)=>{
                const r = s.objectStore(t)
                  , i = r[e].apply(r, n);
                i.onsuccess = ()=>a(i.result)
            }
            )
        }
        close() {
            this._db && (this._db.close(),
            this._db = null)
        }
    }
    a.prototype.OPEN_TIMEOUT = 2e3;
    const r = {
        readonly: ["get", "count", "getKey", "getAll", "getAllKeys"],
        readwrite: ["add", "put", "clear", "delete"]
    };
    for (const [e,t] of Object.entries(r))
        for (const s of t)
            s in IDBObjectStore.prototype && (a.prototype[s] = async function(t, ...n) {
                return await this._call(s, t, e, ...n)
            }
            );
    try {
        self["workbox:background-sync:5.1.3"] && _()
    } catch (e) {}
    class i {
        constructor(e) {
            this._queueName = e,
            this._db = new a("workbox-background-sync",3,{
                onupgradeneeded: this._upgradeDb
            })
        }
        async pushEntry(e) {
            delete e.id,
            e.queueName = this._queueName,
            await this._db.add("requests", e)
        }
        async unshiftEntry(e) {
            const [t] = await this._db.getAllMatching("requests", {
                count: 1
            });
            t ? e.id = t.id - 1 : delete e.id,
            e.queueName = this._queueName,
            await this._db.add("requests", e)
        }
        async popEntry() {
            return this._removeEntry({
                direction: "prev"
            })
        }
        async shiftEntry() {
            return this._removeEntry({
                direction: "next"
            })
        }
        async getAll() {
            return await this._db.getAllMatching("requests", {
                index: "queueName",
                query: IDBKeyRange.only(this._queueName)
            })
        }
        async deleteEntry(e) {
            await this._db.delete("requests", e)
        }
        async _removeEntry({direction: e}) {
            const [t] = await this._db.getAllMatching("requests", {
                direction: e,
                index: "queueName",
                query: IDBKeyRange.only(this._queueName),
                count: 1
            });
            if (t)
                return await this.deleteEntry(t.id),
                t
        }
        _upgradeDb(e) {
            const t = e.target.result;
            e.oldVersion > 0 && e.oldVersion < 3 && t.objectStoreNames.contains("requests") && t.deleteObjectStore("requests"),
            t.createObjectStore("requests", {
                autoIncrement: !0,
                keyPath: "id"
            }).createIndex("queueName", "queueName", {
                unique: !1
            })
        }
    }
    const c = ["method", "referrer", "referrerPolicy", "mode", "credentials", "cache", "redirect", "integrity", "keepalive"];
    class o {
        constructor(e) {
            "navigate" === e.mode && (e.mode = "same-origin"),
            this._requestData = e
        }
        static async fromRequest(e) {
            const t = {
                url: e.url,
                headers: {}
            };
            "GET" !== e.method && (t.body = await e.clone().arrayBuffer());
            for (const [s,n] of e.headers.entries())
                t.headers[s] = n;
            for (const s of c)
                void 0 !== e[s] && (t[s] = e[s]);
            return new o(t)
        }
        toObject() {
            const e = Object.assign({}, this._requestData);
            return e.headers = Object.assign({}, this._requestData.headers),
            e.body && (e.body = e.body.slice(0)),
            e
        }
        toRequest() {
            return new Request(this._requestData.url,this._requestData)
        }
        clone() {
            return new o(this.toObject())
        }
    }
    const h = new Set
      , u = e=>{
        const t = {
            request: new o(e.requestData).toRequest(),
            timestamp: e.timestamp
        };
        return e.metadata && (t.metadata = e.metadata),
        t
    }
    ;
    class l {
        constructor(e, {onSync: t, maxRetentionTime: n}={}) {
            if (this._syncInProgress = !1,
            this._requestsAddedDuringSync = !1,
            h.has(e))
                throw new s("duplicate-queue-name",{
                    name: e
                });
            h.add(e),
            this._name = e,
            this._onSync = t || this.replayRequests,
            this._maxRetentionTime = n || 10080,
            this._queueStore = new i(this._name),
            this._addSyncListener()
        }
        get name() {
            return this._name
        }
        async pushRequest(e) {
            await this._addRequest(e, "push")
        }
        async unshiftRequest(e) {
            await this._addRequest(e, "unshift")
        }
        async popRequest() {
            return this._removeRequest("pop")
        }
        async shiftRequest() {
            return this._removeRequest("shift")
        }
        async getAll() {
            const e = await this._queueStore.getAll()
              , t = Date.now()
              , s = [];
            for (const n of e) {
                const e = 60 * this._maxRetentionTime * 1e3;
                t - n.timestamp > e ? await this._queueStore.deleteEntry(n.id) : s.push(u(n))
            }
            return s
        }
        async _addRequest({request: e, metadata: t, timestamp: s=Date.now()}, n) {
            const a = {
                requestData: (await o.fromRequest(e.clone())).toObject(),
                timestamp: s
            };
            t && (a.metadata = t),
            await this._queueStore[`${n}Entry`](a),
            this._syncInProgress ? this._requestsAddedDuringSync = !0 : await this.registerSync()
        }
        async _removeRequest(e) {
            const t = Date.now()
              , s = await this._queueStore[`${e}Entry`]();
            if (s) {
                const n = 60 * this._maxRetentionTime * 1e3;
                return t - s.timestamp > n ? this._removeRequest(e) : u(s)
            }
        }
        async replayRequests() {
            let e;
            for (; e = await this.shiftRequest(); )
                try {
                    await fetch(e.request.clone())
                } catch (t) {
                    throw await this.unshiftRequest(e),
                    new s("queue-replay-failed",{
                        name: this._name
                    })
                }
        }
        async registerSync() {
            if ("sync"in self.registration)
                try {
                    await self.registration.sync.register(`workbox-background-sync:${this._name}`)
                } catch (e) {}
        }
        _addSyncListener() {
            "sync"in self.registration ? self.addEventListener("sync", e=>{
                if (e.tag === `workbox-background-sync:${this._name}`) {
                    const t = async()=>{
                        let t;
                        this._syncInProgress = !0;
                        try {
                            await this._onSync({
                                queue: this
                            })
                        } catch (e) {
                            throw t = e,
                            t
                        } finally {
                            !this._requestsAddedDuringSync || t && !e.lastChance || await this.registerSync(),
                            this._syncInProgress = !1,
                            this._requestsAddedDuringSync = !1
                        }
                    }
                    ;
                    e.waitUntil(t())
                }
            }
            ) : this._onSync({
                queue: this
            })
        }
        static get _queueNames() {
            return h
        }
    }
    class d {
        constructor(e, t) {
            this.fetchDidFail = async({request: e})=>{
                await this._queue.pushRequest({
                    request: e
                })
            }
            ,
            this._queue = new l(e,t)
        }
    }
    const p = {
        googleAnalytics: "googleAnalytics",
        precache: "precache-v2",
        prefix: "workbox",
        runtime: "runtime",
        suffix: "undefined" != typeof registration ? registration.scope : ""
    }
      , m = e=>[p.prefix, e, p.suffix].filter(e=>e && e.length > 0).join("-")
      , f = e=>e || m(p.googleAnalytics)
      , g = e=>e || m(p.precache)
      , w = ()=>p.prefix
      , y = e=>e || m(p.runtime)
      , q = ()=>p.suffix;
    try {
        self["workbox:routing:5.1.3"] && _()
    } catch (e) {}
    const R = e=>e && "object" == typeof e ? e : {
        handle: e
    };
    class v {
        constructor(e, t, s="GET") {
            this.handler = R(t),
            this.match = e,
            this.method = s
        }
    }
    class x {
        constructor() {
            this._routes = new Map
        }
        get routes() {
            return this._routes
        }
        addFetchListener() {
            self.addEventListener("fetch", e=>{
                const {request: t} = e
                  , s = this.handleRequest({
                    request: t,
                    event: e
                });
                s && e.respondWith(s)
            }
            )
        }
        addCacheListener() {
            self.addEventListener("message", e=>{
                if (e.data && "CACHE_URLS" === e.data.type) {
                    const {payload: t} = e.data
                      , s = Promise.all(t.urlsToCache.map(e=>{
                        "string" == typeof e && (e = [e]);
                        const t = new Request(...e);
                        return this.handleRequest({
                            request: t
                        })
                    }
                    ));
                    e.waitUntil(s),
                    e.ports && e.ports[0] && s.then(()=>e.ports[0].postMessage(!0))
                }
            }
            )
        }
        handleRequest({request: e, event: t}) {
            const s = new URL(e.url,location.href);
            if (!s.protocol.startsWith("http"))
                return;
            const {params: n, route: a} = this.findMatchingRoute({
                url: s,
                request: e,
                event: t
            });
            let r, i = a && a.handler;
            if (!i && this._defaultHandler && (i = this._defaultHandler),
            i) {
                try {
                    r = i.handle({
                        url: s,
                        request: e,
                        event: t,
                        params: n
                    })
                } catch (e) {
                    r = Promise.reject(e)
                }
                return r instanceof Promise && this._catchHandler && (r = r.catch(n=>this._catchHandler.handle({
                    url: s,
                    request: e,
                    event: t
                }))),
                r
            }
        }
        findMatchingRoute({url: e, request: t, event: s}) {
            const n = this._routes.get(t.method) || [];
            for (const a of n) {
                let n;
                const r = a.match({
                    url: e,
                    request: t,
                    event: s
                });
                if (r)
                    return n = r,
                    (Array.isArray(r) && 0 === r.length || r.constructor === Object && 0 === Object.keys(r).length || "boolean" == typeof r) && (n = void 0),
                    {
                        route: a,
                        params: n
                    }
            }
            return {}
        }
        setDefaultHandler(e) {
            this._defaultHandler = R(e)
        }
        setCatchHandler(e) {
            this._catchHandler = R(e)
        }
        registerRoute(e) {
            this._routes.has(e.method) || this._routes.set(e.method, []),
            this._routes.get(e.method).push(e)
        }
        unregisterRoute(e) {
            if (!this._routes.has(e.method))
                throw new s("unregister-route-but-not-found-with-method",{
                    method: e.method
                });
            const t = this._routes.get(e.method).indexOf(e);
            if (!(t > -1))
                throw new s("unregister-route-route-not-registered");
            this._routes.get(e.method).splice(t, 1)
        }
    }
    const b = new Set;
    const N = (e,t)=>e.filter(e=>t in e)
      , T = async({request: e, mode: t, plugins: s=[]})=>{
        const n = N(s, "cacheKeyWillBeUsed");
        let a = e;
        for (const e of n)
            a = await e.cacheKeyWillBeUsed.call(e, {
                mode: t,
                request: a
            }),
            "string" == typeof a && (a = new Request(a));
        return a
    }
      , U = async({cacheName: e, request: t, event: s, matchOptions: n, plugins: a=[]})=>{
        const r = await self.caches.open(e)
          , i = await T({
            plugins: a,
            request: t,
            mode: "read"
        });
        let c = await r.match(i, n);
        for (const t of a)
            if ("cachedResponseWillBeUsed"in t) {
                const a = t.cachedResponseWillBeUsed;
                c = await a.call(t, {
                    cacheName: e,
                    event: s,
                    matchOptions: n,
                    cachedResponse: c,
                    request: i
                })
            }
        return c
    }
      , E = async({cacheName: e, request: t, response: a, event: r, plugins: i=[], matchOptions: c})=>{
        const o = await T({
            plugins: i,
            request: t,
            mode: "write"
        });
        if (!a)
            throw new s("cache-put-with-no-response",{
                url: n(o.url)
            });
        const h = await (async({request: e, response: t, event: s, plugins: n=[]})=>{
            let a = t
              , r = !1;
            for (const t of n)
                if ("cacheWillUpdate"in t) {
                    r = !0;
                    const n = t.cacheWillUpdate;
                    if (a = await n.call(t, {
                        request: e,
                        response: a,
                        event: s
                    }),
                    !a)
                        break
                }
            return r || (a = a && 200 === a.status ? a : void 0),
            a || null
        }
        )({
            event: r,
            plugins: i,
            response: a,
            request: o
        });
        if (!h)
            return;
        const u = await self.caches.open(e)
          , l = N(i, "cacheDidUpdate")
          , d = l.length > 0 ? await U({
            cacheName: e,
            matchOptions: c,
            request: o
        }) : null;
        try {
            await u.put(o, h)
        } catch (e) {
            throw "QuotaExceededError" === e.name && await async function() {
                for (const e of b)
                    await e()
            }(),
            e
        }
        for (const t of l)
            await t.cacheDidUpdate.call(t, {
                cacheName: e,
                event: r,
                oldResponse: d,
                newResponse: h,
                request: o
            })
    }
      , O = U
      , S = async({request: e, fetchOptions: t, event: n, plugins: a=[]})=>{
        if ("string" == typeof e && (e = new Request(e)),
        n instanceof FetchEvent && n.preloadResponse) {
            const e = await n.preloadResponse;
            if (e)
                return e
        }
        const r = N(a, "fetchDidFail")
          , i = r.length > 0 ? e.clone() : null;
        try {
            for (const t of a)
                if ("requestWillFetch"in t) {
                    const s = t.requestWillFetch
                      , a = e.clone();
                    e = await s.call(t, {
                        request: a,
                        event: n
                    })
                }
        } catch (e) {
            throw new s("plugin-error-request-will-fetch",{
                thrownError: e
            })
        }
        const c = e.clone();
        try {
            let s;
            s = "navigate" === e.mode ? await fetch(e) : await fetch(e, t);
            for (const e of a)
                "fetchDidSucceed"in e && (s = await e.fetchDidSucceed.call(e, {
                    event: n,
                    request: c,
                    response: s
                }));
            return s
        } catch (e) {
            for (const t of r)
                await t.fetchDidFail.call(t, {
                    error: e,
                    event: n,
                    originalRequest: i.clone(),
                    request: c.clone()
                });
            throw e
        }
    }
    ;
    try {
        self["workbox:strategies:5.1.3"] && _()
    } catch (e) {}
    const L = {
        cacheWillUpdate: async({response: e})=>200 === e.status || 0 === e.status ? e : null
    };
    class k {
        constructor(e={}) {
            if (this._cacheName = y(e.cacheName),
            e.plugins) {
                const t = e.plugins.some(e=>!!e.cacheWillUpdate);
                this._plugins = t ? e.plugins : [L, ...e.plugins]
            } else
                this._plugins = [L];
            this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0,
            this._fetchOptions = e.fetchOptions,
            this._matchOptions = e.matchOptions
        }
        async handle({event: e, request: t}) {
            const n = [];
            "string" == typeof t && (t = new Request(t));
            const a = [];
            let r;
            if (this._networkTimeoutSeconds) {
                const {id: s, promise: i} = this._getTimeoutPromise({
                    request: t,
                    event: e,
                    logs: n
                });
                r = s,
                a.push(i)
            }
            const i = this._getNetworkPromise({
                timeoutId: r,
                request: t,
                event: e,
                logs: n
            });
            a.push(i);
            let c = await Promise.race(a);
            if (c || (c = await i),
            !c)
                throw new s("no-response",{
                    url: t.url
                });
            return c
        }
        _getTimeoutPromise({request: e, logs: t, event: s}) {
            let n;
            return {
                promise: new Promise(t=>{
                    n = setTimeout(async()=>{
                        t(await this._respondFromCache({
                            request: e,
                            event: s
                        }))
                    }
                    , 1e3 * this._networkTimeoutSeconds)
                }
                ),
                id: n
            }
        }
        async _getNetworkPromise({timeoutId: e, request: t, logs: s, event: n}) {
            let a, r;
            try {
                r = await S({
                    request: t,
                    event: n,
                    fetchOptions: this._fetchOptions,
                    plugins: this._plugins
                })
            } catch (e) {
                a = e
            }
            if (e && clearTimeout(e),
            a || !r)
                r = await this._respondFromCache({
                    request: t,
                    event: n
                });
            else {
                const e = r.clone()
                  , s = E({
                    cacheName: this._cacheName,
                    request: t,
                    response: e,
                    event: n,
                    plugins: this._plugins
                });
                if (n)
                    try {
                        n.waitUntil(s)
                    } catch (e) {}
            }
            return r
        }
        _respondFromCache({event: e, request: t}) {
            return O({
                cacheName: this._cacheName,
                request: t,
                event: e,
                matchOptions: this._matchOptions,
                plugins: this._plugins
            })
        }
    }
    class C {
        constructor(e={}) {
            this._plugins = e.plugins || [],
            this._fetchOptions = e.fetchOptions
        }
        async handle({event: e, request: t}) {
            let n, a;
            "string" == typeof t && (t = new Request(t));
            try {
                a = await S({
                    request: t,
                    event: e,
                    fetchOptions: this._fetchOptions,
                    plugins: this._plugins
                })
            } catch (e) {
                n = e
            }
            if (!a)
                throw new s("no-response",{
                    url: t.url,
                    error: n
                });
            return a
        }
    }
    try {
        self["workbox:google-analytics:5.1.3"] && _()
    } catch (e) {}
    const D = /^\/(\w+\/)?collect/
      , K = e=>{
        const t = ({url: e})=>"www.google-analytics.com" === e.hostname && D.test(e.pathname)
          , s = new C({
            plugins: [e]
        });
        return [new v(t,s,"GET"), new v(t,s,"POST")]
    }
      , A = e=>{
        const t = new k({
            cacheName: e
        });
        return new v(({url: e})=>"www.google-analytics.com" === e.hostname && "/analytics.js" === e.pathname,t,"GET")
    }
      , P = e=>{
        const t = new k({
            cacheName: e
        });
        return new v(({url: e})=>"www.googletagmanager.com" === e.hostname && "/gtag/js" === e.pathname,t,"GET")
    }
      , M = e=>{
        const t = new k({
            cacheName: e
        });
        return new v(({url: e})=>"www.googletagmanager.com" === e.hostname && "/gtm.js" === e.pathname,t,"GET")
    }
    ;
    class I extends v {
        constructor(e, t, s) {
            super(({url: t})=>{
                const s = e.exec(t.href);
                if (s && (t.origin === location.origin || 0 === s.index))
                    return s.slice(1)
            }
            , t, s)
        }
    }
    let j;
    const F = ()=>(j || (j = new x,
    j.addFetchListener(),
    j.addCacheListener()),
    j);
    function W(e) {
        e.then(()=>{}
        )
    }
    try {
        self["workbox:expiration:5.1.3"] && _()
    } catch (e) {}
    const H = e=>{
        const t = new URL(e,location.href);
        return t.hash = "",
        t.href
    }
    ;
    class B {
        constructor(e) {
            this._cacheName = e,
            this._db = new a("workbox-expiration",1,{
                onupgradeneeded: e=>this._handleUpgrade(e)
            })
        }
        _handleUpgrade(e) {
            const t = e.target.result.createObjectStore("cache-entries", {
                keyPath: "id"
            });
            t.createIndex("cacheName", "cacheName", {
                unique: !1
            }),
            t.createIndex("timestamp", "timestamp", {
                unique: !1
            }),
            (async e=>{
                await new Promise((t,s)=>{
                    const n = indexedDB.deleteDatabase(e);
                    n.onerror = ()=>{
                        s(n.error)
                    }
                    ,
                    n.onblocked = ()=>{
                        s(new Error("Delete blocked"))
                    }
                    ,
                    n.onsuccess = ()=>{
                        t()
                    }
                }
                )
            }
            )(this._cacheName)
        }
        async setTimestamp(e, t) {
            const s = {
                url: e = H(e),
                timestamp: t,
                cacheName: this._cacheName,
                id: this._getId(e)
            };
            await this._db.put("cache-entries", s)
        }
        async getTimestamp(e) {
            return (await this._db.get("cache-entries", this._getId(e))).timestamp
        }
        async expireEntries(e, t) {
            const s = await this._db.transaction("cache-entries", "readwrite", (s,n)=>{
                const a = s.objectStore("cache-entries").index("timestamp").openCursor(null, "prev")
                  , r = [];
                let i = 0;
                a.onsuccess = ()=>{
                    const s = a.result;
                    if (s) {
                        const n = s.value;
                        n.cacheName === this._cacheName && (e && n.timestamp < e || t && i >= t ? r.push(s.value) : i++),
                        s.continue()
                    } else
                        n(r)
                }
            }
            )
              , n = [];
            for (const e of s)
                await this._db.delete("cache-entries", e.id),
                n.push(e.url);
            return n
        }
        _getId(e) {
            return this._cacheName + "|" + H(e)
        }
    }
    class $ {
        constructor(e, t={}) {
            this._isRunning = !1,
            this._rerunRequested = !1,
            this._maxEntries = t.maxEntries,
            this._maxAgeSeconds = t.maxAgeSeconds,
            this._cacheName = e,
            this._timestampModel = new B(e)
        }
        async expireEntries() {
            if (this._isRunning)
                return void (this._rerunRequested = !0);
            this._isRunning = !0;
            const e = this._maxAgeSeconds ? Date.now() - 1e3 * this._maxAgeSeconds : 0
              , t = await this._timestampModel.expireEntries(e, this._maxEntries)
              , s = await self.caches.open(this._cacheName);
            for (const e of t)
                await s.delete(e);
            this._isRunning = !1,
            this._rerunRequested && (this._rerunRequested = !1,
            W(this.expireEntries()))
        }
        async updateTimestamp(e) {
            await this._timestampModel.setTimestamp(e, Date.now())
        }
        async isURLExpired(e) {
            if (this._maxAgeSeconds) {
                return await this._timestampModel.getTimestamp(e) < Date.now() - 1e3 * this._maxAgeSeconds
            }
            return !1
        }
        async delete() {
            this._rerunRequested = !1,
            await this._timestampModel.expireEntries(1 / 0)
        }
    }
    try {
        self["workbox:precaching:5.1.3"] && _()
    } catch (e) {}
    const G = []
      , V = {
        get: ()=>G,
        add(e) {
            G.push(...e)
        }
    };
    let Q;
    async function z(e, t) {
        const s = e.clone()
          , n = {
            headers: new Headers(s.headers),
            status: s.status,
            statusText: s.statusText
        }
          , a = t ? t(n) : n
          , r = function() {
            if (void 0 === Q) {
                const e = new Response("");
                if ("body"in e)
                    try {
                        new Response(e.body),
                        Q = !0
                    } catch (e) {
                        Q = !1
                    }
                Q = !1
            }
            return Q
        }() ? s.body : await s.blob();
        return new Response(r,a)
    }
    function J(e) {
        if (!e)
            throw new s("add-to-cache-list-unexpected-type",{
                entry: e
            });
        if ("string" == typeof e) {
            const t = new URL(e,location.href);
            return {
                cacheKey: t.href,
                url: t.href
            }
        }
        const {revision: t, url: n} = e;
        if (!n)
            throw new s("add-to-cache-list-unexpected-type",{
                entry: e
            });
        if (!t) {
            const e = new URL(n,location.href);
            return {
                cacheKey: e.href,
                url: e.href
            }
        }
        const a = new URL(n,location.href)
          , r = new URL(n,location.href);
        return a.searchParams.set("__WB_REVISION__", t),
        {
            cacheKey: a.href,
            url: r.href
        }
    }
    class X {
        constructor(e) {
            this._cacheName = g(e),
            this._urlsToCacheKeys = new Map,
            this._urlsToCacheModes = new Map,
            this._cacheKeysToIntegrities = new Map
        }
        addToCacheList(e) {
            const t = [];
            for (const n of e) {
                "string" == typeof n ? t.push(n) : n && void 0 === n.revision && t.push(n.url);
                const {cacheKey: e, url: a} = J(n)
                  , r = "string" != typeof n && n.revision ? "reload" : "default";
                if (this._urlsToCacheKeys.has(a) && this._urlsToCacheKeys.get(a) !== e)
                    throw new s("add-to-cache-list-conflicting-entries",{
                        firstEntry: this._urlsToCacheKeys.get(a),
                        secondEntry: e
                    });
                if ("string" != typeof n && n.integrity) {
                    if (this._cacheKeysToIntegrities.has(e) && this._cacheKeysToIntegrities.get(e) !== n.integrity)
                        throw new s("add-to-cache-list-conflicting-integrities",{
                            url: a
                        });
                    this._cacheKeysToIntegrities.set(e, n.integrity)
                }
                if (this._urlsToCacheKeys.set(a, e),
                this._urlsToCacheModes.set(a, r),
                t.length > 0) {
                    const e = "Workbox is precaching URLs without revision " + `info: ${t.join(", ")}\nThis is generally NOT safe. ` + "Learn more at https://bit.ly/wb-precache";
                    console.warn(e)
                }
            }
        }
        async install({event: e, plugins: t}={}) {
            const s = []
              , n = []
              , a = await self.caches.open(this._cacheName)
              , r = await a.keys()
              , i = new Set(r.map(e=>e.url));
            for (const [e,t] of this._urlsToCacheKeys)
                i.has(t) ? n.push(e) : s.push({
                    cacheKey: t,
                    url: e
                });
            const c = s.map(({cacheKey: s, url: n})=>{
                const a = this._cacheKeysToIntegrities.get(s)
                  , r = this._urlsToCacheModes.get(n);
                return this._addURLToCache({
                    cacheKey: s,
                    cacheMode: r,
                    event: e,
                    integrity: a,
                    plugins: t,
                    url: n
                })
            }
            );
            return await Promise.all(c),
            {
                updatedURLs: s.map(e=>e.url),
                notUpdatedURLs: n
            }
        }
        async activate() {
            const e = await self.caches.open(this._cacheName)
              , t = await e.keys()
              , s = new Set(this._urlsToCacheKeys.values())
              , n = [];
            for (const a of t)
                s.has(a.url) || (await e.delete(a),
                n.push(a.url));
            return {
                deletedURLs: n
            }
        }
        async _addURLToCache({cacheKey: e, url: t, cacheMode: n, event: a, plugins: r, integrity: i}) {
            const c = new Request(t,{
                integrity: i,
                cache: n,
                credentials: "same-origin"
            });
            let o, h = await S({
                event: a,
                plugins: r,
                request: c
            });
            for (const e of r || [])
                "cacheWillUpdate"in e && (o = e);
            if (!(o ? await o.cacheWillUpdate({
                event: a,
                request: c,
                response: h
            }) : h.status < 400))
                throw new s("bad-precaching-response",{
                    url: t,
                    status: h.status
                });
            h.redirected && (h = await z(h)),
            await E({
                event: a,
                plugins: r,
                response: h,
                request: e === t ? c : new Request(e),
                cacheName: this._cacheName,
                matchOptions: {
                    ignoreSearch: !0
                }
            })
        }
        getURLsToCacheKeys() {
            return this._urlsToCacheKeys
        }
        getCachedURLs() {
            return [...this._urlsToCacheKeys.keys()]
        }
        getCacheKeyForURL(e) {
            const t = new URL(e,location.href);
            return this._urlsToCacheKeys.get(t.href)
        }
        async matchPrecache(e) {
            const t = e instanceof Request ? e.url : e
              , s = this.getCacheKeyForURL(t);
            if (s) {
                return (await self.caches.open(this._cacheName)).match(s)
            }
        }
        createHandler(e=!0) {
            return async({request: t})=>{
                try {
                    const e = await this.matchPrecache(t);
                    if (e)
                        return e;
                    throw new s("missing-precache-entry",{
                        cacheName: this._cacheName,
                        url: t instanceof Request ? t.url : t
                    })
                } catch (s) {
                    if (e)
                        return fetch(t);
                    throw s
                }
            }
        }
        createHandlerBoundToURL(e, t=!0) {
            if (!this.getCacheKeyForURL(e))
                throw new s("non-precached-url",{
                    url: e
                });
            const n = this.createHandler(t)
              , a = new Request(e);
            return ()=>n({
                request: a
            })
        }
    }
    let Y;
    const Z = ()=>(Y || (Y = new X),
    Y);
    const ee = (e,t)=>{
        const s = Z().getURLsToCacheKeys();
        for (const n of function*(e, {ignoreURLParametersMatching: t, directoryIndex: s, cleanURLs: n, urlManipulation: a}={}) {
            const r = new URL(e,location.href);
            r.hash = "",
            yield r.href;
            const i = function(e, t=[]) {
                for (const s of [...e.searchParams.keys()])
                    t.some(e=>e.test(s)) && e.searchParams.delete(s);
                return e
            }(r, t);
            if (yield i.href,
            s && i.pathname.endsWith("/")) {
                const e = new URL(i.href);
                e.pathname += s,
                yield e.href
            }
            if (n) {
                const e = new URL(i.href);
                e.pathname += ".html",
                yield e.href
            }
            if (a) {
                const e = a({
                    url: r
                });
                for (const t of e)
                    yield t.href
            }
        }(e, t)) {
            const e = s.get(n);
            if (e)
                return e
        }
    }
    ;
    let te = !1;
    function se(e) {
        te || ((({ignoreURLParametersMatching: e=[/^utm_/], directoryIndex: t="index.html", cleanURLs: s=!0, urlManipulation: n}={})=>{
            const a = g();
            self.addEventListener("fetch", r=>{
                const i = ee(r.request.url, {
                    cleanURLs: s,
                    directoryIndex: t,
                    ignoreURLParametersMatching: e,
                    urlManipulation: n
                });
                if (!i)
                    return;
                let c = self.caches.open(a).then(e=>e.match(i)).then(e=>e || fetch(i));
                r.respondWith(c)
            }
            )
        }
        )(e),
        te = !0)
    }
    const ne = e=>{
        const t = Z()
          , s = V.get();
        e.waitUntil(t.install({
            event: e,
            plugins: s
        }).catch(e=>{
            throw e
        }
        ))
    }
      , ae = e=>{
        const t = Z();
        e.waitUntil(t.activate())
    }
    ;
    const re = {
        get googleAnalytics() {
            return f()
        },
        get precache() {
            return g()
        },
        get prefix() {
            return w()
        },
        get runtime() {
            return y()
        },
        get suffix() {
            return q()
        }
    };
    e.CacheFirst = class {
        constructor(e={}) {
            this._cacheName = y(e.cacheName),
            this._plugins = e.plugins || [],
            this._fetchOptions = e.fetchOptions,
            this._matchOptions = e.matchOptions
        }
        async handle({event: e, request: t}) {
            "string" == typeof t && (t = new Request(t));
            let n, a = await O({
                cacheName: this._cacheName,
                request: t,
                event: e,
                matchOptions: this._matchOptions,
                plugins: this._plugins
            });
            if (!a)
                try {
                    a = await this._getFromNetwork(t, e)
                } catch (e) {
                    n = e
                }
            if (!a)
                throw new s("no-response",{
                    url: t.url,
                    error: n
                });
            return a
        }
        async _getFromNetwork(e, t) {
            const s = await S({
                request: e,
                event: t,
                fetchOptions: this._fetchOptions,
                plugins: this._plugins
            })
              , n = s.clone()
              , a = E({
                cacheName: this._cacheName,
                request: e,
                response: n,
                event: t,
                plugins: this._plugins
            });
            if (t)
                try {
                    t.waitUntil(a)
                } catch (e) {}
            return s
        }
    }
    ,
    e.ExpirationPlugin = class {
        constructor(e={}) {
            var t;
            this.cachedResponseWillBeUsed = async({event: e, request: t, cacheName: s, cachedResponse: n})=>{
                if (!n)
                    return null;
                const a = this._isResponseDateFresh(n)
                  , r = this._getCacheExpiration(s);
                W(r.expireEntries());
                const i = r.updateTimestamp(t.url);
                if (e)
                    try {
                        e.waitUntil(i)
                    } catch (e) {}
                return a ? n : null
            }
            ,
            this.cacheDidUpdate = async({cacheName: e, request: t})=>{
                const s = this._getCacheExpiration(e);
                await s.updateTimestamp(t.url),
                await s.expireEntries()
            }
            ,
            this._config = e,
            this._maxAgeSeconds = e.maxAgeSeconds,
            this._cacheExpirations = new Map,
            e.purgeOnQuotaError && (t = ()=>this.deleteCacheAndMetadata(),
            b.add(t))
        }
        _getCacheExpiration(e) {
            if (e === y())
                throw new s("expire-custom-caches-only");
            let t = this._cacheExpirations.get(e);
            return t || (t = new $(e,this._config),
            this._cacheExpirations.set(e, t)),
            t
        }
        _isResponseDateFresh(e) {
            if (!this._maxAgeSeconds)
                return !0;
            const t = this._getDateHeaderTimestamp(e);
            return null === t || t >= Date.now() - 1e3 * this._maxAgeSeconds
        }
        _getDateHeaderTimestamp(e) {
            if (!e.headers.has("date"))
                return null;
            const t = e.headers.get("date")
              , s = new Date(t).getTime();
            return isNaN(s) ? null : s
        }
        async deleteCacheAndMetadata() {
            for (const [e,t] of this._cacheExpirations)
                await self.caches.delete(e),
                await t.delete();
            this._cacheExpirations = new Map
        }
    }
    ,
    e.NetworkFirst = k,
    e.StaleWhileRevalidate = class {
        constructor(e={}) {
            if (this._cacheName = y(e.cacheName),
            this._plugins = e.plugins || [],
            e.plugins) {
                const t = e.plugins.some(e=>!!e.cacheWillUpdate);
                this._plugins = t ? e.plugins : [L, ...e.plugins]
            } else
                this._plugins = [L];
            this._fetchOptions = e.fetchOptions,
            this._matchOptions = e.matchOptions
        }
        async handle({event: e, request: t}) {
            "string" == typeof t && (t = new Request(t));
            const n = this._getFromNetwork({
                request: t,
                event: e
            });
            let a, r = await O({
                cacheName: this._cacheName,
                request: t,
                event: e,
                matchOptions: this._matchOptions,
                plugins: this._plugins
            });
            if (r) {
                if (e)
                    try {
                        e.waitUntil(n)
                    } catch (a) {}
            } else
                try {
                    r = await n
                } catch (e) {
                    a = e
                }
            if (!r)
                throw new s("no-response",{
                    url: t.url,
                    error: a
                });
            return r
        }
        async _getFromNetwork({request: e, event: t}) {
            const s = await S({
                request: e,
                event: t,
                fetchOptions: this._fetchOptions,
                plugins: this._plugins
            })
              , n = E({
                cacheName: this._cacheName,
                request: e,
                response: s.clone(),
                event: t,
                plugins: this._plugins
            });
            if (t)
                try {
                    t.waitUntil(n)
                } catch (e) {}
            return s
        }
    }
    ,
    e.cacheNames = re,
    e.initialize = (e={})=>{
        const t = f(e.cacheName)
          , s = new d("workbox-google-analytics",{
            maxRetentionTime: 2880,
            onSync: (n = e,
            async({queue: e})=>{
                let t;
                for (; t = await e.shiftRequest(); ) {
                    const {request: s, timestamp: a} = t
                      , r = new URL(s.url);
                    try {
                        const e = "POST" === s.method ? new URLSearchParams(await s.clone().text()) : r.searchParams
                          , t = a - (Number(e.get("qt")) || 0)
                          , i = Date.now() - t;
                        if (e.set("qt", String(i)),
                        n.parameterOverrides)
                            for (const t of Object.keys(n.parameterOverrides)) {
                                const s = n.parameterOverrides[t];
                                e.set(t, s)
                            }
                        "function" == typeof n.hitFilter && n.hitFilter.call(null, e),
                        await fetch(new Request(r.origin + r.pathname,{
                            body: e.toString(),
                            method: "POST",
                            mode: "cors",
                            credentials: "omit",
                            headers: {
                                "Content-Type": "text/plain"
                            }
                        }))
                    } catch (s) {
                        throw await e.unshiftRequest(t),
                        s
                    }
                }
            }
            )
        });
        var n;
        const a = [M(t), A(t), P(t), ...K(s)]
          , r = new x;
        for (const e of a)
            r.registerRoute(e);
        r.addFetchListener()
    }
    ,
    e.matchPrecache = function(e) {
        return Z().matchPrecache(e)
    }
    ,
    e.precacheAndRoute = function(e, t) {
        !function(e) {
            Z().addToCacheList(e),
            e.length > 0 && (self.addEventListener("install", ne),
            self.addEventListener("activate", ae))
        }(e),
        se(t)
    }
    ,
    e.registerRoute = function(e, t, n) {
        let a;
        if ("string" == typeof e) {
            const s = new URL(e,location.href);
            a = new v(({url: e})=>e.href === s.href,t,n)
        } else if (e instanceof RegExp)
            a = new I(e,t,n);
        else if ("function" == typeof e)
            a = new v(e,t,n);
        else {
            if (!(e instanceof v))
                throw new s("unsupported-route-type",{
                    moduleName: "workbox-routing",
                    funcName: "registerRoute",
                    paramName: "capture"
                });
            a = e
        }
        return F().registerRoute(a),
        a
    }
    ,
    e.setCatchHandler = function(e) {
        F().setCatchHandler(e)
    }
}
));
//# sourceMappingURL=service-worker-workbox-2820d135.js.map