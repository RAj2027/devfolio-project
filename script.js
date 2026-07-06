import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';
import 'remixicon/fonts/remixicon.css';
import { initTextRoll } from './animations/textRoll.js';

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



//Menu toggle
const menuToggle = document.querySelector('#menu');
const menuLinks = document.querySelector('.menu');

function onclickMenu() {
    menuToggle.style.display = 'none';
}

if (menuToggle && menuLinks) {
    menuToggle.addEventListener('click', () => {
        menuLinks.classList.toggle('is-open');
    });
}




// Image hover effect 
document.querySelectorAll('.projekts').forEach(projekts => {
    const img = projekts.querySelector('img');
    let prevMouseX = 0;

    // initialize so GSAP uses percent-based centering
    gsap.set(img, { xPercent: -50, yPercent: -50, scale: 1 });

    // scale cursor when hovering this project (simple transform)
    projekts.addEventListener('mouseenter', () => {
        cursorHoverScale = 2;
        // immediately apply to current cursor position
        updateCursor(lastX, lastY);
    });

    projekts.addEventListener('mouseleave', () => {
        cursorHoverScale = 1;
        updateCursor(lastX, lastY);
    });

    projekts.addEventListener('mouseleave', (e) => {
        gsap.to(img, {
            opacity: 0,
            scale: 1,
            rotate: 0,
            duration: 0.6,
            ease: 'power3.out',
        });
    });

    projekts.addEventListener('mousemove', (e) => {


        const rect = projekts.getBoundingClientRect();
        const xRel = e.clientX - rect.left; // x relative to the projekt
        const yRel = e.clientY - rect.top;  // y relative to the projekt

        const rot_diff = e.clientX - prevMouseX;
        prevMouseX = e.clientX;

        gsap.to(img, {
            opacity: 1,
            x: xRel,
            y: yRel,
            scale: 1.03,
            // slower, subtler rotation and reduced max angle
            rotate: gsap.utils.clamp(-8, 8, rot_diff * 0.2),
            // slower follow for a smoother, less snappy feel
            duration: 0.55,
            ease: 'power3.out',
            overwrite: true,
        });
    });
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

