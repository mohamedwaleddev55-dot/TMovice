document.addEventListener("DOMContentLoaded", function () {

    const API_KEY = "b07ac7b3d2cf22b2cd9f00b55e52e7d2";
    const API_URL = "https://api.themoviedb.org/3";
    const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const categories = {
        "action.html": { genre: 28, title: "Action" },
        "anime.html": { genre: 16, title: "Anime" },
        "romance.html": { genre: 10749, title: "Romance" },
        "horror.html": { genre: 27, title: "Horror" },
        "historical.html": { genre: 36, title: "Historical" },
        "historic.html": { genre: 36, title: "Historical" }
    };

    const category = categories[currentPage];

    if (!category) {
        console.error("Page not found:", currentPage);
        return;
    }

    async function getMovies(sortBy, extraParams = "") {
        try {
            const url =
                `${API_URL}/discover/movie` +
                `?api_key=${API_KEY}` +
                `&language=ar-SA` +
                `&region=EG` +
                `&include_adult=false` +
                `&with_genres=${category.genre}` +
                `&sort_by=${sortBy}` +
                `&page=1` +
                extraParams;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`TMDB Error: ${response.status}`);
            }

            const data = await response.json();
            return data.results || [];

        } catch (error) {
            console.error("Error fetching movies:", error);
            return [];
        }
    }

    function removeDuplicates(movies) {
        const ids = new Set();
        return movies.filter(function (movie) {
            if (ids.has(movie.id)) return false;
            ids.add(movie.id);
            return true;
        });
    }

    function removeExcludedMovies(movies) {
        return movies.filter(function (movie) {
            const title = movie.title || movie.original_title || "";
            return title.toLowerCase() !== "no mires para abajo";
        });
    }

    function createMovieCard(movie) {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";

        const poster = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : "https://via.placeholder.com/500x750?text=No+Image";

        const title = movie.title || movie.original_title || "Untitled";
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
        const year = movie.release_date ? movie.release_date.substring(0, 4) : "";

        const overview = movie.overview && movie.overview.trim() !== ""
            ? (movie.overview.length > 70 ? movie.overview.substring(0, 70) + "..." : movie.overview)
            : "لا يوجد وصف متاح لهذا الفيلم حالياً.";

        slide.innerHTML = `
            <div class="movie-card" data-movie-id="${movie.id}">
                <div class="img-box">
                    <span class="rating-tag">
                        <i class="fa-solid fa-star"></i> ${rating}
                    </span>
                    <img src="${poster}" alt="${title}" loading="lazy">
                </div>

                <div class="info">
                    <div class="title" title="${title}">${title}</div>
                    <div class="meta">
                        <span>${category.title}</span>
                        <span>${year}</span>
                    </div>
                    <p class="overview-text">${overview}</p>
                </div>
            </div>
        `;

        return slide;
    }

    function initializeSwiper(swiperElement, movies) {
        if (typeof Swiper === "undefined") {
            console.error("Swiper is not loaded!");
            return;
        }

        new Swiper(swiperElement, {
            slidesPerView: 4,
            spaceBetween: 20,
            loop: movies.length > 4,
            navigation: {
                nextEl: swiperElement.querySelector(".swiper-button-next"),
                prevEl: swiperElement.querySelector(".swiper-button-prev")
            },
            breakpoints: {
                320: { slidesPerView: 1, spaceBetween: 10 },
                576: { slidesPerView: 2, spaceBetween: 15 },
                992: { slidesPerView: 3, spaceBetween: 20 },
                1200: { slidesPerView: 4, spaceBetween: 20 }
            }
        });
    }

    function fillSwiper(swiperElement, movies) {
        const wrapper = swiperElement.querySelector(".swiper-wrapper");
        if (!wrapper) return;

        wrapper.innerHTML = "";

        movies.forEach(function (movie) {
            const card = createMovieCard(movie);
            wrapper.appendChild(card);
        });

        if (movies.length > 0) {
            initializeSwiper(swiperElement, movies);
            animateMovieCards();
        }
    }

    function showLoading() {
        const sliders = document.querySelectorAll(".category-swiper");
        sliders.forEach(function (slider) {
            const wrapper = slider.querySelector(".swiper-wrapper");
            if (wrapper) {
                wrapper.innerHTML = `
                    <div style="color:white; text-align:center; width:100%; padding:40px; font-size:18px;">
                        Loading movies...
                    </div>
                `;
            }
        });
    }

    function showNoMovies(slider) {
        const wrapper = slider.querySelector(".swiper-wrapper");
        if (wrapper) {
            wrapper.innerHTML = `
                <div style="color:white; text-align:center; width:100%; padding:40px; font-size:18px;">
                    No movies found.
                </div>
            `;
        }
    }

    async function loadMovies() {
        const sliders = document.querySelectorAll(".category-swiper");
        if (!sliders.length) return;

        showLoading();

        const popularMovies = await getMovies("popularity.desc", "&vote_count.gte=10");
        const newestMovies = await getMovies("primary_release_date.desc", "&vote_count.gte=10");
        const topRatedMovies = await getMovies("vote_average.desc", "&vote_count.gte=50");

        const allMovies = removeExcludedMovies(
            removeDuplicates([...popularMovies, ...newestMovies, ...topRatedMovies])
        );

        const movies15 = allMovies.slice(0, 15);

        const slider1Movies = movies15.slice(0, 5);
        const slider2Movies = movies15.slice(5, 10);
        const slider3Movies = movies15.slice(10, 15);

        if (sliders[0]) {
            slider1Movies.length ? fillSwiper(sliders[0], slider1Movies) : showNoMovies(sliders[0]);
        }
        if (sliders[1]) {
            slider2Movies.length ? fillSwiper(sliders[1], slider2Movies) : showNoMovies(sliders[1]);
        }
        if (sliders[2]) {
            slider3Movies.length ? fillSwiper(sliders[2], slider3Movies) : showNoMovies(sliders[2]);
        }

        if (currentPage === "anime.html" && sliders[3]) {
            const animeMovies = await getMovies("popularity.desc", "&with_original_language=ja&vote_count.gte=10");
            const animeUnique = removeExcludedMovies(removeDuplicates(animeMovies));
            const animeFive = animeUnique.slice(0, 5);
            animeFive.length ? fillSwiper(sliders[3], animeFive) : showNoMovies(sliders[3]);
        }
    }

    document.addEventListener("click", function (event) {
        const card = event.target.closest(".movie-card");
        if (!card) return;

        const movieId = card.getAttribute("data-movie-id");
        if (movieId) {
            window.location.href = `watch.html?id=${movieId}`;
        }
    });

    loadMovies();

    function initGSAPAnimations() {
        if (typeof gsap === "undefined") return;

        if (typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }

        const navbar = document.querySelector("nav, .navbar, .main-navbar, header");
        if (navbar) {
            gsap.fromTo(navbar, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });

            const navLinks = navbar.querySelectorAll("a, .nav-link");
            if (navLinks.length) {
                gsap.fromTo(navLinks, { y: -20, opacity: 0 }, {
                    y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.25, ease: "power2.out"
                });

                navLinks.forEach(function (link) {
                    link.addEventListener("mouseenter", function () {
                        gsap.to(link, { y: -3, scale: 1.05, duration: 0.2, ease: "power2.out", overwrite: true });
                    });
                    link.addEventListener("mouseleave", function () {
                        gsap.to(link, { y: 0, scale: 1, duration: 0.2, ease: "power2.out", overwrite: true });
                    });
                });
            }
        }

        const sections = document.querySelectorAll(".movie-section, .category-section");
        sections.forEach(function (section) {
            const title = section.querySelector("h2, h3, .section-title, .category-title");
            if (!title) return;

            if (typeof ScrollTrigger !== "undefined") {
                gsap.fromTo(title, { x: 50, opacity: 0 }, {
                    x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: section, start: "top 85%", once: true }
                });
            }
        });

        animateMovieCards();
    }

    function animateMovieCards() {
        if (typeof gsap === "undefined") return;

        const cards = document.querySelectorAll(".movie-card");
        if (!cards.length) return;

        cards.forEach(function (card) {
            if (card.dataset.gsapReady === "true") return;
            card.dataset.gsapReady = "true";

            if (typeof ScrollTrigger !== "undefined") {
                gsap.fromTo(card, 
                    { y: 50, opacity: 0, scale: 0.95 },
                    {
                        y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out",
                        scrollTrigger: { trigger: card, start: "top 90%", once: true }
                    }
                );
            }

            const image = card.querySelector(".img-box img");
            const rating = card.querySelector(".rating-tag");

            card.addEventListener("mouseenter", function () {
                gsap.to(card, { y: -8, scale: 1.03, duration: 0.25, ease: "power2.out", overwrite: true });
                if (image) gsap.to(image, { scale: 1.08, duration: 0.4, ease: "power2.out", overwrite: true });
                if (rating) gsap.to(rating, { scale: 1.1, y: -2, duration: 0.2, ease: "back.out(2)", overwrite: true });
            });

            card.addEventListener("mouseleave", function () {
                gsap.to(card, { y: 0, scale: 1, duration: 0.25, ease: "power2.out", overwrite: true });
                if (image) gsap.to(image, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: true });
                if (rating) gsap.to(rating, { scale: 1, y: 0, duration: 0.2, ease: "power2.out", overwrite: true });
            });
        });
    }

    initGSAPAnimations();
});