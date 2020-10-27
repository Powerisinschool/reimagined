if (!self.define) {
    const e = e=>{
        "require" !== e && (e += ".js");
        let t = Promise.resolve();
        return n[e] || (t = new Promise(async t=>{
            if ("document"in self) {
                const n = document.createElement("script");
                n.src = e,
                document.head.appendChild(n),
                n.onload = t
            } else
                importScripts(e),
                t()
        }
        )),
        t.then(()=>{
            if (!n[e])
                throw new Error(`Module ${e} didn’t register its module`);
            return n[e]
        }
        )
    }
      , t = (t,n)=>{
        Promise.all(t.map(e)).then(e=>n(1 === e.length ? e[0] : e))
    }
      , n = {
        require: Promise.resolve(t)
    };
    self.define = (t,s,a)=>{
        n[t] || (n[t] = Promise.resolve().then(()=>{
            let n = {};
            const i = {
                uri: location.origin + t.slice(1)
            };
            return Promise.all(s.map(t=>{
                switch (t) {
                case "exports":
                    return n;
                case "module":
                    return i;
                default:
                    return e(t)
                }
            }
            )).then(e=>{
                const t = a(...e);
                return n.default || (n.default = t),
                n
            }
            )
        }
        ))
    }
}
define("./service-worker.js", ["./service-worker-idb-keyval-df4fb325", "./service-worker-workbox-2820d135"], (function(e, t) {
    "use strict";
    const n = {
        webDevFonts: "webdev-fonts-cache-v1",
        webDevHtml: "webdev-html-cache-v1",
        webDevAssets: "webdev-assets-cache-v1",
        ...t.cacheNames
    };
    t.precacheAndRoute([{
        "revision": "d981f30050504570b43cd6cbbd4fed4f",
        "url": "/img/illustration-2.webp"
    }, {
        "revision": null,
        "url": "/service-worker-idb-keyval-df4fb325.js"
    }, {
        "revision": null,
        "url": "/js/lazysizes.min.js"
    }, {
        "revision": "h9fb4hgt8g9a8919c50ea6h86he5g4n3",
        "url": "/"
    }, {
        "revision": null,
        "url": "/service-worker-workbox-2820d135.js"
    }, {
        "revision": "05f5de5eb29a8919c50ea67d3619038d",
        "url": "/offline"
    }, {
        "revision": null,
        "url": "/js/bootstrap.js?v=a452aba4"
    }, {
        "revision": null,
        "url": "https://ressafru.sirv.com/uploadol/css/style.css"
    }], {
        cleanURLs: !1
    });
    self.addEventListener("install", t=>{
        const n = Promise.resolve().then(async()=>{
            const t = await e.get("arch");
            "v4" !== t && (await e.set("arch", "v4"),
            t && console.warn("previous service-worker arch was", t, "new", "v4"),
            await self.skipWaiting())
        }
        );
        t.waitUntil(n)
    }
    ),
    self.addEventListener("activate", e=>{
        const t = Promise.resolve().then(async()=>{
            const e = new Set(Object.values(n))
              , t = await caches.keys();
            for (const n of t)
                e.has(n) || await caches.delete(n)
        }
        );
        e.waitUntil(t)
    }
    ),
    self.addEventListener("activate", e=>{
        e.waitUntil(caches.delete(n.runtime))
    }
    ),
    self.addEventListener("activate", e=>{
        e.waitUntil(self.clients.claim())
    }
    ),
    t.initialize();
    const s = new t.ExpirationPlugin({
        maxAgeSeconds: 31536e3
    })
      , a = new t.ExpirationPlugin({
        maxEntries: 50
    })
      , i = new t.ExpirationPlugin({
        maxAgeSeconds: 604800,
        maxEntries: 100
    });
    t.registerRoute(({request: e})=>"font" === e.destination, new t.CacheFirst({
        cacheName: n.webDevFonts,
        plugins: [s]
    }));
    const r = new RegExp("^/[\\w-/]*(?:|\\.html)$")
      , c = {
        cacheKeyWillBeUsed: async({request: e})=>{
            const t = new URL(e.url);
            if (t.pathname.endservice-workerith("/index.html")) {
                return t.pathname.substr(0, t.pathname.length - "index.html".length) + t.search
            }
            return e
        }
    }
      , l = new t.NetworkFirst({
        cacheName: n.webDevHtml,
        plugins: [c, a]
    })
      , o = (d = r,
    ({url: e})=>{
        if (e.host !== self.location.host)
            return !1;
        const t = d.exec(e.pathname);
        return !!t && Array.from(t)
    }
    );
    var d;
    t.registerRoute(o, l);
    const h = new t.StaleWhileRevalidate({
        cacheName: n.webDevAssets,
        plugins: [i]
    });
    t.registerRoute(new RegExp("/img/.*"), h),
    t.registerRoute(({request: e})=>"image" === e.destination, h),
    t.setCatchHandler(async({url: e})=>{
        var url = self.location.pathname.split('?')[0] || self.location.pathname;
        if (url === '/') {
            const e = await t.matchPrecache("/")
              , n = new Headers(e.headers);
            return n.set("X-Offline", "1"),
            new Response(await e.text(),{
                headers: n
            })
        } else if (o({
            url: e
        })) {
            const e = await t.matchPrecache("/offline")
              , n = new Headers(e.headers);
            return n.set("X-Offline", "1"),
            new Response(await e.text(),{
                headers: n
            })
        }
    }
    )
}
));
//# sourceMappingURL=service-worker.js.map