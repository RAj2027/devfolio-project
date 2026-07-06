import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';
import 'remixicon/fonts/remixicon.css';
import { initTextRoll } from './animations/textRoll.js';
import { initProjectsHover, initProfileHover } from './animations/imageHover.js';

console.log("Script loaded successfully");

const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
});

const cursor = document.querySelector("#cursor");
let timeout;
let lastX = 0, lastY = 0;
let cursorHoverScale = 1; // overall scale when hovering projects

function updateCursor(x, y, xscale = 1, yscale = 1) {
    const overall = cursorHoverScale || 1;
    cursor.style.transform = `translate(calc(${x}px - 80%), calc(${y}px - 80%)) scale(${overall * xscale}, ${overall * yscale})`;
}

function cursorSquisher() {
    let xscale = 1;
    let yscale = 1;
    let xprev = 0;
    let yprev = 0;
    let isMoving = false;

    document.addEventListener("mousemove", function (e) {
        // Clear any pending reset
        clearTimeout(timeout);

        // Get current mouse position
        const x = e.clientX;
        const y = e.clientY;

        // Calculate displacement
        const displaceX = Math.abs(x - xprev);
        const displaceY = Math.abs(y - yprev);

        // Update previous position
        xprev = x;
        yprev = y;
        // store last known cursor position for hover updates
        lastX = x;
        lastY = y;

        // Calculate scale based on movement direction
        // Stretch in the direction of movement
        const xSpeed = Math.min(displaceX, 15);
        const ySpeed = Math.min(displaceY, 15);

        // Calculate scales - shrink in the direction of movement
        const xScale = 1 - ySpeed * 0.04;
        const yScale = 1 - xSpeed * 0.04;

        // Apply scaling in the direction of movement
        updateCursor(x, y, xScale, yScale);

        // Set a timeout to reset scale when movement stops
        timeout = setTimeout(() => {
            updateCursor(x, y, 1, 1);
        }, 50); // Shorter delay for more responsive feel
    });
}

// Initialize cursor functionality
cursorSquisher();

// Initialize text roll animations
initTextRoll();

// Fix anchor links when using LocomotiveScroll (smooth scroller uses transforms)
// Intercept clicks on in-page anchors and use LocomotiveScroll.scrollTo
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // allow external or empty anchors to behave normally
        if (!href || href === '#') {
            e.preventDefault();
            // scroll to top
            if (typeof scroll !== 'undefined' && scroll.scrollTo) {
                scroll.scrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            // update hash without jumping
            history.pushState(null, '', '#');
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            if (typeof scroll !== 'undefined' && scroll.scrollTo) {
                scroll.scrollTo(target);
            } else {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            // update address bar hash
            history.pushState(null, '', href);
        }
    });
});



// Menu toggle and navigation controls
const menuToggle = document.querySelector('#menu');
const menuLinks = document.querySelector('.menu');

function openMenu() {
    if (menuLinks && !menuLinks.classList.contains('is-open')) {
        menuLinks.classList.add('is-open');
        if (menuToggle) {
            menuToggle.textContent = 'CLOSE';
            delete menuToggle.dataset.textRollInit;
            initTextRoll();
        }
    }
}

function closeMenu() {
    if (menuLinks && menuLinks.classList.contains('is-open')) {
        menuLinks.classList.remove('is-open');
        if (menuToggle) {
            menuToggle.textContent = 'MENU+';
            delete menuToggle.dataset.textRollInit;
            initTextRoll();
        }
    }
}

function toggleMenu() {
    if (menuLinks && menuLinks.classList.contains('is-open')) {
        closeMenu();
    } else {
        openMenu();
    }
}

// Override global onclickMenu to avoid inline attribute conflict
window.onclickMenu = toggleMenu;

if (menuToggle && menuLinks) {
    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when a navigation link is clicked
    menuLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when Escape key is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}




// Initialize image hover effects (Projects & Profile)
initProjectsHover((scale) => {
    cursorHoverScale = scale;
    updateCursor(lastX, lastY);
});

initProfileHover((scale) => {
    cursorHoverScale = scale;
    updateCursor(lastX, lastY);
});

// On load, clear any fragment and ensure the page starts at top
window.addEventListener('DOMContentLoaded', () => {
  if (location.hash) {
    // remove the fragment without adding a history entry
    history.replaceState(null, '', location.pathname + location.search);
    // ensure viewport at top
    if (typeof scroll !== 'undefined' && scroll.scrollTo) {
      try { scroll.scrollTo(0); } catch (err) { /* ignore */ }
    } else {
      window.scrollTo(0, 0);
    }
  }
});

