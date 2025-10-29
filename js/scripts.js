/* Description: Custom JS file */

/* Navigation*/
// Collapse the navbar by adding the top-nav-collapse class
window.onscroll = function () {
	scrollFunction();
	scrollFunctionBTT(); // back to top button
};

window.onload = function () {
	scrollFunction();
};

function scrollFunction() {
	if (document.documentElement.scrollTop > 30) {
		document.getElementById("navbar").classList.add("top-nav-collapse");
	} else if ( document.documentElement.scrollTop < 30 ) {
		document.getElementById("navbar").classList.remove("top-nav-collapse");
	}
}

// Navbar on mobile
let elements = document.querySelectorAll(".nav-link:not(.dropdown-toggle)");

for (let i = 0; i < elements.length; i++) {
	elements[i].addEventListener("click", () => {
		document.querySelector(".offcanvas-collapse").classList.toggle("open");
	});
}

document.querySelector(".navbar-toggler").addEventListener("click", () => {
  	document.querySelector(".offcanvas-collapse").classList.toggle("open");
});

// Hover on desktop
function toggleDropdown(e) {
	const _d = e.target.closest(".dropdown");
	let _m = document.querySelector(".dropdown-menu", _d);

	setTimeout(
		function () {
		const shouldOpen = _d.matches(":hover");
		_m.classList.toggle("show", shouldOpen);
		_d.classList.toggle("show", shouldOpen);

		_d.setAttribute("aria-expanded", shouldOpen);
		},
		e.type === "mouseleave" ? 300 : 0
	);
}

// On hover
const dropdownCheck = document.querySelector('.dropdown');

if (dropdownCheck !== null) { 
	document.querySelector(".dropdown").addEventListener("mouseleave", toggleDropdown);
	document.querySelector(".dropdown").addEventListener("mouseover", toggleDropdown);

	// On click
	document.querySelector(".dropdown").addEventListener("click", (e) => {
		const _d = e.target.closest(".dropdown");
		let _m = document.querySelector(".dropdown-menu", _d);
		if (_d.classList.contains("show")) {
			_m.classList.remove("show");
			_d.classList.remove("show");
		} else {
			_m.classList.add("show");
			_d.classList.add("show");
		}
	});
}
  

/* Card Slider - Swiper */
var cardSlider = new Swiper('.card-slider', {
	autoplay: {
		delay: 4000,
		disableOnInteraction: false
	},
	loop: true,
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev'
	}
});


/* Filter - Isotope */
const gridCheck = document.querySelector('.grid');

if (gridCheck !== null) { 
	// init Isotope
	var iso = new Isotope( '.grid', {
		itemSelector: '.element-item',
		layoutMode: 'fitRows'
	});

	// bind filter button click
	var filtersElem = document.querySelector('.filters-button-group');
	filtersElem.addEventListener( 'click', function( event ) {
		// only work with buttons
		if ( !matchesSelector( event.target, 'button' ) )  {
			return;
		}
		var filterValue = event.target.getAttribute('data-filter');
		// use matching filter function
		iso.arrange({ filter: filterValue });
	});
	
	// change is-checked class on buttons
	var buttonGroups = document.querySelectorAll('.button-group');
	for ( var i=0, len = buttonGroups.length; i < len; i++ ) {
		var buttonGroup = buttonGroups[i];
		radioButtonGroup( buttonGroup );
	}
	
	function radioButtonGroup( buttonGroup ) {
		buttonGroup.addEventListener( 'click', function( event ) {
			// only work with buttons
			if ( !matchesSelector( event.target, 'button' ) )  {
				return;
			}
			buttonGroup.querySelector('.is-checked').classList.remove('is-checked');
			event.target.classList.add('is-checked');
		});
	}
}


/* Back To Top Button */
// Get the button
myButton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
function scrollFunctionBTT() {
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
		myButton.style.display = "block";
	} else {
		myButton.style.display = "none";
	}
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
	document.body.scrollTop = 0; // for Safari
	document.documentElement.scrollTop = 0; // for Chrome, Firefox, IE and Opera
}


// HERO INFO CAROUSEL (standalone controller)
(function () {
  const CAROUSEL_SELECTOR = '#heroInfoCarousel';
  const ROTATE_CLASS = 'rotating';
  const ROTATE_DURATION = 850; // must match CSS animation duration in ms
  const AUTO_INTERVAL = 5000;  // 5 seconds

  const carousel = document.querySelector(CAROUSEL_SELECTOR);
  if (!carousel) return;

  const items = Array.from(carousel.querySelectorAll('.carousel-item'));
  if (!items.length) return;

  const prevBtn = carousel.querySelector('.carousel-control-prev');
  const nextBtn = carousel.querySelector('.carousel-control-next');

  // Ensure exactly one active item on init
  let current = items.findIndex(it => it.classList.contains('active'));
  if (current === -1) {
    current = 0;
    items.forEach((it, i) => it.classList.toggle('active', i === 0));
  }

  // Clean helper to set active slide
  function showIndex(idx) {
    idx = (idx + items.length) % items.length;
    items.forEach((it, i) => {
      if (i === idx) {
        it.classList.add('active');
      } else {
        it.classList.remove('active');
      }
    });
    current = idx;
  }

  // Start a rotate animation, change slide, then remove rotating flag after animation
  function goToIndexWithRotate(nextIndex) {
    // If already rotating, ignore to avoid overlapping animations
    if (carousel.classList.contains(ROTATE_CLASS)) {
      // still allow immediate show (prevents user feeling click is ignored)
      showIndex(nextIndex);
      return;
    }

    // Add rotating class (CSS does the spin)
    carousel.classList.add(ROTATE_CLASS);

    // Immediately switch slide (CSS transition/opacity handles visibility)
    showIndex(nextIndex);

    // Remove rotating class after animation completes
    setTimeout(() => {
      carousel.classList.remove(ROTATE_CLASS);
    }, ROTATE_DURATION + 20);
  }

  function next() {
    goToIndexWithRotate((current + 1) % items.length);
  }
  function prev() {
    goToIndexWithRotate((current - 1 + items.length) % items.length);
  }

  // Auto-advance timer
  let autoTimer = setInterval(next, AUTO_INTERVAL);

  // Pause on hover, resume on leave
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoTimer);
    autoTimer = null;
  });
  carousel.addEventListener('mouseleave', () => {
    if (autoTimer) return;
    autoTimer = setInterval(next, AUTO_INTERVAL);
  });

  // Prev/Next button handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.preventDefault();
      prev();
      // restart auto timer so users have full interval after manual action
      if (autoTimer) { clearInterval(autoTimer); autoTimer = setInterval(next, AUTO_INTERVAL); }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      next();
      if (autoTimer) { clearInterval(autoTimer); autoTimer = setInterval(next, AUTO_INTERVAL); }
    });
  }

  // Optional: keyboard left/right arrow control when carousel is focused
  carousel.setAttribute('tabindex', '-1'); // ensure focusable
  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); }
    else if (e.key === 'ArrowRight') { next(); }
  });

})();


document.addEventListener('DOMContentLoaded', () => {
  initContinuousImageSlider('#image-slider .slider-track', {
    speed: 80 // pixels per second
  });

  initTestimonialsCarousel({
    viewport: '#testimonials-slider',
    trackSelector: '.testimonials-track',
    slideSelector: '.testimonial-slide',
    prevBtn: '.test-btn.prev',
    nextBtn: '.test-btn.next',
    autoplay: true,
    autoplayDelay: 3500
  });
});

/* =====================================================
   Continuous image slider (JS-driven)
   - clones content until track width >= viewportWidth * 2
   - uses requestAnimationFrame for smooth movement
   - resets transform when half width passed for seamless loop
   ===================================================== */
function initContinuousImageSlider(trackSelector, opts = {}) {
  const speed = opts.speed || 60; // px per second
  const track = document.querySelector(trackSelector);
  if (!track) return;

  const viewport = track.parentElement;
  let items = Array.from(track.children);

  // ensure enough content: duplicate until track width >= viewport width * 2
  function ensureEnough() {
    const vpW = viewport.clientWidth;
    let trackW = track.scrollWidth;
    let cloneIndex = 0;
    while (trackW < vpW * 2) {
      const clone = items[cloneIndex % items.length].cloneNode(true);
      track.appendChild(clone);
      items.push(clone);
      cloneIndex++;
      trackW = track.scrollWidth;
      // safety break
      if (cloneIndex > 50) break;
    }
  }

  ensureEnough();

  // animation state
  let pos = 0;
  let rafId = null;
  let lastTime = null;
  const halfWidth = track.scrollWidth / 2;

  function step(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000; // seconds
    lastTime = timestamp;
    pos -= speed * dt; // moving left
    // when we've moved past half the (duplicated) content, reset pos
    if (Math.abs(pos) >= halfWidth) {
      pos += halfWidth; // reset by adding halfWidth to continue loop seamlessly
    }
    track.style.transform = `translateX(${pos}px)`;
    rafId = requestAnimationFrame(step);
  }

  // pause/resume on hover/focus
  function start() {
    if (!rafId) {
      lastTime = null;
      rafId = requestAnimationFrame(step);
    }
  }
  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      lastTime = null;
    }
  }

  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', start);

  // re-run ensure on resize (debounced)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // remove clones we added, keep original set (assume first N children are originals)
      // safest approach: if many children > initial count, re-create track content from original first set
      // we detect original count by using dataset or initial copy; simplest: do nothing heavy, just ensureEnough again.
      ensureEnough();
    }, 220);
  });

  start();
}

/* =====================================================
   Testimonials carousel (finite slides, loop using clones)
   - clones first and last slides for seamless loop
   - supports prev/next and autoplay
   - handles transitionend to jump without animation when reaching clones
   ===================================================== */
function initTestimonialsCarousel(opts = {}) {
  const viewport = document.querySelector(opts.viewport);
  if (!viewport) return;
  const track = viewport.querySelector(opts.trackSelector || '.testimonials-track');
  const slideSelector = opts.slideSelector || '.testimonial-slide';
  const prevBtn = document.querySelector(opts.prevBtn);
  const nextBtn = document.querySelector(opts.nextBtn);
  const autoplay = opts.autoplay ?? true;
  const autoplayDelay = opts.autoplayDelay || 3000;

  let slides = Array.from(track.querySelectorAll(slideSelector));
  if (!slides.length) return;

  // Clone first and last for looping
  const firstClone = slides[0].cloneNode(true);
  const lastClone  = slides[slides.length - 1].cloneNode(true);
  firstClone.classList.add('clone');
  lastClone.classList.add('clone');

  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  // Refresh slides list after clones
  slides = Array.from(track.querySelectorAll(slideSelector));
  let index = 1; // we start at real first (after lastClone)
  const slideWidth = slides[index].offsetWidth + parseFloat(getComputedStyle(track).gap || 20);

  // Set initial transform to show the first real slide
  function updateTrackPosition(transition = true) {
    if (!transition) track.style.transition = 'none';
    else track.style.transition = 'transform 450ms cubic-bezier(.2,.9,.3,1)';
    const offset = -index * (slides[index].offsetWidth + gap());
    track.style.transform = `translateX(${offset}px)`;
    if (!transition) {
      // force reflow so subsequent transitions apply
      void track.offsetWidth;
      track.style.transition = '';
    }
  }

  function gap() {
    const g = getComputedStyle(track).gap;
    return g ? parseFloat(g) : 20;
  }

  // On next
  function next() {
    if (track.isAnimating) return;
    track.isAnimating = true;
    index++;
    updateTrackPosition(true);
  }
  function prev() {
    if (track.isAnimating) return;
    track.isAnimating = true;
    index--;
    updateTrackPosition(true);
  }

  // When transition ends, handle clones
  track.addEventListener('transitionend', () => {
    track.isAnimating = false;
    const current = track.querySelectorAll(slideSelector)[index];
    if (current && current.classList.contains('clone')) {
      // Jump to the corresponding real slide without animation
      if (index === 0) {
        // we moved to lastClone -> jump to last real
        index = slides.length - 2;
      } else if (index === slides.length - 1) {
        // we moved to firstClone -> jump to first real
        index = 1;
      }
      updateTrackPosition(false);
    }
  });

  // Prev/Next button handlers
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); next(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prev(); startAutoplay(); });

  // Autoplay
  let autoplayTimer = null;
  function startAutoplay() {
    if (!autoplay) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      next();
    }, autoplayDelay);
  }
  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Touch support (swipe)
  let startX = 0, dx = 0, isTouching = false;
  viewport.addEventListener('touchstart', (e) => {
    stopAutoplay();
    isTouching = true;
    startX = e.touches[0].clientX;
    track.style.transition = 'none';
  }, { passive: true });
  viewport.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    dx = e.touches[0].clientX - startX;
    const base = -index * (slides[index].offsetWidth + gap());
    track.style.transform = `translateX(${base + dx}px)`;
  }, { passive: true });
  viewport.addEventListener('touchend', () => {
    if (!isTouching) return;
    isTouching = false;
    const threshold = (slides[index].offsetWidth || 200) * 0.2;
    if (dx > threshold) {
      prev();
    } else if (dx < -threshold) {
      next();
    } else {
      updateTrackPosition(true);
    }
    dx = 0;
    startAutoplay();
  });

  // init sizing on load & resize
  function recalc() {
    // ensure we position correctly: recompute index offset
    updateTrackPosition(false);
  }
  window.addEventListener('resize', () => {
    // slight delay for resize stabilization
    setTimeout(recalc, 120);
  });

  // initialize
  recalc();
  startAutoplay();

  // Pause autoplay on hover & focus
  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('focusin', stopAutoplay);
  viewport.addEventListener('focusout', startAutoplay);
}