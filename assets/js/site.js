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
      var frameChildren = [img];
      if (t.video) {
        var watch = el("button", { type: "button", class: "task-watch",
                                   "aria-label": "Watch successful rollout for " + t.label }, [
          el("span", { "aria-hidden": "true", text: "▶" }),
          el("span", { text: "Watch" })
        ]);
        watch.addEventListener("click", function () { showSimulationTask(t.env, t.id); });
        frameChildren.push(watch);
      }
      grid.appendChild(el("li", null, [el("figure", { class: "task-card" }, [
        el("div", { class: "frame" }, frameChildren), cap])]));
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

  // ----------------------------------------------------- simulation videos
  var simRoot = document.getElementById("sim-video-gallery");
  var simEnvTabs = [];
  var simOptionButtons = [];
  var simActiveTask = null;

  function simulationPoster(t) {
    return "assets/gallery/" + t.img + ".jpg";
  }

  function simulationMedia(t, autoplay) {
    if (!t.video) {
      return el("div", { class: "sim-video-placeholder" }, [
        el("img", { src: simulationPoster(t), width: "640", height: "480", decoding: "async",
                    alt: "Initial scene of “" + t.label + "”" }),
        el("span", { class: "video-pending", text: "No successful rollout in this run" })
      ]);
    }
    var v = el("video", { controls: "", muted: "", playsinline: "", preload: "metadata",
                          poster: simulationPoster(t),
                          "aria-label": "Successful zero-shot simulation rollout: " + t.label });
    v.muted = true;
    v.src = t.video;
    if (autoplay) {
      v.addEventListener("loadedmetadata", function () { v.play().catch(function () {}); }, { once: true });
    }
    return v;
  }

  var simMedia = el("div", { class: "sim-video-media" });
  var simIndex = el("span", { class: "sim-video-index" });
  var simTitle = el("strong", { class: "sim-video-title" });
  var simEnvLabel = el("span", { class: "sim-video-env" });
  var simInstruction = el("p", { class: "sim-video-instruction" });
  var simStage = el("div", { class: "sim-video-stage" }, [
    simMedia,
    el("div", { class: "sim-video-caption" }, [
      el("div", { class: "sim-video-heading" }, [simIndex, simTitle, simEnvLabel]),
      simInstruction
    ])
  ]);
  var simTabs = el("div", { class: "sim-video-tabs", role: "group",
                             "aria-label": "Select simulation environment" });
  var simList = el("div", { class: "sim-video-list", role: "list",
                             "aria-label": "Select a simulation task" });

  function renderSimulationTask(t, autoplay) {
    simActiveTask = t;
    var oldVideo = simMedia.querySelector("video");
    if (oldVideo) oldVideo.pause();
    simMedia.textContent = "";
    simMedia.appendChild(simulationMedia(t, autoplay));
    var envTasks = byEnv[t.env];
    simIndex.textContent = String(envTasks.indexOf(t) + 1).padStart(2, "0") + " / " + String(envTasks.length).padStart(2, "0");
    simTitle.textContent = t.label;
    simEnvLabel.textContent = envOf(t.env).name + (t.video ? " · successful rollout" : " · no success available");
    simInstruction.textContent = t.instruction;
    simOptionButtons.forEach(function (button) {
      var selected = button.getAttribute("data-task") === t.id;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function renderSimulationEnv(envKey, taskId, autoplay) {
    var env = envOf(envKey);
    var tasks = byEnv[envKey];
    simEnvTabs.forEach(function (button) {
      var selected = button.getAttribute("data-env") === envKey;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    simList.textContent = "";
    simList.setAttribute("aria-label", "Select a " + env.name + " task");
    simOptionButtons = [];
    tasks.forEach(function (t, index) {
      var button = el("button", { type: "button", class: "sim-video-option" + (t.video ? " has-video" : " no-video"),
                                  "data-task": t.id, "aria-pressed": "false",
                                  "aria-label": (t.video ? "Play successful rollout for " : "Show task without a successful rollout: ") + t.label }, [
        el("div", { class: "sim-option-thumb" }, [
          el("img", { src: simulationPoster(t), width: "640", height: "480", loading: "lazy", decoding: "async",
                      alt: "Preview of “" + t.label + "”" }),
          el("span", { class: "sim-option-number", text: String(index + 1).padStart(2, "0") })
        ]),
        el("span", { class: "sim-option-copy" }, [
          el("small", { text: t.video ? "Successful rollout" : "No successful rollout" }),
          el("strong", { text: t.label })
        ])
      ]);
      button.addEventListener("click", function () { renderSimulationTask(t, true); });
      simOptionButtons.push(button);
      simList.appendChild(button);
    });
    var selected = tasks.filter(function (t) { return t.id === taskId; })[0] ||
                   tasks.filter(function (t) { return t.video; })[0] || tasks[0];
    renderSimulationTask(selected, autoplay);
  }

  function showSimulationTask(envKey, taskId) {
    if (!simRoot) return;
    renderSimulationEnv(envKey, taskId, true);
    simRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (simRoot) {
    D.envs.filter(function (env) { return env.key !== "real"; }).forEach(function (env) {
      var successCount = byEnv[env.key].filter(function (t) { return Boolean(t.video); }).length;
      var button = el("button", { type: "button", class: "sim-env-tab", "data-env": env.key,
                                  "aria-pressed": "false" }, [
        el("span", { class: "dot emb-" + env.embodiment, "aria-hidden": "true" }),
        el("span", { text: env.name }),
        el("small", { text: successCount + "/" + byEnv[env.key].length })
      ]);
      button.addEventListener("click", function () { renderSimulationEnv(env.key, null, false); });
      simEnvTabs.push(button);
      simTabs.appendChild(button);
    });
    simRoot.appendChild(el("div", { class: "sim-video-gallery" }, [simTabs, simStage, simList]));
    renderSimulationEnv("robodojo", null, false);
  }

  // ------------------------------------------------------------ real robot
  var realRoot = document.getElementById("real-slots");
  var availability = [];
  var activeReal = 0;

  function videoPlaceholder(r) {
    return el("div", { class: "real-video-placeholder" }, [
      el("img", { src: r.poster, width: "640", height: "480", decoding: "async",
                  alt: "Initial scene of the real-robot task “" + r.label + "”" }),
      el("span", { class: "video-pending", text: "Video to be added" })
    ]);
  }

  function videoPlayer(r, autoplay) {
    var v = el("video", { controls: "", muted: "", playsinline: "", preload: "metadata",
                          poster: r.poster, "aria-label": "Successful real-robot episode: " + r.label });
    v.muted = true;
    v.src = r.video;
    if (autoplay) {
      v.addEventListener("loadedmetadata", function () { v.play().catch(function () {}); }, { once: true });
    }
    return v;
  }

  // Resolve true if the video file exists. Over http(s) a ranged GET is aborted
  // as soon as headers arrive; from file:// a detached media element is probed.
  function probeVideo(url) {
    function mediaProbe() {
      return new Promise(function (resolve) {
        var v = document.createElement("video");
        var done = false;
        function finish(ok) {
          if (done) return;
          done = true;
          v.removeAttribute("src");
          v.load();
          resolve(ok);
        }
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
        return res.ok;
      })
      .catch(function () { return mediaProbe(); });
  }

  var stageMedia = el("div", { class: "real-video-media" });
  var stageIndex = el("span", { class: "real-video-index" });
  var stageTitle = el("strong", { class: "real-video-title" });
  var stageSuccess = el("span", { class: "real-video-success" });
  var stageInstruction = el("p", { class: "real-video-instruction" });
  var stageChallenge = el("p", { class: "real-video-challenge" });
  var stage = el("div", { class: "real-video-stage" }, [
    stageMedia,
    el("div", { class: "real-video-caption" }, [
      el("div", { class: "real-video-heading" }, [stageIndex, stageTitle, stageSuccess]),
      stageInstruction,
      stageChallenge
    ])
  ]);
  var selector = el("div", { class: "real-video-list", role: "list",
                              "aria-label": "Select a successful real-robot demonstration" });
  var buttons = [];

  function renderRealVideo(index, autoplay) {
    var r = D.real[index];
    activeReal = index;
    var oldVideo = stageMedia.querySelector("video");
    if (oldVideo) oldVideo.pause();
    stageMedia.textContent = "";
    stageMedia.appendChild(availability[index] ? videoPlayer(r, autoplay) : videoPlaceholder(r));
    stageIndex.textContent = String(index + 1).padStart(2, "0") + " / " + String(D.real.length).padStart(2, "0");
    stageTitle.textContent = r.label;
    stageSuccess.textContent = (r.success || "") + " success";
    stageInstruction.textContent = r.instruction;
    stageChallenge.textContent = r.challenge || "";
    stageChallenge.hidden = !r.challenge;
    buttons.forEach(function (button, i) {
      var selected = i === index;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  D.real.forEach(function (r, index) {
    availability[index] = false;
    var state = el("small", { class: "video-option-state", text: "Preview" });
    var button = el("button", { type: "button", class: "video-option",
                                "aria-pressed": "false",
                                "aria-label": "Select " + r.label + " demonstration" }, [
      el("div", { class: "video-option-thumb" }, [
        el("img", { src: r.poster, width: "640", height: "480", loading: "lazy", decoding: "async",
                    alt: "Preview of “" + r.label + "”" }),
        el("span", { class: "video-option-number", text: String(index + 1).padStart(2, "0") })
      ]),
      el("span", { class: "video-option-copy" }, [
        state,
        el("strong", { text: r.label }),
        el("span", { class: "video-option-score", text: (r.success || "") + " success" })
      ])
    ]);
    button.addEventListener("click", function () { renderRealVideo(index, true); });
    buttons.push(button);
    selector.appendChild(button);

    probeVideo(r.video).then(function (ok) {
      availability[index] = ok;
      button.classList.toggle("has-video", ok);
      state.textContent = ok ? "Watch rollout" : "Preview";
      if (index === activeReal) renderRealVideo(index, false);
    });
  });

  realRoot.appendChild(el("div", { class: "real-video-gallery" }, [stage, selector]));
  renderRealVideo(0, false);
})();
