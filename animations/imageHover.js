import gsap from 'gsap';

/**
 * Reusable helper function for floating image hover animations.
 * Encapsulates GSAP timeline logic, cursor tracking, easing, velocity calculations,
 * interpolation, and rotation clamping.
 * 
 * @param {HTMLElement} containerEl - The element being hovered
 * @param {HTMLElement} imgEl - The floating image element to animate
 * @param {Object} options - Configuration options
 */
export function setupFloatingImageHover(containerEl, imgEl, options = {}) {
    const config = {
        positionMode: 'relative', // 'relative' for projekts, 'fixed' for profile pop-up
        hoverScale: 1.03,
        initialScale: 1,
        outScale: 1,
        duration: 0.55,
        outDuration: 0.6,
        rotateFactor: 0.2,
        maxRotate: 8,
        ease: 'power3.out',
        onMouseEnter: null,
        onMouseLeave: null,
        ...options
    };

    let prevMouseX = 0;

    // Initialize so GSAP uses percent-based centering
    gsap.set(imgEl, { xPercent: -50, yPercent: -50, scale: config.initialScale });

    containerEl.addEventListener('mouseenter', (e) => {
        prevMouseX = e.clientX;
        if (config.onMouseEnter) {
            config.onMouseEnter(e);
        }
        // If fixed/viewport positioning (profile pop-up), immediately place at mouse and animate in
        if (config.positionMode === 'fixed') {
            gsap.to(imgEl, {
                opacity: 1,
                x: e.clientX,
                y: e.clientY,
                scale: config.hoverScale,
                duration: config.duration,
                ease: config.ease,
                overwrite: 'auto'
            });
        }
    });

    containerEl.addEventListener('mouseleave', (e) => {
        if (config.onMouseLeave) {
            config.onMouseLeave(e);
        }
        gsap.to(imgEl, {
            opacity: 0,
            scale: config.outScale,
            rotate: 0,
            duration: config.outDuration,
            ease: config.ease,
            overwrite: 'auto'
        });
    });

    containerEl.addEventListener('mousemove', (e) => {
        let targetX = e.clientX;
        let targetY = e.clientY;

        if (config.positionMode === 'relative') {
            const rect = containerEl.getBoundingClientRect();
            targetX = e.clientX - rect.left;
            targetY = e.clientY - rect.top;
        }

        const rot_diff = e.clientX - prevMouseX;
        prevMouseX = e.clientX;

        gsap.to(imgEl, {
            opacity: 1,
            x: targetX,
            y: targetY,
            scale: config.hoverScale,
            // Slower, subtler rotation and reduced max angle
            rotate: gsap.utils.clamp(-config.maxRotate, config.maxRotate, rot_diff * config.rotateFactor),
            // Slower follow for a smoother, less snappy feel
            duration: config.duration,
            ease: config.ease,
            overwrite: 'auto'
        });
    });
}

/**
 * Initialize Projects section image hover animation
 */
export function initProjectsHover(onHoverChange) {
    document.querySelectorAll('.projekts').forEach(projekts => {
        const img = projekts.querySelector('img');
        if (!img) return;

        setupFloatingImageHover(projekts, img, {
            positionMode: 'relative',
            hoverScale: 1.03,
            initialScale: 1,
            outScale: 1,
            duration: 0.55,
            outDuration: 0.6,
            rotateFactor: 0.2,
            maxRotate: 8,
            ease: 'power3.out',
            onMouseEnter: () => onHoverChange && onHoverChange(2),
            onMouseLeave: () => onHoverChange && onHoverChange(1),
        });
    });
}

/**
 * Initialize Profile Picture hover pop-up animation in About Me section
 */
export function initProfileHover(onHoverChange) {
    const profilePicContainer = document.querySelector('#profile-pic');
    if (!profilePicContainer) return;

    const originalImg = profilePicContainer.querySelector('img');
    if (!originalImg) return;

    // Create a larger floating version using profile.jpeg specifically for hover preview
    const floatingImg = document.createElement('img');
    floatingImg.src = './Assets/profile.webp';
    floatingImg.className = 'floating-profile-img';
    floatingImg.alt = 'Floating Profile Pop-up';
    document.body.appendChild(floatingImg);

    setupFloatingImageHover(profilePicContainer, floatingImg, {
        positionMode: 'fixed',
        hoverScale: 1,
        initialScale: 0.9,
        outScale: 0.9,
        duration: 0.55,
        outDuration: 0.6,
        rotateFactor: 0.2,
        maxRotate: 8,
        ease: 'power3.out',
        onMouseEnter: () => {
            if (onHoverChange) onHoverChange(2);
            const cursorEl = document.querySelector('#cursor');
            if (cursorEl) {
                cursorEl.classList.add('cursor-profile-hover');
            }
        },
        onMouseLeave: () => {
            if (onHoverChange) onHoverChange(1);
            const cursorEl = document.querySelector('#cursor');
            if (cursorEl) {
                cursorEl.classList.remove('cursor-profile-hover');
            }
        },
    });
}
