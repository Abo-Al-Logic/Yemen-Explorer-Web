const cards = [...document.querySelectorAll(".city-card")];
const filters = [...document.querySelectorAll(".filter")];
const search = document.getElementById("citySearch");
const clear = document.getElementById("clearSearch");
const count = document.getElementById("resultCount");
const empty = document.getElementById("emptyState");
const resetSearch = document.getElementById("resetSearch");
const sort = document.getElementById("citySort");
const grid = document.getElementById("cityGrid");
const favCount = document.getElementById("favCount");

let activeFilter = "all";
const favorites = new Set(JSON.parse(localStorage.getItem("yemenExplorerFavorites") || "[]"));

function updateFavoriteButtons() {
    cards.forEach(card => {
        const name = card.dataset.city;
        const button = card.querySelector(".favorite");
        const active = favorites.has(name);
        button.classList.toggle("saved", active);
        button.setAttribute("aria-pressed", String(active));
        button.textContent = active ? "♥" : "♡";
    });
    favCount.textContent = favorites.size;
}

function saveFavorites() {
    localStorage.setItem("yemenExplorerFavorites", JSON.stringify([...favorites]));
}

function renderCities() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(card => {
        const name = card.dataset.city.toLowerCase();
        const en = card.dataset.en.toLowerCase();
        const tags = card.dataset.tags.split(" ");
        const matchesSearch = !query || name.includes(query) || en.includes(query);
        const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "favorites" ? favorites.has(card.dataset.city) : tags.includes(activeFilter));

        const show = matchesSearch && matchesFilter;
        card.style.display = show ? "" : "none";
        if (show) visible++;
    });

    count.textContent = `${visible} ${visible === 1 ? "وجهة" : "وجهة"}`;
    empty.hidden = visible !== 0;
}

search.addEventListener("input", renderCities);

clear.addEventListener("click", () => {
    search.value = "";
    renderCities();
    search.focus();
});

resetSearch.addEventListener("click", () => {
    search.value = "";
    activeFilter = "all";
    filters.forEach(item => item.classList.toggle("active", item.dataset.filter === "all"));
    renderCities();
});

filters.forEach(button => {
    button.addEventListener("click", () => {
        filters.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        activeFilter = button.dataset.filter;
        renderCities();
    });
});

cards.forEach(card => {
    card.querySelector(".favorite").addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const name = card.dataset.city;
        favorites.has(name) ? favorites.delete(name) : favorites.add(name);
        saveFavorites();
        updateFavoriteButtons();
        renderCities();
    });
});

sort.addEventListener("change", () => {
    const ordered = [...cards];
    if (sort.value === "az") ordered.sort((a,b) => a.dataset.city.localeCompare(b.dataset.city, "ar"));
    else if (sort.value === "za") ordered.sort((a,b) => b.dataset.city.localeCompare(a.dataset.city, "ar"));
    else ordered.sort((a,b) => Number(a.querySelector(".number").textContent) - Number(b.querySelector(".number").textContent));
    ordered.forEach(card => grid.appendChild(card));
    renderCities();
});

document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== search) {
        event.preventDefault();
        search.focus();
    }
    if (event.key === "Escape" && document.activeElement === search) {
        search.value = "";
        renderCities();
        search.blur();
    }
});

updateFavoriteButtons();
renderCities();
