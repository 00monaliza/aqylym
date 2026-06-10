/* CONFIG */
var WA_NUMBER = "77055746860";
var METRIKA_ID = 0;

/* UTM attribution */
function getParams(){
  var p = new URLSearchParams(location.search), o = {};
  ["utm_source","utm_medium","utm_campaign","utm_content","s"].forEach(function(k){
    if(p.get(k)) o[k] = p.get(k);
  });
  return o;
}
var saved = {};
try{ saved = JSON.parse(sessionStorage.getItem("aq_utm") || "{}"); }catch(e){}
var UTM = Object.assign({}, saved, getParams());
try{ sessionStorage.setItem("aq_utm", JSON.stringify(UTM)); }catch(e){}
function sourceLabel(){
  var s = (UTM.utm_source || "").toLowerCase();
  if(s.indexOf("insta") > -1 || s === "ig") return "Instagram";
  if(s.indexOf("tik") > -1) return "TikTok";
  if(s) return UTM.utm_source;
  if(document.referrer.indexOf("instagram") > -1) return "Instagram";
  if(document.referrer.indexOf("tiktok") > -1) return "TikTok";
  return "прямой заход";
}

/* Metrika */
function goal(name){
  try{ if(window.ym && METRIKA_ID) ym(METRIKA_ID, "reachGoal", name); }catch(e){}
}
document.addEventListener("click", function(e){
  var t = e.target.closest("[data-goal]");
  if(t) goal(t.getAttribute("data-goal"));
});

/* WhatsApp links */
function waUrl(text){ return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }
function defaultWaText(){ return "Здравствуйте! Хочу узнать про поступление за рубеж. (источник: " + sourceLabel() + ")"; }
document.querySelectorAll(".wa-link").forEach(function(a){
  a.addEventListener("click", function(ev){
    ev.preventDefault();
    goal("whatsapp_click");
    window.open(waUrl(defaultWaText()), "_blank");
  });
});

/* Segment preselect */
(function(){
  var seg = UTM.s || UTM.utm_content;
  var sel = document.getElementById("inSeg");
  if(seg && sel && ["school","bachelor","master"].indexOf(seg) > -1) sel.value = seg;
  document.querySelectorAll("[data-seg]").forEach(function(a){
    a.addEventListener("click", function(){ if(sel) sel.value = a.getAttribute("data-seg"); });
  });
})();

/* Lead form */
(function(){
  var form = document.getElementById("leadForm");
  if(!form) return;
  var segNames = {school:"школьник 10–11 класс", bachelor:"бакалавриат", master:"магистратура", other:"другое"};
  form.addEventListener("submit", function(ev){
    ev.preventDefault();
    var name = document.getElementById("inName").value.trim();
    var phone = document.getElementById("inPhone").value.replace(/[^\d+]/g, "");
    var seg = document.getElementById("inSeg").value;
    var ok = true;
    document.getElementById("fName").classList.toggle("bad", name.length < 2); if(name.length < 2) ok = false;
    var phoneOk = /^(\+?7|8)\d{10}$/.test(phone);
    document.getElementById("fPhone").classList.toggle("bad", !phoneOk); if(!phoneOk) ok = false;
    if(!ok) return;
    goal("lead_form_sent");
    var msg = "Заявка с сайта aqylym.kz\nИмя: " + name + "\nТелефон: " + phone +
      "\nКто поступает: " + (segNames[seg] || seg) + "\nИсточник: " + sourceLabel();
    window.open(waUrl(msg), "_blank");
  });
})();

/* Nav */
var nav = document.getElementById("nav");
var burger = document.getElementById("burger");
var navLinks = document.getElementById("navLinks");
window.addEventListener("scroll", function(){
  nav.classList.toggle("scrolled", window.scrollY > 30);
}, {passive:true});
burger.addEventListener("click", function(){
  burger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach(function(a){
  a.addEventListener("click", function(){ burger.classList.remove("open"); navLinks.classList.remove("open"); });
});

/* Reveal on scroll */
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("vis"); io.unobserve(en.target); } });
}, {threshold:.15});
document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });

/* Steps — infinite cycling light-up */
(function(){
  var stepsEl = document.getElementById("steps");
  if(!stepsEl) return;
  var stepEls = stepsEl.querySelectorAll(".step");
  var stepsInterval = null;
  var stepsTimeout = null;
  var stepIdx = 0;
  var running = false;

  function tick(){
    if(stepIdx === 0){
      stepEls.forEach(function(s){ s.classList.remove("lit"); });
    }
    if(stepIdx < stepEls.length){
      stepEls[stepIdx].classList.add("lit");
      stepIdx++;
    }
    if(stepIdx >= stepEls.length){
      clearInterval(stepsInterval);
      stepsTimeout = setTimeout(function(){
        stepIdx = 0;
        stepsInterval = setInterval(tick, 380);
      }, 2200);
    }
  }

  function startSteps(){
    if(running) return;
    running = true;
    stepIdx = 0;
    stepEls.forEach(function(s){ s.classList.remove("lit"); });
    stepsInterval = setInterval(tick, 380);
  }

  function stopSteps(){
    running = false;
    clearInterval(stepsInterval);
    clearTimeout(stepsTimeout);
  }

  var sio = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting) startSteps();
      else stopSteps();
    });
  }, {threshold:.3});

  sio.observe(stepsEl);
})();

/* Deadline countdown */
(function(){
  var now = new Date(), y = now.getFullYear();
  var dls = [
    {name:"UCAS (Великобритания)", date:new Date(y,0,14)},
    {name:"Regular Decision (США)", date:new Date(y,0,15)},
    {name:"uni-assist (Германия)", date:new Date(y,6,15)},
    {name:"Early Decision (США)", date:new Date(y,10,1)},
    {name:"UCAS (Великобритания)", date:new Date(y+1,0,14)}
  ];
  var next = null;
  for(var i = 0; i < dls.length; i++){ if(dls[i].date > now){ next = dls[i]; break; } }
  if(!next) return;
  var chip = document.getElementById("deadlineChip");
  if(chip){ chip.hidden = false; document.getElementById("dlName").textContent = next.name; }
  function upd(){
    var diff = Math.max(0, next.date - new Date());
    var d = Math.floor(diff / 864e5);
    var dd = document.getElementById("dlDays");
    if(dd) dd.textContent = d;
  }
  upd(); setInterval(upd, 60000);
})();

/* Floating WA */
(function(){
  var fab = document.getElementById("fab");
  var shown75 = false, hinted = false;
  window.addEventListener("scroll", function(){
    var sc = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? sc / max : 0;
    fab.classList.toggle("show", sc > 500);
    if(p > .45 && !hinted){ hinted = true; fab.classList.add("talky"); setTimeout(function(){ fab.classList.remove("talky"); }, 7000); }
    if(p > .75 && !shown75){ shown75 = true; goal("scroll_75"); }
  }, {passive:true});
  setTimeout(function(){ goal("time_120s"); }, 120000);
})();

document.getElementById("yr").textContent = new Date().getFullYear();
