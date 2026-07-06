import gsap from 'gsap';

/**
 * Initializes GSAP staggered text roll hover animations on all elements matching `.text-roll` or `[data-text-roll]`.
 */
export function initTextRoll() {
    const elements = document.querySelectorAll('.text-roll, [data-text-roll]');
    elements.forEach(el => {
        if (el.dataset.textRollInit) return;
        el.dataset.textRollInit = "true";
        
        setupTextRollElement(el);
    });
}

/**
 * Sets up the DOM structure and GSAP timeline for a single target element.
 * Recursively preserves child elements (like <h3>, <span>, etc.) while wrapping text nodes.
 * @param {HTMLElement} el 
 */
function setupTextRollElement(el) {
    // 1. Save original text for screen reader accessibility
    const originalText = el.innerText || el.textContent || '';
    el.setAttribute('aria-label', originalText.replace(/\s+/g, ' ').trim());

    // 2. Recursively process text nodes inside el without removing HTML tag hierarchy (e.g. <h3> inside <a>)
    wrapTextNodes(el);
    
    // 3. Create GPU-accelerated GSAP timeline across all character spans found in DOM order
    const tops = el.querySelectorAll('.roll-char-top');
    const bottoms = el.querySelectorAll('.roll-char-bottom');
    
    if (tops.length === 0 || bottoms.length === 0) return;

    gsap.set(bottoms, { yPercent: 100 });
    gsap.set(tops, { yPercent: 0 });
    
    const tl = gsap.timeline({ paused: true });
    
    tl.to(tops, {
        yPercent: -100,
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.025
    }, 0);
    
    tl.to(bottoms, {
        yPercent: 0,
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.025
    }, 0);
    
    // 4. Attach hover listeners to trigger smooth animation
    el.addEventListener('mouseenter', () => {
        tl.play();
    });
    el.addEventListener('mouseleave', () => {
        tl.reverse();
    });
}

/**
 * Recursively traverses a node to find and wrap text nodes in character roll spans,
 * preserving line breaks (<br>) and element structures (<h3>, <span>, etc.).
 * @param {Node} node
 */
function wrapTextNodes(node) {
    const childNodes = Array.from(node.childNodes);
    
    childNodes.forEach((child, idx) => {
        if (child.nodeType === Node.TEXT_NODE) {
            let text = child.textContent || '';
            // Only process if it contains actual non-whitespace text
            if (text.trim().length > 0) {
                // Check if we should trim leading/trailing whitespace around <br> or element boundaries
                if (idx === 0 || (idx > 0 && childNodes[idx - 1].nodeName === 'BR')) {
                    text = text.trimStart();
                }
                if (idx === childNodes.length - 1 || (idx < childNodes.length - 1 && childNodes[idx + 1].nodeName === 'BR')) {
                    text = text.trimEnd();
                }
                
                const wrapper = document.createElement('span');
                wrapper.setAttribute('aria-hidden', 'true');
                wrapper.className = 'text-roll-wrapper';
                
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    const charSpan = document.createElement('span');
                    charSpan.className = 'roll-char';
                    if (char === ' ') {
                        charSpan.classList.add('roll-space');
                    }
                    
                    const topSpan = document.createElement('span');
                    topSpan.className = 'roll-char-top';
                    topSpan.textContent = char === ' ' ? '\u00A0' : char;
                    
                    const bottomSpan = document.createElement('span');
                    bottomSpan.className = 'roll-char-bottom';
                    bottomSpan.textContent = char === ' ' ? '\u00A0' : char;
                    
                    charSpan.appendChild(topSpan);
                    charSpan.appendChild(bottomSpan);
                    wrapper.appendChild(charSpan);
                }
                
                node.replaceChild(wrapper, child);
            }
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR' && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && !child.classList.contains('text-roll-wrapper')) {
            wrapTextNodes(child);
        }
    });
}
