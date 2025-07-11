// Auto-sliding destination images with responsive design
document.addEventListener('DOMContentLoaded', () => {
    // Destination Slider
    const destinationImages = document.querySelectorAll('.destination-img');
    const destinationPrevBtn = document.querySelector('.destination-section .nav-arrow.prev');
    const destinationNextBtn = document.querySelector('.destination-section .nav-arrow.next');
    const destinationSlider = document.querySelector('.destination-images');
    const destinationDotsContainer = document.querySelector('.destination-section .slider-dots');
    
    if (!destinationImages.length || !destinationPrevBtn || !destinationNextBtn || !destinationSlider || !destinationDotsContainer) {
        console.warn('Destination slider elements not found');
    } else {
        let destinationCurrentIndex = 0;
        let destinationSlideWidth = 0;
        let destinationVisibleCount = 3;
        let destinationAutoPlayInterval;
        let destinationIsAutoPlaying = true;

        function calculateDestinationSliderValues() {
            const screenWidth = window.innerWidth;
            const img = destinationImages[0];
            const computedStyle = window.getComputedStyle(img);
            const imgWidth = parseInt(computedStyle.width);
            const gap = parseInt(window.getComputedStyle(destinationSlider).gap) || 15;
            
            destinationSlideWidth = imgWidth + gap;
            
            if (screenWidth <= 480) {
                destinationVisibleCount = 2;
            } else if (screenWidth <= 768) {
                destinationVisibleCount = 2;
            } else if (screenWidth <= 992) {
                destinationVisibleCount = 3;
            } else {
                destinationVisibleCount = 3;
            }
        }

        function updateDestinationSlider() {
            calculateDestinationSliderValues();
            const maxIndex = Math.max(0, destinationImages.length - destinationVisibleCount);
            destinationCurrentIndex = Math.min(maxIndex, destinationCurrentIndex);
            const translateX = -(destinationCurrentIndex * destinationSlideWidth);
            destinationSlider.style.transform = `translateX(${translateX}px)`;
            
            updateDestinationDots();
        }

        function slideDestinationNext() {
            const maxIndex = Math.max(0, destinationImages.length - destinationVisibleCount);
            if (destinationCurrentIndex < maxIndex) {
                destinationCurrentIndex++;
            } else {
                destinationCurrentIndex = 0;
            }
            updateDestinationSlider();
        }

        function slideDestinationPrev() {
            if (destinationCurrentIndex > 0) {
                destinationCurrentIndex--;
            } else {
                destinationCurrentIndex = Math.max(0, destinationImages.length - destinationVisibleCount);
            }
            updateDestinationSlider();
        }

        function startDestinationAutoPlay() {
            if (destinationAutoPlayInterval) return;
            destinationAutoPlayInterval = setInterval(() => {
                if (destinationIsAutoPlaying) {
                    slideDestinationNext();
                }
            }, 3000);
        }

        function stopDestinationAutoPlay() {
            if (destinationAutoPlayInterval) {
                clearInterval(destinationAutoPlayInterval);
                destinationAutoPlayInterval = null;
            }
        }

        function pauseDestinationAutoPlay() {
            destinationIsAutoPlaying = false;
        }

        function resumeDestinationAutoPlay() {
            destinationIsAutoPlaying = true;
        }

        function initDestinationDots() {
            const totalSlides = Math.ceil(destinationImages.length / destinationVisibleCount);
            destinationDotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                dot.addEventListener('click', () => {
                    destinationCurrentIndex = i * destinationVisibleCount;
                    updateDestinationSlider();
                    pauseDestinationAutoPlay();
                    setTimeout(resumeDestinationAutoPlay, 5000);
                });
                destinationDotsContainer.appendChild(dot);
            }
            updateDestinationDots();
        }

        function updateDestinationDots() {
            const dots = destinationDotsContainer.querySelectorAll('.slider-dot');
            const totalSlides = Math.ceil(destinationImages.length / destinationVisibleCount);
            const activeIndex = Math.min(Math.floor(destinationCurrentIndex / destinationVisibleCount), totalSlides - 1);
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }

        destinationPrevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            slideDestinationPrev();
            pauseDestinationAutoPlay();
            setTimeout(resumeDestinationAutoPlay, 5000);
        });

        destinationNextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            slideDestinationNext();
            pauseDestinationAutoPlay();
            setTimeout(resumeDestinationAutoPlay, 5000);
        });

        let destinationStartX = 0;
        let destinationCurrentX = 0;
        let destinationIsDragging = false;
        let destinationStartTime = 0;

        destinationSlider.addEventListener('touchstart', (e) => {
            destinationStartX = e.touches[0].clientX;
            destinationStartTime = Date.now();
            destinationIsDragging = true;
            pauseDestinationAutoPlay();
        });

        destinationSlider.addEventListener('touchmove', (e) => {
            if (!destinationIsDragging) return;
            destinationCurrentX = e.touches[0].clientX;
            e.preventDefault();
        });

        destinationSlider.addEventListener('touchend', () => {
            if (!destinationIsDragging) return;
            destinationIsDragging = false;
            const deltaX = destinationStartX - destinationCurrentX;
            const deltaTime = Date.now() - destinationStartTime;
            const velocity = Math.abs(deltaX) / deltaTime;
            const threshold = 50;
            if (Math.abs(deltaX) > threshold || velocity > 0.5) {
                if (deltaX > 0) {
                    slideDestinationNext();
                } else {
                    slideDestinationPrev();
                }
            }
            setTimeout(resumeDestinationAutoPlay, 3000);
        });

        destinationSlider.addEventListener('mouseenter', pauseDestinationAutoPlay);
        destinationSlider.addEventListener('mouseleave', resumeDestinationAutoPlay);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                slideDestinationPrev();
                pauseDestinationAutoPlay();
                setTimeout(resumeDestinationAutoPlay, 5000);
            } else if (e.key === 'ArrowRight') {
                slideDestinationNext();
                pauseDestinationAutoPlay();
                setTimeout(resumeDestinationAutoPlay, 5000);
            }
        });

        let destinationResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(destinationResizeTimeout);
            destinationResizeTimeout = setTimeout(() => {
                initDestinationDots();
                updateDestinationSlider();
            }, 250);
        });

        const destinationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startDestinationAutoPlay();
                } else {
                    stopDestinationAutoPlay();
                }
            });
        });

        destinationObserver.observe(destinationSlider);

        calculateDestinationSliderValues();
        initDestinationDots();
        updateDestinationSlider();
        startDestinationAutoPlay();

        window.addEventListener('beforeunload', () => {
            stopDestinationAutoPlay();
            destinationObserver.disconnect();
        });
    }

    // Featured Packages Slider
    const packageImages = document.querySelectorAll('.featured-packages-section .package-img');
    const packagePrevBtn = document.querySelector('.featured-packages-section .nav-arrow.prev');
    const packageNextBtn = document.querySelector('.featured-packages-section .nav-arrow.next');
    const packageSlider = document.querySelector('.featured-packages-section .package-images');
    const packageDotsContainer = document.querySelector('.featured-packages-section .slider-dots');
    
    if (!packageImages.length || !packagePrevBtn || !packageNextBtn || !packageSlider || !packageDotsContainer) {
        console.warn('Featured Packages slider elements not found');
    } else {
        let packageCurrentIndex = 0;
        let packageSlideWidth = 0;
        let packageVisibleCount = 3;
        let packageAutoPlayInterval;
        let packageIsAutoPlaying = true;

        function calculatePackageSliderValues() {
            const screenWidth = window.innerWidth;
            const img = packageImages[0];
            const computedStyle = window.getComputedStyle(img);
            const imgWidth = parseInt(computedStyle.width);
            const gap = parseInt(window.getComputedStyle(packageSlider).gap) || 15;
            
            packageSlideWidth = imgWidth + gap;
            
            if (screenWidth <= 480) {
                packageVisibleCount = 1;
            } else if (screenWidth <= 768) {
                packageVisibleCount = 2;
            } else if (screenWidth <= 992) {
                packageVisibleCount = 2;
            } else {
                packageVisibleCount = 3;
            }
        }

        function updatePackageSlider() {
            calculatePackageSliderValues();
            const maxIndex = Math.max(0, packageImages.length - packageVisibleCount);
            packageCurrentIndex = Math.min(maxIndex, packageCurrentIndex);
            const translateX = -(packageCurrentIndex * packageSlideWidth);
            packageSlider.style.transform = `translateX(${translateX}px)`;
            
            updatePackageDots();
        }

        function slidePackageNext() {
            const maxIndex = Math.max(0, packageImages.length - packageVisibleCount);
            if (packageCurrentIndex < maxIndex) {
                packageCurrentIndex++;
            } else {
                packageCurrentIndex = 0;
            }
            updatePackageSlider();
        }

        function slidePackagePrev() {
            if (packageCurrentIndex > 0) {
                packageCurrentIndex--;
            } else {
                packageCurrentIndex = Math.max(0, packageImages.length - packageVisibleCount);
            }
            updatePackageSlider();
        }

        function startPackageAutoPlay() {
            if (packageAutoPlayInterval) return;
            packageAutoPlayInterval = setInterval(() => {
                if (packageIsAutoPlaying) {
                    slidePackageNext();
                }
            }, 3000);
        }

        function stopPackageAutoPlay() {
            if (packageAutoPlayInterval) {
                clearInterval(packageAutoPlayInterval);
                packageAutoPlayInterval = null;
            }
        }

        function pausePackageAutoPlay() {
            packageIsAutoPlaying = false;
        }

        function resumePackageAutoPlay() {
            packageIsAutoPlaying = true;
        }

        function initPackageDots() {
            const totalSlides = Math.ceil(packageImages.length / packageVisibleCount);
            packageDotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                dot.addEventListener('click', () => {
                    packageCurrentIndex = i * packageVisibleCount;
                    updatePackageSlider();
                    pausePackageAutoPlay();
                    setTimeout(resumePackageAutoPlay, 5000);
                });
                packageDotsContainer.appendChild(dot);
            }
            updatePackageDots();
        }

        function updatePackageDots() {
            const dots = packageDotsContainer.querySelectorAll('.slider-dot');
            const totalSlides = Math.ceil(packageImages.length / packageVisibleCount);
            const activeIndex = Math.min(Math.floor(packageCurrentIndex / packageVisibleCount), totalSlides - 1);
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }

        packagePrevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            slidePackagePrev();
            pausePackageAutoPlay();
            setTimeout(resumePackageAutoPlay, 5000);
        });

        packageNextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            slidePackageNext();
            pausePackageAutoPlay();
            setTimeout(resumePackageAutoPlay, 5000);
        });

        let packageStartX = 0;
        let packageCurrentX = 0;
        let packageIsDragging = false;
        let packageStartTime = 0;

        packageSlider.addEventListener('touchstart', (e) => {
            packageStartX = e.touches[0].clientX;
            packageStartTime = Date.now();
            packageIsDragging = true;
            pausePackageAutoPlay();
        });

        packageSlider.addEventListener('touchmove', (e) => {
            if (!packageIsDragging) return;
            packageCurrentX = e.touches[0].clientX;
            e.preventDefault();
        });

        packageSlider.addEventListener('touchend', () => {
            if (!packageIsDragging) return;
            packageIsDragging = false;
            const deltaX = packageStartX - packageCurrentX;
            const deltaTime = Date.now() - packageStartTime;
            const velocity = Math.abs(deltaX) / deltaTime;
            const threshold = 50;
            if (Math.abs(deltaX) > threshold || velocity > 0.5) {
                if (deltaX > 0) {
                    slidePackageNext();
                } else {
                    slidePackagePrev();
                }
            }
            setTimeout(resumePackageAutoPlay, 3000);
        });

        packageSlider.addEventListener('mouseenter', pausePackageAutoPlay);
        packageSlider.addEventListener('mouseleave', resumePackageAutoPlay);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                slidePackagePrev();
                pausePackageAutoPlay();
                setTimeout(resumePackageAutoPlay, 5000);
            } else if (e.key === 'ArrowRight') {
                slidePackageNext();
                pausePackageAutoPlay();
                setTimeout(resumePackageAutoPlay, 5000);
            }
        });

        let packageResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(packageResizeTimeout);
            packageResizeTimeout = setTimeout(() => {
                initPackageDots();
                updatePackageSlider();
            }, 250);
        });

        const packageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startPackageAutoPlay();
                } else {
                    stopPackageAutoPlay();
                }
            });
        });

        packageObserver.observe(packageSlider);

        calculatePackageSliderValues();
        initPackageDots();
        updatePackageSlider();
        startPackageAutoPlay();

        window.addEventListener('beforeunload', () => {
            stopPackageAutoPlay();
            packageObserver.disconnect();
        });
    }

    // Explore More Packages Slider
    const explorePackageImages = document.querySelectorAll('.explore-packages-section .package-img');
    const explorePackagePrevBtn = document.querySelector('.explore-packages-section .nav-arrow.prev');
    const explorePackageNextBtn = document.querySelector('.explore-packages-section .nav-arrow.next');
    const explorePackageSlider = document.querySelector('.explore-packages-section .package-images');
    const explorePackageDotsContainer = document.querySelector('.explore-packages-section .slider-dots');
    
    if (!explorePackageImages.length || !explorePackagePrevBtn || !explorePackageNextBtn || !explorePackageSlider || !explorePackageDotsContainer) {
        console.warn('Explore More Packages slider elements not found');
    } else {
        let explorePackageCurrentIndex = 0;
        let explorePackageSlideWidth = 0;
        let explorePackageVisibleCount = 3;
        let explorePackageAutoPlayInterval;
        let explorePackageIsAutoPlaying = true;

        function calculateExplorePackageSliderValues() {
            const screenWidth = window.innerWidth;
            const img = explorePackageImages[0];
            const computedStyle = window.getComputedStyle(img);
            const imgWidth = parseInt(computedStyle.width);
            const gap = parseInt(window.getComputedStyle(explorePackageSlider).gap) || 15;
            
            explorePackageSlideWidth = imgWidth + gap;
            
            if (screenWidth <= 480) {
                explorePackageVisibleCount = 1;
            } else if (screenWidth <= 768) {
                explorePackageVisibleCount = 2;
            } else if (screenWidth <= 992) {
                explorePackageVisibleCount = 2;
            } else {
                explorePackageVisibleCount = 3;
            }
        }

        function updateExplorePackageSlider() {
            calculateExplorePackageSliderValues();
            const maxIndex = Math.max(0, explorePackageImages.length - explorePackageVisibleCount);
            explorePackageCurrentIndex = Math.min(maxIndex, explorePackageCurrentIndex);
            const translateX = -(explorePackageCurrentIndex * explorePackageSlideWidth);
            explorePackageSlider.style.transform = `translateX(${translateX}px)`;
            
            updateExplorePackageDots();
        }

        function slideExplorePackageNext() {
            const maxIndex = Math.max(0, explorePackageImages.length - explorePackageVisibleCount);
            if (explorePackageCurrentIndex < maxIndex) {
                explorePackageCurrentIndex++;
            } else {
                explorePackageCurrentIndex = 0;
            }
            updateExplorePackageSlider();
        }

        function slideExplorePackagePrev() {
            if (explorePackageCurrentIndex > 0) {
                explorePackageCurrentIndex--;
            } else {
                explorePackageCurrentIndex = Math.max(0, explorePackageImages.length - explorePackageVisibleCount);
            }
            updateExplorePackageSlider();
        }

        function startExplorePackageAutoPlay() {
            if (explorePackageAutoPlayInterval) return;
            explorePackageAutoPlayInterval = setInterval(() => {
                if (explorePackageIsAutoPlaying) {
                    slideExplorePackageNext();
                }
            }, 3000);
        }

        function stopExplorePackageAutoPlay() {
            if (explorePackageAutoPlayInterval) {
                clearInterval(explorePackageAutoPlayInterval);
                explorePackageAutoPlayInterval = null;
            }
        }

        function pauseExplorePackageAutoPlay() {
            explorePackageIsAutoPlaying = false;
        }

        function resumeExplorePackageAutoPlay() {
            explorePackageIsAutoPlaying = true;
        }

        function initExplorePackageDots() {
            const totalSlides = Math.ceil(explorePackageImages.length / explorePackageVisibleCount);
            explorePackageDotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                dot.addEventListener('click', () => {
                    explorePackageCurrentIndex = i * explorePackageVisibleCount;
                    updateExplorePackageSlider();
                    pauseExplorePackageAutoPlay();
                    setTimeout(resumeExplorePackageAutoPlay, 5000);
                });
                explorePackageDotsContainer.appendChild(dot);
            }
            updateExplorePackageDots();
        }

        function updateExplorePackageDots() {
            const dots = explorePackageDotsContainer.querySelectorAll('.slider-dot');
            const totalSlides = Math.ceil(explorePackageImages.length / explorePackageVisibleCount);
            const activeIndex = Math.min(Math.floor(explorePackageCurrentIndex / explorePackageVisibleCount), totalSlides - 1);
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }

        explorePackagePrevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            slideExplorePackagePrev();
            pauseExplorePackageAutoPlay();
            setTimeout(resumeExplorePackageAutoPlay, 5000);
        });

        explorePackageNextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            slideExplorePackageNext();
            pauseExplorePackageAutoPlay();
            setTimeout(resumeExplorePackageAutoPlay, 5000);
        });

        let explorePackageStartX = 0;
        let explorePackageCurrentX = 0;
        let explorePackageIsDragging = false;
        let explorePackageStartTime = 0;

        explorePackageSlider.addEventListener('touchstart', (e) => {
            explorePackageStartX = e.touches[0].clientX;
            explorePackageStartTime = Date.now();
            explorePackageIsDragging = true;
            pauseExplorePackageAutoPlay();
        });

        explorePackageSlider.addEventListener('touchmove', (e) => {
            if (!explorePackageIsDragging) return;
            explorePackageCurrentX = e.touches[0].clientX;
            e.preventDefault();
        });

        explorePackageSlider.addEventListener('touchend', () => {
            if (!explorePackageIsDragging) return;
            explorePackageIsDragging = false;
            const deltaX = explorePackageStartX - explorePackageCurrentX;
            const deltaTime = Date.now() - explorePackageStartTime;
            const velocity = Math.abs(deltaX) / deltaTime;
            const threshold = 50;
            if (Math.abs(deltaX) > threshold || velocity > 0.5) {
                if (deltaX > 0) {
                    slideExplorePackageNext();
                } else {
                    slideExplorePackagePrev();
                }
            }
            setTimeout(resumeExplorePackageAutoPlay, 3000);
        });

        explorePackageSlider.addEventListener('mouseenter', pauseExplorePackageAutoPlay);
        explorePackageSlider.addEventListener('mouseleave', resumeExplorePackageAutoPlay);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                slideExplorePackagePrev();
                pauseExplorePackageAutoPlay();
                setTimeout(resumeExplorePackageAutoPlay, 5000);
            } else if (e.key === 'ArrowRight') {
                slideExplorePackageNext();
                pauseExplorePackageAutoPlay();
                setTimeout(resumeExplorePackageAutoPlay, 5000);
            }
        });

        let explorePackageResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(explorePackageResizeTimeout);
            explorePackageResizeTimeout = setTimeout(() => {
                initExplorePackageDots();
                updateExplorePackageSlider();
            }, 250);
        });

        const explorePackageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startExplorePackageAutoPlay();
                } else {
                    stopExplorePackageAutoPlay();
                }
            });
        });

        explorePackageObserver.observe(explorePackageSlider);

        calculateExplorePackageSliderValues();
        initExplorePackageDots();
        updateExplorePackageSlider();
        startExplorePackageAutoPlay();

        window.addEventListener('beforeunload', () => {
            stopExplorePackageAutoPlay();
            explorePackageObserver.disconnect();
        });
    }
});