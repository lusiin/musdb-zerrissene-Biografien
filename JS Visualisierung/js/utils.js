export function toggleDropdown(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle("show"); // nur dieses eine Dropdown togglen
  } else {
    console.warn(`Kein Element mit ID "${id}" gefunden`);
  }
}

//eventListeners
// Klick auf Button → nur das zugehörige Dropdown togglen
document.querySelectorAll(".dropbtn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdownId = btn.getAttribute("data-dropdown");
    toggleDropdown(dropdownId);
  });
});

// Klick außerhalb → alle Dropdowns schließen
window.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-content.show").forEach(dropdown => {
    // Nur schließen, wenn Klick **nicht** im Dropdown selbst war
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
});

const sidebar = document.getElementById("sidebar");
sidebar.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.getElementById("info-dropbtn").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar-left");
  if (sidebar) sidebar.classList.toggle("show");
});