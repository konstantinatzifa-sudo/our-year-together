const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";

// Keep your real publishable key here
const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";


document.addEventListener("DOMContentLoaded", function () {

    const uploadButton = document.getElementById("uploadButton");
    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");

    if (!uploadButton || !photoInput || !photoGrid) {
        console.error("Photo uploader elements were not found.");
        return;
    }


    // --------------------------------
    // LOAD EXISTING PHOTOS
    // --------------------------------

    loadPhotos();


    async function loadPhotos() {

        try {

            const response = await fetch(
                `${SUPABASE_URL}/storage/v1/object/list/photos`,
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Bearer ${SUPABASE_KEY}`,
                        "apikey": SUPABASE_KEY,
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

                console.error(
                    "Could not load photos:",
                    errorText
                );

                return;
            }


            const files = await response.json();


            for (const file of files) {

                if (!file.name) {
                    continue;
                }


                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(file.name)}`;


                displayPhoto(photoURL);
            }


        } catch (error) {

            console.error(
                "Error loading existing photos:",
                error
            );

        }

    }


    // --------------------------------
    // OPEN PHOTO PICKER
    // --------------------------------

    uploadButton.addEventListener("click", function () {

        photoInput.click();

    });


    // --------------------------------
    // UPLOAD NEW PHOTOS
    // --------------------------------

    photoInput.addEventListener("change", async function (event) {

        const files = Array.from(event.target.files);


        if (files.length === 0) {
            return;
        }


        for (const file of files) {

            if (!file.type.startsWith("image/")) {

                alert(`${file.name} is not an image.`);

                continue;
            }


            const fileName =
                Date.now() +
                "-" +
                Math.random().toString(36).substring(2) +
                "-" +
                file.name;


            try {

                console.log("Uploading:", file.name);


                const uploadResponse = await fetch(
                    `${SUPABASE_URL}/storage/v1/object/photos/${encodeURIComponent(fileName)}`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "apikey": SUPABASE_KEY,
                            "Content-Type": file.type
                        },

                        body: file
                    }
                );


                if (!uploadResponse.ok) {

                    const errorText =
                        await uploadResponse.text();

                    console.error(
                        "Supabase upload error:",
                        errorText
                    );

                    throw new Error(errorText);
                }


                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;


                displayPhoto(photoURL);


                console.log(
                    "Uploaded successfully:",
                    file.name
                );


            } catch (error) {

                console.error(error);

                alert(
                    `We couldn't upload ${file.name}. Please try again.`
                );

            }

        }


        photoInput.value = "";

    });


    // --------------------------------
    // DISPLAY PHOTO
    // --------------------------------

    function displayPhoto(photoURL) {

        const photo = document.createElement("div");

        photo.className = "memory-photo";


        const image = document.createElement("img");

        image.src = photoURL;

        image.alt = "Our memory";


        photo.appendChild(image);

        photoGrid.appendChild(photo);

    }

});
