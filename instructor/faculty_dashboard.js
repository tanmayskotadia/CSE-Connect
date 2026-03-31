document.querySelectorAll(".course-card button").forEach(button => {
    button.addEventListener("click", () => {
        const course = button.parentElement.querySelector("h3").innerText;

        if (course === "Data Structures") {
            window.location.href = "data structures/status.html";
        }

        if (course === "Operating Systems") {
            window.location.href = "os/status.html";
        }

        if (course === "Artificial Intelligence") {
            window.location.href = "ai/status.html";
        }
    });
});

document.querySelector(".view-btn").addEventListener("click", () => {
    window.location.href = "view_sub.html";
});

document.querySelectorAll(".nav-links button")[1].addEventListener("click", () => {
    window.location.href = "view_sub.html";
});

document.querySelectorAll(".nav-links button")[2].addEventListener("click", () => {
    window.location.href = "../home/index.html";
});
