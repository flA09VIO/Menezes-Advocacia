/* ==========================================================================
   THAIS MENEZES ADVOCACIA — INTERAÇÕES
   Vanilla JS · IntersectionObserver · requestAnimationFrame
   ========================================================================== */
(function(){
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Preloader ---------------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    if(!pre) return;
    setTimeout(() => pre.classList.add("hide"), 320);
  });

  /* ---------------- Navbar: glass on scroll + hide/reveal ---------------- */
  const navbar = document.querySelector(".navbar");
  let lastY = window.scrollY;

  function onScrollNav(){
    const y = window.scrollY;
    if(navbar){
      navbar.classList.toggle("scrolled", y > 40);
    }
    lastY = y;
  }
  document.addEventListener("scroll", onScrollNav, {passive:true});
  onScrollNav();

  /* ---------------- Scroll progress bar ---------------- */
  const progress = document.getElementById("scroll-progress");
  function onScrollProgress(){
    if(!progress) return;
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + "%";
  }
  document.addEventListener("scroll", onScrollProgress, {passive:true});
  onScrollProgress();

  /* ---------------- Back to top ---------------- */
  const toTop = document.getElementById("to-top");
  if(toTop){
    document.addEventListener("scroll", () => {
      toTop.classList.toggle("show", window.scrollY > 900);
    }, {passive:true});
    toTop.addEventListener("click", () => window.scrollTo({top:0, behavior: reducedMotion ? "auto" : "smooth"}));
  }

  /* ---------------- Mobile drawer ---------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  if(navToggle && drawer){
    navToggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      drawer.classList.remove("open");
      navToggle.classList.remove("open");
      document.body.style.overflow = "";
    }));
  }

  /* ---------------- Active link on scroll (anchor sections) ---------------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll('.nav-links a[href*="#"]');
  if(sections.length && navAnchors.length){
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const id = entry.target.getAttribute("id");
          navAnchors.forEach(a => {
            a.classList.toggle("active", a.getAttribute("href").endsWith("#"+id));
          });
        }
      });
    }, {rootMargin: "-45% 0px -50% 0px"});
    sections.forEach(s => navObserver.observe(s));
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if(revealEls.length){
    if(reducedMotion){
      revealEls.forEach(el => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.14, rootMargin:"0px 0px -60px 0px"});
      revealEls.forEach((el, i) => {
        el.style.setProperty("--i", el.dataset.i || (i % 6));
        io.observe(el);
      });
    }
  }

  /* ---------------- Áreas de atuação: accordion ---------------- */
  document.querySelectorAll(".index-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".index-item");
      const panel = item.querySelector(".index-panel");
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".index-item.open").forEach(other => {
        if(other !== item){
          other.classList.remove("open");
          other.querySelector(".index-panel").style.maxHeight = null;
          other.querySelector(".index-trigger").setAttribute("aria-expanded","false");
        }
      });

      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });

  /* ---------------- Botões com efeito magnético sutil ---------------- */
  if(!reducedMotion && window.matchMedia("(pointer:fine)").matches){
    document.querySelectorAll(".magnetic").forEach(btn => {
      let raf;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * 0.28;
        const y = (e.clientY - r.top - r.height/2) * 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
      btn.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------- Smooth anchor scroll considerando navbar fixa ---------------- */
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    const url = link.getAttribute("href");
    if(!url.includes("#")) return;
    const [path, hash] = url.split("#");
    const samePage = path === "" || path === window.location.pathname.split("/").pop();
    if(!samePage || !hash) return;
    const target = document.getElementById(hash);
    if(!target) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const navH = document.querySelector(".navbar")?.offsetHeight || 0;
      const y = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({top:y, behavior: reducedMotion ? "auto" : "smooth"});
      history.pushState(null, "", "#"+hash);
    });
  });

  /* ---------------- Filtro de artigos (artigos.html) ---------------- */
  const chips = document.querySelectorAll(".filter-chip");
  const rows = document.querySelectorAll(".docket-row");
  const count = document.getElementById("result-count");
  function applyFilter(chip){
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const cat = chip.dataset.filter;
    let visible = 0;
    rows.forEach(row => {
      const match = cat === "all" || row.dataset.category === cat;
      row.hidden = !match;
      if(match) visible++;
    });
    if(count) count.textContent = visible + (visible === 1 ? " artigo encontrado" : " artigos encontrados");
  }
  if(chips.length && rows.length){
    chips.forEach(chip => chip.addEventListener("click", () => applyFilter(chip)));
    const hash = window.location.hash.replace("#","");
    if(hash){
      const target = document.querySelector('.filter-chip[data-hash="'+hash+'"]');
      if(target){ applyFilter(target); target.scrollIntoView({block:"center"}); }
    }
  }

  /* ---------------- Parallax extremamente leve no hero ---------------- */
  const heroVisual = document.querySelector(".hero-visual");
  if(heroVisual && !reducedMotion && window.matchMedia("(pointer:fine)").matches){
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    }, {passive:true});
  }

})();
