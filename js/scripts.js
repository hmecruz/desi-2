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
