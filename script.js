const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";


document.addEventListener("DOMContentLoaded", () => {

    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");

    if (!photoInput || !photoGrid) {
        console.error("Photo elements not found.");
        return;
    }


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
                            "Content-Type": file.type,
                            "x-upsert": "false"
                        },
                        body: file
                    }
                );


                const responseText = await response.text();

                console.log("Supabase status:", response.status);
                console.log("Supabase response:", responseText);


                if (!response.ok) {
                    throw new Error(
                        `Supabase returned ${response.status}: ${responseText}`
                    );
                }


                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;

                displayPhoto(photoURL);

            } catch (error) {

                console.error("UPLOAD ERROR:", error);

                alert(
                    `Upload failed.\n\n${error.message}`
                );
            }
        }

        photoInput.value = "";
    });


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
