document.addEventListener("DOMContentLoaded", async function () {

    

    const API_KEY = "b07ac7b3d2cf22b2cd9f00b55e52e7d2";
    const API_URL = "https://api.themoviedb.org/3";


   

    const movieFrame = document.getElementById("movieFrame");
    const movieTitle = document.getElementById("movieTitle");
    const serversContainer = document.getElementById("serversContainer");


    

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");


   

    function getAutoServers(id) {

        return {

            "سيرفر 1 (VidSrc)":
                `https://vidsrc.me/embed/movie?tmdb=${id}`,

            "سيرفر 2 (VidSrc.in)":
                `https://vidsrc.in/embed/movie/${id}`,

            "سيرفر 3 (VidSrc.pm)":
                `https://vidsrc.pm/embed/movie/${id}`,

            "سيرفر 4 (VidLink)":
                `https://vidlink.pro/movie/${id}`,

            "سيرفر 5 (AutoEmbed)":
                `https://player.autoembed.cc/embed/movie/${id}`

        };

    }


   

    async function fetchMovieDetailsFromTMDB(id) {

        try {

            const response = await fetch(
                `${API_URL}/movie/${encodeURIComponent(id)}?api_key=${API_KEY}&language=ar-SA`
            );


            if (!response.ok) {

                throw new Error(
                    `TMDB Error: ${response.status}`
                );

            }


            const data = await response.json();


            
            const title =
                data.title ||
                data.original_title ||
                "فيلم بدون عنوان";


            
            const year =
                data.release_date
                    ? data.release_date.substring(0, 4)
                    : "";


            return {

                title:
                    `مشاهدة فيلم: ${title}${year ? ` (${year})` : ""}`,

                servers:
                    getAutoServers(id)

            };

        }


        catch (error) {

            console.error(
                "TMDB Error:",
                error
            );


            

            return {

                title: "مشاهدة الفيلم",

                servers:
                    getAutoServers(id)

            };

        }

    }


    

    function getServerIcon(name) {

        const lower =
            name.toLowerCase();


        if (lower.includes("youtube")) {

            return "fa-brands fa-youtube";

        }


        if (lower.includes("vidsrc")) {

            return "fa-solid fa-bolt";

        }


        if (lower.includes("vidlink")) {

            return "fa-solid fa-link";

        }


        if (lower.includes("autoembed")) {

            return "fa-solid fa-play-circle";

        }


        if (lower.includes("archive")) {

            return "fa-solid fa-box-archive";

        }


        return "fa-solid fa-film";

    }


    

    function renderServerButtons(servers) {

        if (!serversContainer) {

            return;

        }


        
        serversContainer.innerHTML = "";


        const serverNames =
            Object.keys(servers);


        serverNames.forEach(
            function (name, index) {


                
                const button =
                    document.createElement("button");


                button.type =
                    "button";


                
                button.className =
                    `server-btn ${index === 0 ? "active" : ""}`;


                
                const iconClass =
                    getServerIcon(name);


                
                button.innerHTML = `
                    <i class="${iconClass}"></i>
                    <span>${name}</span>
                `;


                
                button.addEventListener(
                    "click",
                    function () {


                        const serverUrl =
                            servers[name];


                        if (!serverUrl) {

                            return;

                        }


                        if (!movieFrame) {

                            return;

                        }


                        
                        movieFrame.src =
                            serverUrl;


                       
                        document
                            .querySelectorAll(
                                "#serversContainer button"
                            )
                            .forEach(
                                function (btn) {

                                    btn.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        
                        button.classList.add(
                            "active"
                        );

                    }
                );


                // إضافة الزر للصفحة
                serversContainer.appendChild(
                    button
                );

            }
        );

    }



    async function initWatchPage() {


    

        if (!movieId) {


            if (movieTitle) {

                movieTitle.textContent =
                    "عفواً، لم يتم تحديد الفيلم المطلوب للمشاهدة";

            }


            if (movieFrame) {

                movieFrame.style.display =
                    "none";

                movieFrame.removeAttribute(
                    "src"
                );

            }


            if (serversContainer) {

                serversContainer.innerHTML =
                    "";

            }


            return;

        }


     

        const currentMovieData =
            await fetchMovieDetailsFromTMDB(
                movieId
            );


      

        if (movieTitle) {

            movieTitle.textContent =
                currentMovieData.title;

        }


    

        const serverNames =
            Object.keys(
                currentMovieData.servers
            );


        const firstServerKey =
            serverNames[0];


        const firstServerUrl =
            currentMovieData.servers[
                firstServerKey
            ];


       

        if (
            movieFrame &&
            firstServerUrl
        ) {

            movieFrame.src =
                firstServerUrl;


            movieFrame.style.display =
                "block";

        }



        renderServerButtons(
            currentMovieData.servers
        );

    }


  

    initWatchPage();

});