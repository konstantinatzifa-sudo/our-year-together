const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";


document.addEventListener("DOMContentLoaded", () => {

    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");

    if (!photoInput || !photoGrid) {
        console.error("Photo elements not found.");
        return;
    }


    // --------------------------------
    // UPLOAD PHOTOS
    // --------------------------------

    photoInput.addEventListener("change", async (event) => {

        const files = Array.from(event.target.files);

        for (const file of files) {

            if (!file.type.startsWith("image/")) {
                continue;
            }

            const fileName =
                `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

            try {

                const response = await fetch(
                    `${SUPABASE_URL}/storage/v1/object/photos/${encodeURIComponent(fileName)}`,
                    {
                        method: "POST",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "Content-Type": file.type
                        },

                        body: file
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Upload error:", errorText);
                    throw new Error(errorText);
                }

                displayPhoto(fileName);

            } catch (error) {

                console.error("UPLOAD ERROR:", error);

                alert(
                    `We couldn't upload ${file.name}. Please try again.`
                );
            }
        }

        photoInput.value = "";
    });


    // --------------------------------
    // LOAD SAVED PHOTOS
    // --------------------------------

    async function loadPhotos() {

        try {

            const response = await fetch(
                `${SUPABASE_URL}/storage/v1/object/list/photos`,
                {
                    method: "POST",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        prefix: "",
                        limit: 100,
                        offset: 0,
                        sortBy: {
                            column: "created_at",
                            order: "asc"
                        }
                    })
                }
            );


            if (!response.ok) {

                const errorText = await response.text();

                console.error("Load error:", errorText);

                return;
            }


            const photos = await response.json();


            photos.forEach(photo => {

                if (photo.name) {
                    displayPhoto(photo.name);
                }

            });

        } catch (error) {

            console.error("Could not load photos:", error);
        }
    }


    // --------------------------------
    // DISPLAY PHOTO
    // --------------------------------

    function displayPhoto(fileName) {

        const photoURL =
            `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;


        const photo = document.createElement("div");

        photo.className = "memory-photo";


        const image = document.createElement("img");

        image.src = photoURL;
        image.alt = "Our memory";


        photo.appendChild(image);

        photoGrid.appendChild(photo);
    }


    // Load saved memories when page opens
    loadPhotos();

});
