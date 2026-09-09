const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";

const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";


document.addEventListener("DOMContentLoaded", () => {

    const uploadButton = document.getElementById("uploadButton");
    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");


    if (!uploadButton || !photoInput || !photoGrid) {
        console.error("Photo elements not found.");
        return;
    }


    // ==========================================
    // LOAD MEMORIES FROM DATABASE
    // ==========================================

    async function loadMemories() {

        console.log("Loading memories...");

        try {

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/memories?select=id,file_name,created_at&order=created_at.asc`,
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
                    "DATABASE LOAD ERROR:",
                    response.status,
                    errorText
                );

                return;
            }


            const memories = await response.json();

            console.log("Memories found:", memories);


            // Clear the grid before loading
            photoGrid.innerHTML = "";


            memories.forEach(memory => {

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(memory.file_name)}`;

                displayPhoto(photoURL);

            });


        } catch (error) {

            console.error(
                "MEMORY LOAD FAILED:",
                error
            );

        }
    }


    // Load photos immediately
    loadMemories();


    // ==========================================
    // OPEN PHOTO PICKER
    // ==========================================

    uploadButton.addEventListener("click", () => {

        photoInput.click();

    });


    // ==========================================
    // UPLOAD PHOTOS
    // ==========================================

    photoInput.addEventListener("change", async (event) => {

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
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}-${file.name}`;


            try {

                console.log("Uploading:", file.name);


                // ==================================
                // 1. UPLOAD PHOTO TO STORAGE
                // ==================================

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
                        "STORAGE ERROR:",
                        uploadResponse.status,
                        errorText
                    );

                    throw new Error(
                        "Photo upload failed."
                    );
                }


                console.log(
                    "Photo uploaded to Storage."
                );


                // ==================================
                // 2. SAVE PHOTO IN DATABASE
                // ==================================

                const databaseResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/memories`,
                    {
                        method: "POST",

                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
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
                        "DATABASE SAVE ERROR:",
                        databaseResponse.status,
                        errorText
                    );

                    throw new Error(
                        "Photo information could not be saved."
                    );
                }


                const savedMemory =
                    await databaseResponse.json();


                console.log(
                    "Database record created:",
                    savedMemory
                );


                // ==================================
                // 3. DISPLAY PHOTO
                // ==================================

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;


                displayPhoto(photoURL);


            } catch (error) {

                console.error(
                    "UPLOAD PROCESS FAILED:",
                    error
                );

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

        const photo =
            document.createElement("div");

        photo.className =
            "memory-photo";


        const image =
            document.createElement("img");

        image.src =
            photoURL;

        image.alt =
            "Our memory";


        photo.appendChild(image);

        photoGrid.appendChild(photo);

    }

});
