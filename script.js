document.addEventListener("DOMContentLoaded", async function () {

    const API_KEY = "b07ac7b3d2cf22b2cd9f00b55e52e7d2";
    const API_URL = "https://api.themoviedb.org/3";
    const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

   
    if (typeof gsap !== "undefined") {
        const navTL = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

        navTL.from(".navbar", {
            y: -100,
            opacity: 0
        })
        .from(".navbar-brand, .navbar-toggler", {
            opacity: 0,
            scale: 0.8,
            duration: 0.5
        }, "-=0.4")
        .from(".navbar-nav .nav-item, .nav1", {
            opacity: 0,
            y: -20,
            stagger: 0.1
        }, "-=0.3")
        .from(".search-bar", {
            opacity: 0,
            x: 30,
            duration: 0.6
        }, "-=0.5");

        
        document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
            link.addEventListener("mouseenter", () => {
                gsap.to(link, { y: -3, duration: 0.2, ease: "power1.out" });
            });
            
            link.addEventListener("mouseleave", () => {
                gsap.to(link, { y: 0, duration: 0.2, ease: "power1.out" });
            });
        });

        const avatar = document.querySelector("#navbarDropdownMenuAvatar img");
        if (avatar) {
            avatar.addEventListener("mouseenter", () => gsap.to(avatar, { scale: 1.1, duration: 0.3 }));
            avatar.addEventListener("mouseleave", () => gsap.to(avatar, { scale: 1, duration: 0.3 }));
        }
    }

   
    function initCardHoverAnimations() {
        if (typeof gsap === "undefined") return;
        const cards = document.querySelectorAll(".movie-card");

        cards.forEach((card) => {
            if (card.dataset.hoverInit) return; 
            card.dataset.hoverInit = "true";

            const img = card.querySelector("img");
            const rating = card.querySelector(".rating-tag");

            card.addEventListener("mouseenter", () => {
                gsap.to(card, { y: -8, scale: 1.03, boxShadow: "0px 12px 25px rgba(0, 0, 0, 0.5)", duration: 0.3, ease: "power2.out" });
                if (img) gsap.to(img, { scale: 1.1, duration: 0.3, ease: "power2.out" });
                if (rating) gsap.to(rating, { scale: 1.15, rotation: -5, duration: 0.3, ease: "power2.out" });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(card, { y: 0, scale: 1, boxShadow: "none", duration: 0.3, ease: "power2.out" });
                if (img) gsap.to(img, { scale: 1, duration: 0.3, ease: "power2.out" });
                if (rating) gsap.to(rating, { scale: 1, rotation: 0, duration: 0.3, ease: "power2.out" });
            });
        });
    }

   
    if (document.querySelector(".main-hero-swiper")) {
        new Swiper(".main-hero-swiper", {
            loop: true,
            effect: "fade",
            autoplay: {
                delay: 4000,
                disableOnInteraction: false
            },
            pagination: {
                el: ".main-hero-swiper .swiper-pagination",
                clickable: true
            },
            navigation: {
                nextEl: ".main-hero-swiper .swiper-button-next",
                prevEl: ".main-hero-swiper .swiper-button-prev"
            }
        });
    }

    
    async function getMovies(type) {
        let url = "";

        if (type === "latest") {
            url = `${API_URL}/movie/now_playing?api_key=${API_KEY}&language=ar-SA&region=EG&page=1`;
        } else if (type === "popular") {
            url = `${API_URL}/movie/popular?api_key=${API_KEY}&language=ar-SA&region=EG&page=1`;
        } else if (type === "top") {
            url = `${API_URL}/movie/top_rated?api_key=${API_KEY}&language=ar-SA&region=EG&page=1`;
        } else {
            throw new Error("نوع الأفلام غير معروف");
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB Error: ${response.status}`);
        }

        const data = await response.json();
        return data.results.filter(movie => movie.poster_path);
    }

    
    const genres = {
        28: "أكشن", 12: "مغامرة", 16: "أنيميشن", 35: "كوميدي",
        80: "جريمة", 18: "دراما", 14: "فانتازيا", 27: "رعب",
        9648: "غموض", 10749: "رومانسي", 878: "خيال علمي",
        53: "إثارة", 10752: "حرب", 37: "غربي"
    };

    
  function createMovieCard(movie) {
    const title = movie.title || movie.original_title || "فيلم بدون اسم";
    const year = movie.release_date ? movie.release_date.substring(0, 4) : "----";
    const rating = typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "0.0";
    
   
    const overview = movie.overview && movie.overview.trim() !== "" 
        ? (movie.overview.length > 70 ? movie.overview.substring(0, 70) + "..." : movie.overview)
        : "لا يوجد وصف متاح لهذا الفيلم حالياً.";

    let movieGenres = [];
    if (movie.genre_ids) {
        movieGenres = movie.genre_ids.map(id => genres[id]).filter(Boolean).slice(0, 2);
    }
    if (movieGenres.length === 0) movieGenres.push("فيلم");

    return `
        <div class="swiper-slide">
            <div class="movie-card" data-movie-id="${movie.id}">
                <div class="img-box">
                    <span class="rating-tag">
                        <i class="fa-solid fa-star"></i> ${rating}
                    </span>
                    <img src="${IMAGE_URL}${movie.poster_path}" alt="${title}" loading="lazy">
                </div>
                <div class="info">
                    <div class="title">${title}</div>
                    <div class="meta">
                        <span>${movieGenres.join(" / ")}</span>
                        <span>${year}</span>
                    </div>
                    
                    <p class="overview-text">${overview}</p>
                </div>
            </div>
        </div>
    `;
}

    
    function displayMovies(selector, movies) {
        const wrapper = document.querySelector(`${selector} .swiper-wrapper`);
        if (!wrapper) {
            console.warn(`لم يتم العثور على: ${selector} .swiper-wrapper`);
            return;
        }
        wrapper.innerHTML = movies.map(movie => createMovieCard(movie)).join("");
    }

    
    function createMovieSlider(selector, nextBtn, prevBtn) {
        const el = document.querySelector(selector);
        if (!el) return null;

        return new Swiper(selector, {
            loop: true,
            grabCursor: true,
            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn
            },
            breakpoints: {
                0: { slidesPerView: 1.2, spaceBetween: 15 },
                480: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1200: { slidesPerView: 4.2, spaceBetween: 25 }
            }
        });
    }

    
    function initScrollAnimations() {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

        
        gsap.utils.toArray(".section-title").forEach((title) => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    once: true
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        
        gsap.utils.toArray(".swiper").forEach((swiperEl) => {
            gsap.from(swiperEl, {
                scrollTrigger: {
                    trigger: swiperEl,
                    start: "top 80%",
                    once: true 
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                onComplete: () => {
                    
                    if (swiperEl.swiper) swiperEl.swiper.update();
                }
            });
        });
    }

    
    try {
        const [latestMovies, popularMovies, topMovies] = await Promise.all([
            getMovies("latest"),
            getMovies("popular"),
            getMovies("top")
        ]);

        displayMovies(".track-swiper-1", latestMovies);
        displayMovies(".track-swiper-2", popularMovies);
        displayMovies(".track-swiper-3", topMovies);

        createMovieSlider(".track-swiper-1", ".btn-next-1", ".btn-prev-1");
        createMovieSlider(".track-swiper-2", ".btn-next-2", ".btn-prev-2");
        createMovieSlider(".track-swiper-3", ".btn-next-3", ".btn-prev-3");

        initCardHoverAnimations();

        
        setTimeout(() => {
            initScrollAnimations();
            ScrollTrigger.refresh();
        }, 100);

        console.log("تم تحميل الأفلام بنجاح 🎬");

    } catch (error) {
        console.error("Movie API Error:", error);
    }

   
    document.addEventListener("click", function (e) {
        const card = e.target.closest(".movie-card");
        if (!card) return;
        const movieId = card.dataset.movieId;
        if (!movieId) return;
        window.location.href = `watch.html?id=${movieId}`;
    });

});