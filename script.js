const SUPABASE_URL = "https://itdlakiwmxpneznqdphn.supabase.co";

// Put your Supabase PUBLISHABLE KEY between the quotation marks
const SUPABASE_KEY = "sb_publishable_9Jbfxdv4D0t8ndJ-lrSHPA_JA5Jbgaa";


document.addEventListener("DOMContentLoaded", function () {

    const uploadButton = document.getElementById("uploadButton");
    const photoInput = document.getElementById("photoInput");
    const photoGrid = document.getElementById("photoGrid");


    // Check that everything exists
    if (!uploadButton || !photoInput || !photoGrid) {
        console.error("Photo uploader elements were not found.");
        return;
    }


    // Open the photo picker
    uploadButton.addEventListener("click", function () {
        photoInput.click();
    });


    // When photos are selected
    photoInput.addEventListener("change", async function (event) {

        const files = Array.from(event.target.files);

        if (files.length === 0) {
            return;
        }


        for (const file of files) {

            // Only allow images
            if (!file.type.startsWith("image/")) {
                alert(`${file.name} is not an image.`);
                continue;
            }


            // Create a unique filename
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

                    const errorText = await uploadResponse.text();

                    console.error(
                        "Supabase upload error:",
                        errorText
                    );

                    throw new Error(errorText);
                }


                // Create the public image URL
                const photoURL =
                    `${SUPABASE_URL}/storage/v1/object/public/photos/${encodeURIComponent(fileName)}`;


                // Show photo on website
                displayPhoto(photoURL);


                console.log("Uploaded successfully:", file.name);

            }


            catch (error) {

                console.error(error);

                alert(
                    `We couldn't upload ${file.name}. Please try again.`
                );
            }

        }


        // Reset input so the same photo can be selected again
        photoInput.value = "";

    });


    // Display a photo in the album
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
