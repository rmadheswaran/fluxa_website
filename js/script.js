/* ============================================================
   FLUXA UI — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Mobile hamburger menu
  ---------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger-btn');
  const drawer    = document.getElementById('mobile-drawer');

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      hamburger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (hamburger.getAttribute('aria-expanded') === 'true' &&
          !hamburger.contains(e.target) && !drawer.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ----------------------------------------------------------
     2. Navbar shadow on scroll
  ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 2px 16px rgba(0,0,0,0.06)'
        : '';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     3. Active nav link highlight on scroll
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('navbar__link--active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-60px 0px -60% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ----------------------------------------------------------
     4. Smooth scroll for anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const top = target.getBoundingClientRect().top + window.scrollY
                  - (navbar ? navbar.offsetHeight : 0) - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     5. How It Works — Animated Stepper
     --------------------------------------------------------
     Layout:
       Left  — clickable step list (.step[data-step])
       Right — stacked images    (.step-image[data-step])

     Behaviour:
       • Step 1 active on load
       • Auto-advances every AUTOPLAY_MS milliseconds (infinite loop)
       • Progress bar fills over AUTOPLAY_MS to signal upcoming switch
       • Clicking a step → immediately activates it, resets timer
       • Hovering the section → pauses autoplay
  ---------------------------------------------------------- */
  var AUTOPLAY_MS  = 4000;   /* milliseconds per step */
  var TOTAL_STEPS  = 4;

  var stepEls      = document.querySelectorAll('#steps-list .step');
  var imageEls     = document.querySelectorAll('.step-image');
  var howSection   = document.querySelector('.how-it-works');

  if (!stepEls.length || !imageEls.length) return; /* section not present */

  var currentStep  = 0;
  var autoTimer    = null;
  var isPaused     = false;

  /* ---- Core: activate a step by index ---- */
  function setActiveStep(index) {
    var prev = currentStep;
    currentStep = ((index % TOTAL_STEPS) + TOTAL_STEPS) % TOTAL_STEPS;

    /* — deactivate previous step — */
    var prevStep  = stepEls[prev];
    var prevImage = imageEls[prev];
    var prevBtn   = prevStep.querySelector('.step__trigger');
    var prevBar   = prevStep.querySelector('.step__progress-bar');

    prevStep.classList.remove('step--active');
    prevBtn.setAttribute('aria-expanded', 'false');

    /* reset progress bar instantly */
    prevBar.style.transition = 'none';
    prevBar.style.width = '0%';

    prevImage.classList.remove('step-image--active');
    prevImage.setAttribute('aria-hidden', 'true');

    /* — activate new step — */
    var nextStep  = stepEls[currentStep];
    var nextImage = imageEls[currentStep];
    var nextBtn   = nextStep.querySelector('.step__trigger');
    var nextBar   = nextStep.querySelector('.step__progress-bar');

    nextStep.classList.add('step--active');
    nextBtn.setAttribute('aria-expanded', 'true');

    nextImage.classList.add('step-image--active');
    nextImage.setAttribute('aria-hidden', 'false');

    /* kick-off the progress bar animation — start on next tick so
       the "transition:none" reset above has taken effect first    */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        nextBar.style.transition = 'width ' + AUTOPLAY_MS + 'ms linear';
        nextBar.style.width = '100%';
      });
    });
  }

  /* ---- Autoplay ---- */
  function startAutoPlay() {
    stopAutoPlay(); /* clear any existing timer */
    autoTimer = setInterval(function () {
      if (!isPaused) {
        setActiveStep(currentStep + 1);
      }
    }, AUTOPLAY_MS);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  /* ---- Click interaction ---- */
  stepEls.forEach(function (stepEl) {
    var btn = stepEl.querySelector('.step__trigger');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var index = parseInt(stepEl.getAttribute('data-step'), 10);
      if (index === currentStep) return; /* already active */
      setActiveStep(index);
      /* reset the autoplay timer from this step */
      startAutoPlay();
    });

    /* Keyboard: Enter / Space already fire click on <button>, so no extra
       listener needed — focus-visible styling handles the visual cue.     */
  });

  /* ---- Pause on hover (section-level) ---- */
  if (howSection) {
    howSection.addEventListener('mouseenter', function () { isPaused = true; });
    howSection.addEventListener('mouseleave', function () { isPaused = false; });
    /* Also pause when any element in the section gets focus */
    howSection.addEventListener('focusin',  function () { isPaused = true; });
    howSection.addEventListener('focusout', function () { isPaused = false; });
  }

  /* ---- Init ---- */
  /* Activate step 0 to set up aria + progress bar for the first step */
  setActiveStep(0);
  startAutoPlay();

  /* ----------------------------------------------------------
     6. Entrance fade-in for feature cards & pricing cards
  ---------------------------------------------------------- */
  var fadeTargets = document.querySelectorAll('.feature-card, .pricing-card');

  if ('IntersectionObserver' in window && fadeTargets.length) {
    fadeTargets.forEach(function (el) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    });

    var fadeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () {
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
          }, i * 80);
          fadeIO.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    fadeTargets.forEach(function (el) { fadeIO.observe(el); });
  }

})();
