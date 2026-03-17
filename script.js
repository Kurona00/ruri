document.addEventListener('DOMContentLoaded', () => {

    // Custom Cursor
    const cursorGlow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        // Request animation frame for smooth performance
        requestAnimationFrame(() => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Scroll Reveals
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Parallax effect on Hero Canvas
    const heroCanvas = document.getElementById('hero-canvas');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if(scrolled < window.innerHeight && heroCanvas) {
            // Slight translate down for pure parallax
            heroCanvas.style.transform = `scale(1.05) translateY(${scrolled * 0.3}px)`;
        }
    });

    // Image Sequence Animation
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        const frameCount = 288;
        const frames = [];
        let imagesLoaded = 0;
        let currentFrame = 0;
        const fps = 24;
        const fpsInterval = 1000 / fps;
        let then = Date.now();

        function animateSequence() {
            requestAnimationFrame(animateSequence);
            const now = Date.now();
            const elapsed = now - then;

            if (elapsed > fpsInterval) {
                then = now - (elapsed % fpsInterval);
                ctx.drawImage(frames[currentFrame], 0, 0, heroCanvas.width, heroCanvas.height);
                currentFrame = (currentFrame + 1) % frameCount;
            }
        }

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const index = i.toString().padStart(3, '0');
            img.src = `assets/hero-frames/ezgif-frame-${index}.webp`;
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === 1) {
                    heroCanvas.width = img.width;
                    heroCanvas.height = img.height;
                }
                if (imagesLoaded === frameCount) {
                    animateSequence();
                }
            };
            frames.push(img);
        }
    }

    // Tabs Logic for Commissions
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Back to top functionality
    const backToTopBtn = document.getElementById('back-to-top');
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile Menu Toggle (Basic implementation for completeness)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    let menuOpen = false;

    mobileMenuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if(menuOpen) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(3, 3, 5, 0.95)';
            navLinks.style.padding = '2rem';
            navLinks.style.backdropFilter = 'blur(10px)';
            
            // Transform bars to X
            mobileMenuBtn.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            mobileMenuBtn.children[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            navLinks.style.display = 'none';
            // Reset bars
            mobileMenuBtn.children[0].style.transform = 'none';
            mobileMenuBtn.children[1].style.transform = 'none';
        }
    });
    
    // For resizing window back to desktop size
    window.addEventListener('resize', () => {
        if(window.innerWidth > 768) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'row';
            navLinks.style.position = 'static';
            navLinks.style.background = 'transparent';
            navLinks.style.padding = '0';
            menuOpen = false;
            mobileMenuBtn.children[0].style.transform = 'none';
            mobileMenuBtn.children[1].style.transform = 'none';
        } else if(!menuOpen) {
            navLinks.style.display = 'none';
        }
    });

    // Initial Trigger for heroic fade elements that might already be in viewport
    // Initial Trigger for heroic fade elements that might already be in viewport
    setTimeout(() => {
        const heroReveals = document.querySelectorAll('.hero .reveal');
        heroReveals.forEach(el => el.classList.add('active'));
    }, 100);

    // Fetch Latest Videos Locally (Driven by GitHub Action Autonomous Updates)
    async function fetchLatestVideos() {
        const container = document.getElementById('latest-transmissions-grid');
        if (!container) return;

        try {
            const response = await fetch('assets/latest_videos.json');
            if (!response.ok) throw new Error("Local Data Error");
            
            const videos = await response.json();
            
            if (videos && videos.length >= 3) {
                // Clear the skeleton placeholders
                container.innerHTML = '';
                
                const classes = ['item-main', 'item-sub-1', 'item-sub-2'];
                const delays = ['', 'delay-1', 'delay-2'];
                const fades = ['fade-up', 'fade-left', 'fade-right'];

                for (let i = 0; i < 3; i++) {
                    const video = videos[i];
                    
                    // Create element structure
                    const link = document.createElement('a');
                    link.href = video.url;
                    link.target = "_blank";
                    link.className = `gallery-item ${classes[i]} reveal ${fades[i]} ${delays[i]}`;
                    
                    link.innerHTML = `
                        <div class="image-wrapper">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <div class="item-overlay"></div>
                        </div>
                        <div class="item-info">
                            <h3 style="font-size: 1.2rem; margin-bottom: 0.2rem; white-space: normal;">${video.title}</h3>
                            <span class="tag">WATCH VIDEO</span>
                        </div>
                    `;
                    
                    container.appendChild(link);
                }
                
                // Re-observe the new dynamically injected elements
                const newReveals = container.querySelectorAll('.reveal');
                newReveals.forEach(el => revealObserver.observe(el));
            }

        } catch (error) {
            console.error('Failed to load local video data.', error);
        }
    }

    fetchLatestVideos();

});
