const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";

document.addEventListener("DOMContentLoaded", () => {

    const uploadButton = document.getElementById("uploadButton");
    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");

    console.log("Website JavaScript loaded");

    if (!uploadButton || !photoInput || !photoGrid) {
        console.error("Memory upload elements not found.");
        return;
    }

    uploadButton.addEventListener("click", () => {
        console.log("Upload button clicked");
        photoInput.click();
    });

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
                    `${SUPABASE_URL}/storage/v1/object/photos/${fileName}`,
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
                    const errorText = await uploadResponse.text();
                    console.error(errorText);
                    throw new Error("Upload failed");
                }

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;

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

        photo.innerHTML = `
            <img src="${photoURL}" alt="Our memory">
        `;

        photoGrid.appendChild(photo);
    }

});
