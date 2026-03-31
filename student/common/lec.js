document.querySelectorAll(".lecture-check").forEach(cb => {
  cb.addEventListener("change", () => {
    const status = cb.closest(".lecture-left").querySelector(".status")

    if (cb.checked) {
      status.textContent = "Completed"
      status.classList.remove("pending")
      status.classList.add("completed")
    } else {
      status.textContent = "Not Completed"
      status.classList.remove("completed")
      status.classList.add("pending")
    }
  })
})
