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
                    throw new Error("Upload failed");
                }

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;

                displayPhoto(photoURL);

            } catch (error) {

                console.error(error);

                alert(
                    `We couldn't upload ${file.name}. Please try again.`
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
