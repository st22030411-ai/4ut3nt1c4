const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav__list");

toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
});
