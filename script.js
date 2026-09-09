const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";

// KEEP YOUR REAL PUBLISHABLE KEY HERE
const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";


document.addEventListener("DOMContentLoaded", function () {

    const uploadButton = document.getElementById("uploadButton");
    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");


    if (!uploadButton || !photoInput || !photoGrid) {
        console.error("Photo elements not found.");
        return;
    }


    // ==========================================
    // LOAD SAVED MEMORIES
    // ==========================================

    loadMemories();


    async function loadMemories() {

        try {

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/memories?select=*&order=created_at.asc`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${SUPABASE_KEY}`
                    }
                }
            );


            if (!response.ok) {

                const errorText = await response.text();

                console.error(
                    "Could not load memories:",
                    errorText
                );

                return;
            }


            const memories = await response.json();


            for (const memory of memories) {

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(memory.file_name)}`;

                displayPhoto(photoURL);
            }


        } catch (error) {

            console.error(
                "Error loading memories:",
                error
            );

        }
    }


    // ==========================================
    // OPEN PHOTO PICKER
    // ==========================================

    uploadButton.addEventListener("click", function () {

        photoInput.click();

    });


    // ==========================================
    // UPLOAD PHOTOS
    // ==========================================

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


                // ----------------------------------
                // UPLOAD PHOTO TO STORAGE
                // ----------------------------------

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
                        "Storage upload error:",
                        errorText
                    );

                    throw new Error(errorText);
                }


                // ----------------------------------
                // SAVE PHOTO INFORMATION TO DATABASE
                // ----------------------------------

                const databaseResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/memories`,
                    {
                        method: "POST",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "Content-Type": "application/json",
                            "Prefer": "return=minimal"
                        },

                        body: JSON.stringify({
                            file_name: fileName
                        })
                    }
                );


                if (!databaseResponse.ok) {

                    const errorText =
                        await databaseResponse.text();

                    console.error(
                        "Database error:",
                        errorText
                    );

                    throw new Error(errorText);
                }


                // ----------------------------------
                // DISPLAY PHOTO
                // ----------------------------------

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;


                displayPhoto(photoURL);


                console.log(
                    "Memory saved successfully:",
                    file.name
                );


            } catch (error) {

                console.error(error);

                alert(
                    `We couldn't save ${file.name}. Please try again.`
                );

            }

        }


        photoInput.value = "";

    });


    // ==========================================
    // DISPLAY PHOTO
    // ==========================================

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
