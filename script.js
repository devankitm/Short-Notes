// =========================
// Theme
// =========================
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");

const savedTheme = localStorage.getItem("short-notes-theme");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const startTheme = savedTheme || (systemDark ? "dark" : "light");

root.setAttribute("data-theme", startTheme);

function updateThemeIcon() {
  if (!themeBtn) return;
  const dark = root.getAttribute("data-theme") === "dark";
  themeBtn.innerHTML = dark 
  ? '<i class="fa-regular fa-sun"></i>' 
  : '<i class="fa-regular fa-moon"></i>';
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}
updateThemeIcon();

themeBtn?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("short-notes-theme", next);
  updateThemeIcon();
});

// =========================
// Mobile sidebar
// =========================
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

menuBtn?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", () => sidebar?.classList.remove("open"));
});

// =========================
// Copy code
// =========================
document.querySelectorAll(".copy-btn").forEach(button => {
  button.addEventListener("click", async () => {
    const card = button.closest(".code-card");
    const code = card?.querySelector("code")?.innerText || "";

    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied!";
      setTimeout(() => button.textContent = "Copy", 1400);
    } catch {
      button.textContent = "Failed";
      setTimeout(() => button.textContent = "Copy", 1400);
    }
  });
});

// =========================
// Reading progress
// =========================
function updateProgress() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;

  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
  bar.style.width = `${Math.min(progress, 100)}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// =========================
// Page search
// =========================
const topicSearch = document.getElementById("topicSearch");

topicSearch?.addEventListener("input", () => {
  const query = topicSearch.value.toLowerCase().trim();

  document.querySelectorAll(".notes .topic").forEach(topic => {
    const text = topic.innerText.toLowerCase();
    topic.style.display = !query || text.includes(query) ? "" : "none";
  });
});

// =========================
// Home search
// =========================
const globalSearch = document.getElementById("globalSearch");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

function filterSubjects() {
  if (!globalSearch) return;

  const query = globalSearch.value.toLowerCase().trim();
  const cards = [...document.querySelectorAll(".subject-card")];
  let visible = 0;

  cards.forEach(card => {
    const match = card.dataset.name.includes(query);
    card.style.display = match ? "" : "none";
    if (match) visible++;
  });

  if (resultCount) {
    resultCount.textContent = query ? `${visible} result${visible === 1 ? "" : "s"}` : "";
  }
  if (emptyState) {
    emptyState.style.display = visible ? "none" : "block";
  }
}
globalSearch?.addEventListener("input", filterSubjects);

// Ctrl/Cmd + K focuses search
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    (globalSearch || topicSearch)?.focus();
  }
});

// =========================
// Table of contents
// =========================
const tocLinks = document.getElementById("tocLinks");

if (tocLinks) {
  const topics = [...document.querySelectorAll(".notes .topic")];

  topics.forEach(topic => {
    const heading = topic.querySelector("h2");
    if (!heading) return;

    const link = document.createElement("a");
    link.href = `#${topic.id}`;
    link.textContent = heading.textContent.replace(/^\d+\.\s*/, "");
    tocLinks.appendChild(link);
  });

  const links = [...tocLinks.querySelectorAll("a")];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => link.classList.remove("active"));
        const active = links.find(link => link.getAttribute("href") === `#${entry.target.id}`);
        active?.classList.add("active");
      }
    });
  }, { rootMargin: "-20% 0px -65% 0px" });

  topics.forEach(topic => observer.observe(topic));
}

// Highlight current subject in sidebar
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".sidebar nav a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});
