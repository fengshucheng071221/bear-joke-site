/* =========================================================
   熊出没传送站 · site.js
   无依赖，原生 JS；所有数据只保存在浏览器本地
   ========================================================= */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- 访客统计 ---------------- */
  var VISIT_KEY = "bearvisits";
  var visits = parseInt(localStorage.getItem(VISIT_KEY) || "7", 10) + 1;
  localStorage.setItem(VISIT_KEY, String(visits));

  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  setText("visitCount", visits);
  setText("tickerVisit", visits);
  setText("year", String(new Date().getFullYear()));

  /* ---------------- 在线人数 / 笑声分贝 ---------------- */
  function randomInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  setInterval(function () {
    setText("onlineCount", randomInt(58, 96));
    setText("laughDb", randomInt(76, 99));
  }, 4200);

  /* ---------------- 浪费时间计时器 ---------------- */
  var start = Date.now();
  var timerEl = document.getElementById("bigTimer");
  var wasteEl = document.getElementById("wasteTime");
  var textEl = document.getElementById("timerText");
  var tickerWaste = document.getElementById("tickerWaste");

  var timerMessages = [
    "成功浪费你 7 秒（预计）",
    "已经超过 7 秒了，你比想象中更有空",
    "熊二说：再待一会儿也没关系",
    "恭喜，你已进入“时间黑洞”区域",
    "建议：把这一页发给一个正在赶 DDL 的同学"
  ];

  function updateTimer() {
    var sec = (Date.now() - start) / 1000;
    if (timerEl) timerEl.textContent = Math.floor(sec);
    if (wasteEl) wasteEl.textContent = sec.toFixed(1);
    if (tickerWaste) tickerWaste.textContent = String(Math.floor(sec) + 7);
    if (textEl) {
      var idx = sec < 7 ? 0 : sec < 20 ? 1 : sec < 45 ? 2 : sec < 90 ? 3 : 4;
      textEl.textContent = timerMessages[idx];
    }
  }
  updateTimer();
  setInterval(updateTimer, 200);

  var resetBtn = document.getElementById("resetTimer");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      start = Date.now();
      updateTimer();
      toast("已重置 · 请继续浪费");
    });
  }

  /* ---------------- Toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------------- 滚动出现动画 ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- 导航：高亮 + 移动端菜单 ---------------- */
  var navLinks = $$("#navLinks a");
  var sections = navLinks.map(function (a) {
    var id = a.getAttribute("href");
    return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
  });

  function markActive() {
    var pos = window.scrollY + 120;
    var current = -1;
    sections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= pos) current = i;
    });
    navLinks.forEach(function (a, i) {
      a.classList.toggle("is-active", i === current);
    });
  }
  markActive();
  window.addEventListener("scroll", markActive, { passive: true });

  /* 兜底：滚动/跳转时把已越过视口底部的 .reveal 也标记为显示，避免锚点跳转后中间区块空白 */
  var revealEls = $$(".reveal");
  function revealFallback() {
    var limit = window.scrollY + window.innerHeight - 40;
    revealEls.forEach(function (el) {
      if (!el.classList.contains("is-in") && el.getBoundingClientRect().top + window.scrollY < limit) {
        el.classList.add("is-in");
      }
    });
  }
  revealFallback();
  window.addEventListener("scroll", revealFallback, { passive: true });
  window.addEventListener("resize", revealFallback);

  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navLinks");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navMenu.classList.remove("is-open");
    });
  }

  /* ---------------- 回到顶部 ---------------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 480);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- 表情包灯箱 ---------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxTitle = document.getElementById("lightboxTitle");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(fig) {
    if (!lightbox) return;
    var img = fig.querySelector("img");
    lightboxImg.src = img.getAttribute("src");
    lightboxImg.alt = img.getAttribute("alt") || "表情包大图";
    lightboxTitle.textContent = fig.getAttribute("data-title") || "";
    lightboxCaption.textContent = fig.getAttribute("data-caption") || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $$(".meme").forEach(function (fig) {
    fig.addEventListener("click", function () { openLightbox(fig); });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------------- 留言墙 ---------------- */
  var WALL_KEY = "bearwall";
  var wallList = document.getElementById("wallList");
  var wallCount = document.getElementById("wallCount");
  var wallForm = document.getElementById("wallForm");

  var defaultWall = [
    { name: "光头强", text: "熊大，树还我！", time: "刚刚" },
    { name: "熊二", text: "zzz……（已读不回）", time: "1 分钟前" },
    { name: "路人甲", text: "请问贵院真的有计算机专业吗？", time: "7 秒前" }
  ];

  function loadWall() {
    try {
      var raw = localStorage.getItem(WALL_KEY);
      return raw ? JSON.parse(raw) : defaultWall.slice();
    } catch (e) {
      return defaultWall.slice();
    }
  }
  function saveWall(list) {
    try { localStorage.setItem(WALL_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function renderWall(list) {
    if (!wallList) return;
    wallList.innerHTML = list.map(function (m) {
      return "<li><b>" + escapeHtml(m.name) + "</b><span>" + escapeHtml(m.text) +
        "</span><em>" + escapeHtml(m.time) + "</em></li>";
    }).join("");
    if (wallCount) wallCount.textContent = list.length + " 条";
  }
  var wall = loadWall();
  renderWall(wall);

  if (wallForm) {
    wallForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("wallName").value.trim();
      var text = document.getElementById("wallText").value.trim();
      if (!name || !text) { toast("名字和内容都要填哦"); return; }
      wall.unshift({ name: name, text: text, time: "刚刚" });
      wall = wall.slice(0, 30);
      saveWall(wall);
      renderWall(wall);
      wallForm.reset();
      toast("留言成功 · 熊二已读不回");
    });
  }

  /* ---------------- 彩蛋：连点熊大 5 次 ---------------- */
  var heroBear = document.getElementById("heroBear");
  var clickCount = 0;
  var EMOJIS = ["🐻", "🍯", "🌲", "😄", "🐾", "🪵"];

  function rainEmojis(n) {
    for (var i = 0; i < n; i++) {
      (function (i) {
        setTimeout(function () {
          var span = document.createElement("span");
          span.className = "emoji";
          span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
          span.style.left = Math.random() * 92 + "vw";
          span.style.animationDuration = (2.2 + Math.random() * 1.8) + "s";
          document.body.appendChild(span);
          setTimeout(function () { span.remove(); }, 4200);
        }, i * 90);
      })(i);
    }
  }

  if (heroBear) {
    heroBear.addEventListener("click", function () {
      clickCount++;
      heroBear.classList.remove("is-shaking");
      void heroBear.offsetWidth;
      heroBear.classList.add("is-shaking");
      if (clickCount === 3) toast("再点两下试试？");
      if (clickCount === 5) {
        clickCount = 0;
        rainEmojis(26);
        toast("🎉 解锁成就：熊大的朋友");
      }
    });
  }

  /* ---------------- 控制台彩蛋 ---------------- */
  try {
    console.log("%c🐻 熊出没传送站", "font-size:22px;color:#c8452f;font-weight:800");
    console.log("%c你已经浪费了 %s 秒。熊大说：我不笑你。", "color:#1d4736", visits);
  } catch (e) { /* ignore */ }
})();
