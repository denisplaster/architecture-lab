(function () {
  "use strict";
  var root = document.documentElement;
  var DATA = JSON.parse(document.getElementById("lesson-data").textContent);
  var KEY = "scs:";

  function load(k, d) {
    try {
      var v = localStorage.getItem(KEY + k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  }
  function save(k, v) {
    try {
      localStorage.setItem(KEY + k, JSON.stringify(v));
    } catch (e) {}
  }
  function $all(sel, el) {
    return Array.prototype.slice.call((el || document).querySelectorAll(sel));
  }
  function track() {
    return root.getAttribute("data-track") || "full";
  }
  function shell() {
    return root.getAttribute("data-shell") || "sh";
  }
  function mmss(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  /* ---------- segmented controls ---------- */
  function syncPressed() {
    $all("[data-set]").forEach(function (b) {
      b.setAttribute(
        "aria-pressed",
        String(root.getAttribute("data-" + b.dataset.set) === b.dataset.value),
      );
    });
    var t = document.getElementById("teacher-toggle");
    t.setAttribute(
      "aria-pressed",
      String(root.getAttribute("data-teacher") === "on"),
    );
  }
  $all("[data-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      root.setAttribute("data-" + b.dataset.set, b.dataset.value);
      save(b.dataset.set, b.dataset.value);
      syncPressed();
      if (b.dataset.set === "track") {
        renderTimes();
        tick();
        scoreTour();
      }
    });
  });
  document
    .getElementById("teacher-toggle")
    .addEventListener("click", function () {
      var on = root.getAttribute("data-teacher") !== "on";
      root.setAttribute("data-teacher", on ? "on" : "off");
      save("teacher", on ? "on" : "off");
      syncPressed();
    });

  /* ---------- per-track time windows ---------- */
  function minutes() {
    return DATA.tracks[track()].minutes;
  }
  function renderTimes() {
    var m = minutes(),
      start = 0;
    m.forEach(function (len, i) {
      var win =
        "0:" +
        String(start).padStart(2, "0") +
        "–0:" +
        String(start + len).padStart(2, "0");
      $all('[data-win="' + i + '"]').forEach(function (el) {
        el.textContent = win;
      });
      $all('[data-mins="' + i + '"]').forEach(function (el) {
        el.textContent = len + " min";
      });
      start += len;
    });
    var bar = document.getElementById("clock-track");
    bar.innerHTML = "";
    m.forEach(function (len) {
      var s = document.createElement("span");
      s.style.setProperty("--m", String(len));
      s.appendChild(document.createElement("i"));
      bar.appendChild(s);
    });
  }

  /* ---------- class clock ---------- */
  var TOTAL = 45 * 60 * 1000;
  var clock = load("clock", { running: false, startedAt: 0, acc: 0 });
  var timer = null,
    wake = null;
  function elapsed() {
    return clock.acc + (clock.running ? Date.now() - clock.startedAt : 0);
  }
  function tick() {
    var e = elapsed(),
      m = minutes(),
      start = 0,
      cur = -1;
    for (var i = 0; i < m.length; i++) {
      var end = (start + m[i]) * 60000;
      if (e < end) {
        cur = i;
        break;
      }
      start += m[i];
    }
    document.getElementById("clock-elapsed").textContent = mmss(e);
    var now = document.getElementById("clock-now");
    var started = clock.running || clock.acc > 0;
    if (!started) {
      now.textContent = "Press Start when class begins";
      now.classList.remove("over");
    } else if (cur === -1) {
      now.textContent = "Over time by " + mmss(e - TOTAL);
      now.classList.add("over");
    } else {
      var left = (start + m[cur]) * 60000 - e;
      now.textContent =
        "Now: " +
        String(cur + 1).padStart(2, "0") +
        " " +
        DATA.titles[cur] +
        " · " +
        mmss(left) +
        " left";
      now.classList.remove("over");
    }
    var spans = document.getElementById("clock-track").children,
      acc = 0;
    for (var j = 0; j < spans.length; j++) {
      var segMs = m[j] * 60000,
        fill = Math.min(1, Math.max(0, (e - acc) / segMs));
      spans[j].style.setProperty("--fill", (fill * 100).toFixed(1) + "%");
      acc += segMs;
    }
    $all(".seg[data-index]").forEach(function (s) {
      s.classList.toggle("now", started && Number(s.dataset.index) === cur);
    });
    $all(".outline li[data-index]").forEach(function (li) {
      li.classList.toggle("now", started && Number(li.dataset.index) === cur);
    });
  }
  function setRunning(run) {
    var btn = document.getElementById("clock-btn");
    if (run && !clock.running) {
      clock.running = true;
      clock.startedAt = Date.now();
    }
    if (!run && clock.running) {
      clock.acc += Date.now() - clock.startedAt;
      clock.running = false;
    }
    save("clock", clock);
    btn.textContent = clock.running
      ? "Pause"
      : clock.acc > 0
        ? "Resume"
        : "Start class";
    btn.classList.toggle("running", clock.running);
    clearInterval(timer);
    if (clock.running) {
      timer = setInterval(tick, 1000);
      try {
        if (navigator.wakeLock)
          navigator.wakeLock
            .request("screen")
            .then(function (l) {
              wake = l;
            })
            .catch(function () {});
      } catch (e) {}
    } else if (wake) {
      try {
        wake.release();
      } catch (e) {}
      wake = null;
    }
    tick();
  }
  document.getElementById("clock-btn").addEventListener("click", function () {
    setRunning(!clock.running);
  });
  document.getElementById("clock-reset").addEventListener("click", function () {
    clock = { running: false, startedAt: 0, acc: 0 };
    setRunning(false);
  });

  /* ---------- step checkboxes ---------- */
  var checks = load("checks", {});
  $all("input[data-check]").forEach(function (box) {
    box.checked = !!checks[box.dataset.check];
    box.addEventListener("change", function () {
      checks[box.dataset.check] = box.checked;
      save("checks", checks);
    });
  });

  /* ---------- copy buttons ---------- */
  function lineVisible(el) {
    var s = el.getAttribute("data-stack"),
      sh = el.getAttribute("data-shell-only"),
      t = track();
    if (s && t !== "full" && s !== t) return false;
    if (sh && sh !== shell()) return false;
    return true;
  }
  function flash(btn, text) {
    var old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = text;
    btn.classList.add("done");
    setTimeout(function () {
      btn.textContent = old;
      btn.classList.remove("done");
    }, 1400);
  }
  function selectEl(el) {
    try {
      var r = document.createRange();
      r.selectNodeContents(el);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    } catch (e) {}
  }
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest("button.copy") : null;
    if (!btn) return;
    var box = btn.closest(".term, .file"),
      text = "",
      target = null;
    if (btn.hasAttribute("data-text")) {
      text = btn.getAttribute("data-text");
      target = box.querySelector(".edit-row.new code");
    } else if (box.classList.contains("term")) {
      text = $all(".ln", box)
        .filter(lineVisible)
        .map(function (l) {
          return l.textContent;
        })
        .join("\n");
      target = box.querySelector("pre");
    } else {
      target = box.querySelector("pre code");
      text = target.textContent;
    }
    try {
      navigator.clipboard.writeText(text).then(
        function () {
          flash(btn, "Copied");
        },
        function () {
          selectEl(target);
          flash(btn, "Press Ctrl+C");
        },
      );
    } catch (e) {
      selectEl(target);
      flash(btn, "Press Ctrl+C");
    }
  });

  /* ---------- tour quiz ---------- */
  var tourEl = document.getElementById("tour-quiz");
  var picks = load("tour", {});
  function scoreTour() {
    if (!tourEl) return;
    var items = $all(".tour-item", tourEl).filter(function (li) {
      var s = li.getAttribute("data-stack");
      return !s || track() === "full" || s === track();
    });
    var right = 0,
      answered = 0;
    items.forEach(function (li) {
      var p = picks[li.dataset.id];
      if (p) answered++;
      var ok = p === li.dataset.answer;
      if (ok) right++;
      li.classList.toggle("right", ok);
      li.classList.toggle("wrong", !!p && !ok);
    });
    var el = document.getElementById("tour-score");
    el.innerHTML = tourEl.classList.contains("revealed")
      ? "<strong>" +
        right +
        " of " +
        items.length +
        "</strong> match the recommendation."
      : "<strong>" + answered + " of " + items.length + "</strong> decided.";
  }
  if (tourEl) {
    $all(".tour-item", tourEl).forEach(function (li) {
      $all(".choices button", li).forEach(function (b) {
        b.setAttribute(
          "aria-pressed",
          String(picks[li.dataset.id] === b.dataset.choice),
        );
        b.addEventListener("click", function () {
          picks[li.dataset.id] = b.dataset.choice;
          save("tour", picks);
          $all(".choices button", li).forEach(function (x) {
            x.setAttribute("aria-pressed", String(x === b));
          });
          scoreTour();
        });
      });
    });
    if (load("tourRevealed", false)) tourEl.classList.add("revealed");
    document
      .getElementById("tour-check")
      .addEventListener("click", function () {
        tourEl.classList.add("revealed");
        save("tourRevealed", true);
        scoreTour();
      });
    document
      .getElementById("tour-reset")
      .addEventListener("click", function () {
        picks = {};
        save("tour", picks);
        tourEl.classList.remove("revealed");
        save("tourRevealed", false);
        $all(".choices button", tourEl).forEach(function (x) {
          x.setAttribute("aria-pressed", "false");
        });
        scoreTour();
      });
  }

  syncPressed();
  renderTimes();
  setRunning(clock.running);
  scoreTour();
})();
