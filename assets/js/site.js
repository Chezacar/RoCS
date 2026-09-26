/* Renders the task gallery and the real-robot video slots from SITE_DATA. */
(function () {
  "use strict";
  var D = window.SITE_DATA;
  if (!D) return;

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") n.textContent = attrs[k];
        else if (k === "class") n.className = attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function instructionNode(text, hint) {
    var p = el("p", { class: "instr" });
    p.appendChild(document.createTextNode(text));
    if (hint) {
      p.appendChild(el("sup", { class: "hint", title: "Trailing execution hints omitted", text: "†" }));
    }
    return p;
  }

  function envOf(key) {
    for (var i = 0; i < D.envs.length; i++) if (D.envs[i].key === key) return D.envs[i];
    return null;
  }

  // ---------------------------------------------------------------- gallery
  var groupsRoot = document.getElementById("gallery-groups");
  var chipsRoot = document.getElementById("gallery-filter");

  var byEnv = {};
  D.envs.forEach(function (e) { byEnv[e.key] = []; });
  D.tasks.forEach(function (t) { byEnv[t.env].push(t); });
  D.real.forEach(function (r) {
    byEnv.real.push({ env: "real", label: r.label, id: r.id, instruction: r.instruction,
                      hint: r.hint, src: r.poster });
  });

  var total = 0;
  var groups = {};
  D.envs.forEach(function (env) {
    var tasks = byEnv[env.key];
    total += tasks.length;
    var emb = D.embodiments[env.embodiment];
    var head = el("div", { class: "group-head" }, [
      el("span", { class: "dot emb-" + env.embodiment, "aria-hidden": "true" }),
      el("h3", { text: env.name }),
      el("span", { class: "group-meta",
                   text: emb.name + " · " + emb.arms + " · " + tasks.length + " tasks" })
    ]);
    var grid = el("ul", { class: "task-grid", role: "list" });
    tasks.forEach(function (t) {
      var src = t.src || ("assets/gallery/" + t.img + ".jpg");
      var img = el("img", { src: src, width: "640", height: "480", loading: "lazy", decoding: "async",
                            alt: "Initial scene of the " + env.name + " task “" + t.label + "”" });
      var cap = el("figcaption", null, [
        el("span", { class: "task-label", text: t.label }),
        el("code", { class: "task-id", text: t.id }),
        instructionNode(t.instruction, t.hint)
      ]);
      grid.appendChild(el("li", null, [el("figure", { class: "task-card" }, [
        el("div", { class: "frame" }, [img]), cap])]));
    });
    var section = el("section", { class: "task-group", "data-env": env.key,
                                  "aria-label": env.name + " tasks" }, [head, grid]);
    groups[env.key] = section;
    groupsRoot.appendChild(section);
  });

  function chip(key, name, count, embodiment) {
    var b = el("button", { type: "button", class: "chip", "data-filter": key, "aria-pressed": "false" }, [
      embodiment ? el("span", { class: "dot emb-" + embodiment, "aria-hidden": "true" }) : null,
      el("span", { text: name }),
      el("span", { class: "chip-count", text: String(count) })
    ]);
    b.addEventListener("click", function () { setFilter(key); });
    chipsRoot.appendChild(b);
  }
  chip("all", "All", total, null);
  D.envs.forEach(function (env) { chip(env.key, env.name, byEnv[env.key].length, env.embodiment); });

  var status = document.getElementById("gallery-status");
  function setFilter(key) {
    var shown = 0;
    Object.keys(groups).forEach(function (k) {
      var on = key === "all" || key === k;
      groups[k].hidden = !on;
      if (on) shown += byEnv[k].length;
    });
    Array.prototype.forEach.call(chipsRoot.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-filter") === key ? "true" : "false");
    });
    var env = envOf(key);
    status.textContent = "Showing " + shown + " tasks" + (env ? " from " + env.name : "") + ".";
  }
  setFilter("all");

  // ------------------------------------------------------------ real robot
  var realRoot = document.getElementById("real-slots");

  function placeholder(r) {
    return el("div", { class: "player placeholder" }, [
      el("img", { src: r.poster, width: "640", height: "480", loading: "lazy", decoding: "async",
                  alt: "Initial scene of the real-robot task “" + r.label + "” (video not yet available)" }),
      el("span", { class: "pending", text: "Video to be added" })
    ]);
  }

  function videoPlayer(r) {
    var v = el("video", { controls: "", muted: "", playsinline: "", preload: "metadata",
                          poster: r.poster, width: "640", height: "480",
                          "aria-label": "Real-robot episode: " + r.label });
    v.muted = true;
    v.appendChild(el("source", { src: r.video, type: "video/mp4" }));
    return el("div", { class: "player" }, [v]);
  }

  // Resolve true if the video file exists. Over http(s) a ranged GET is aborted
  // as soon as headers arrive; from file:// (where fetch is blocked) a detached
  // media element is probed instead.
  function probeVideo(url) {
    function mediaProbe() {
      return new Promise(function (resolve) {
        var v = document.createElement("video");
        var done = false;
        function finish(ok) { if (!done) { done = true; v.removeAttribute("src"); v.load(); resolve(ok); } }
        v.preload = "metadata";
        v.muted = true;
        v.addEventListener("loadedmetadata", function () { finish(true); });
        v.addEventListener("error", function () { finish(false); });
        setTimeout(function () { finish(false); }, 8000);
        v.src = url;
      });
    }
    if (!/^https?:$/.test(location.protocol) || !window.fetch) return mediaProbe();
    var ctrl = window.AbortController ? new AbortController() : null;
    return fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, cache: "no-store",
                        signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (ctrl) ctrl.abort();
        return res.ok; // 200 or 206
      })
      .catch(function () { return mediaProbe(); });
  }

  D.real.forEach(function (r) {
    var slot = el("div", { class: "slot-media" }, [placeholder(r)]);
    var body = el("div", { class: "slot-body" }, [
      el("div", { class: "slot-title" }, [
        el("h3", { text: r.label }),
        el("code", { class: "task-id", text: r.id })
      ]),
      instructionNode(r.instruction, r.hint),
      r.challenge ? el("p", { class: "challenge" }, [el("span", { class: "challenge-k", text: "Challenge: " }),
                                                 document.createTextNode(r.challenge)]) : null,
      r.caption ? el("p", { class: "slot-caption", text: r.caption }) : null
    ]);
    var card = el("article", { class: "slot", id: "real-" + r.id }, [slot, body]);
    realRoot.appendChild(card);

    probeVideo(r.video).then(function (ok) {
      if (!ok) return;
      slot.replaceChild(videoPlayer(r), slot.firstChild);
      card.classList.add("has-video");
    });
  });
})();
