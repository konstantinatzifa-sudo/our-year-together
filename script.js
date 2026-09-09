const uploadButton = document.getElementById("uploadButton");
const photoInput = document.getElementById("photoInput");
const photoGrid = document.getElementById("photoGrid");

uploadButton.addEventListener("click", () => {
    photoInput.click();
});

photoInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();

        reader.onload = function(e) {

            const photo = document.createElement("div");
            photo.className = "memory-photo";

            photo.innerHTML = `
                <img src="${e.target.result}" alt="Our memory">
            `;

            photoGrid.appendChild(photo);
        };

        reader.readAsDataURL(file);
    });
});
