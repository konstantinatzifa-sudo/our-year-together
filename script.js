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

    loadMemories();

    // --------------------------------
    // LOAD SAVED PHOTOS
    // --------------------------------

    async function loadMemories() {
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
                console.error("DATABASE LOAD ERROR:", errorText);
                return;
            }

            const memories = await response.json();

            console.log("Memories found:", memories);

            photoGrid.innerHTML = "";

            memories.forEach(memory => {
                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(memory.file_name)}`;

                displayPhoto(
                    photoURL,
                    memory.id,
                    memory.file_name
                );
            });

        } catch (error) {
            console.error("MEMORY LOAD FAILED:", error);
        }
    }

    // --------------------------------
    // OPEN PHOTO UPLOADER
    // --------------------------------

    uploadButton.addEventListener("click", () => {
        photoInput.click();
    });

    // --------------------------------
    // UPLOAD PHOTOS
    // --------------------------------

    photoInput.addEventListener("change", async (event) => {
        const files = Array.from(event.target.files);

        if (files.length === 0) return;

        for (const file of files) {

            if (!file.type.startsWith("image/")) {
                alert(`${file.name} is not an image.`);
                continue;
            }

            const fileName =
                `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

            try {

                console.log("Uploading:", file.name);

                // Upload image to Supabase Storage
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
                    const errorText = await uploadResponse.text();

                    console.error(
                        "STORAGE ERROR:",
                        uploadResponse.status,
                        errorText
                    );

                    throw new Error("Photo upload failed.");
                }

                console.log("Photo uploaded to Storage.");

                // Save photo information in database
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
                    const errorText = await databaseResponse.text();

                    console.error(
                        "DATABASE SAVE ERROR:",
                        databaseResponse.status,
                        errorText
                    );

                    throw new Error(
                        "Photo information could not be saved."
                    );
                }

                const savedMemory = await databaseResponse.json();

                const memoryID = savedMemory[0].id;

                console.log("Memory saved:", memoryID);

                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;

                displayPhoto(
                    photoURL,
                    memoryID,
                    fileName
                );

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

        // Reset input so the same photo can be selected again
        photoInput.value = "";
    });

    // --------------------------------
    // DISPLAY PHOTO
    // --------------------------------

    function displayPhoto(photoURL, memoryID, fileName) {

        const photo = document.createElement("div");
        photo.className = "memory-photo";

        // Image
        const image = document.createElement("img");

        image.src = photoURL;
        image.alt = "Our memory";

        photo.appendChild(image);

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-photo";
        deleteButton.type = "button";
        deleteButton.innerHTML = "×";
        deleteButton.title = "Delete photo";

        deleteButton.addEventListener("click", async () => {

            const confirmed = confirm(
                "Are you sure you want to delete this photo?"
            );

            if (!confirmed) return;

            deleteButton.disabled = true;
            deleteButton.innerHTML = "…";

            try {

                // --------------------------------
                // DELETE FROM STORAGE
                // --------------------------------

                const storageResponse = await fetch(
                    `${SUPABASE_URL}/storage/v1/object/photos/${encodeURIComponent(fileName)}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${SUPABASE_KEY}`,
                            "apikey": SUPABASE_KEY
                        }
                    }
                );

                if (!storageResponse.ok) {

                    const errorText =
                        await storageResponse.text();

                    console.error(
                        "STORAGE DELETE ERROR:",
                        storageResponse.status,
                        errorText
                    );

                    throw new Error(
                        "Could not delete photo from Storage."
                    );
                }

                console.log("Photo deleted from Storage.");

                // --------------------------------
                // DELETE FROM DATABASE
                // --------------------------------

                const databaseResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/memories?id=eq.${memoryID}`,
                    {
                        method: "DELETE",
                        headers: {
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );

                if (!databaseResponse.ok) {

                    const errorText =
                        await databaseResponse.text();

                    console.error(
                        "DATABASE DELETE ERROR:",
                        databaseResponse.status,
                        errorText
                    );

                    throw new Error(
                        "Could not delete photo information."
                    );
                }

                console.log("Memory deleted from database.");

                // Remove photo from page
                photo.remove();

            } catch (error) {

                console.error(
                    "DELETE FAILED:",
                    error
                );

                alert(
                    "We couldn't delete this photo. Please try again."
                );

                deleteButton.disabled = false;
                deleteButton.innerHTML = "×";
            }
        });

        photo.appendChild(deleteButton);

        photoGrid.appendChild(photo);
    }
});
