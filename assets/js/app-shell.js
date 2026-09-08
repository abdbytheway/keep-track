// Wires up the shared sidebar/header chrome that every authenticated page uses:
// user identity display, active-nav highlighting, sign-out, theme toggle,
// header search, header month pill, and the one-time per-session cleanup of
// transactions outside the 3-month retention window.
import { signOutUser } from "./auth.js";
import { cleanupOldTransactions } from "./db.js";
import { initials } from "./util.js";

const THEME_KEY = "keep-track-theme";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
    const active = btn.dataset.themeBtn === theme;
    btn.classList.toggle("bg-surface-container-lowest", active);
    btn.classList.toggle("text-primary", active);
    btn.classList.toggle("shadow-sm", active);
    btn.classList.toggle("text-on-surface-variant", !active);
  });
}

function initThemeToggle() {
  let stored = "light";
  try {
    stored = localStorage.getItem(THEME_KEY) || "light";
  } catch (err) {
    // Storage can be unavailable (private browsing, etc.) — default to light.
  }
  applyTheme(stored);

  document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.themeBtn;
      applyTheme(theme);
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (err) {
        // Best-effort only.
      }
    });
  });
}

function initHeaderMonthPill() {
  document.querySelectorAll("[data-header-month]").forEach((el) => {
    el.textContent = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  });
}

function initGlobalSearch() {
  const input = document.getElementById("globalSearchInput");
  if (!input) return;

  const onPage = (document.body.dataset.page || "").trim();
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = input.value.trim();
    if (onPage === "transactions") {
      // Already on the ledger — hand off to its own in-page search box
      // rather than reloading the page.
      const local = document.getElementById("searchInput");
      if (local) {
        local.value = q;
        local.dispatchEvent(new Event("input"));
      }
    } else {
      window.location.href = q
        ? `transactions.html?q=${encodeURIComponent(q)}`
        : "transactions.html";
    }
  });
}

export function initShell(user) {
  initThemeToggle();
  initHeaderMonthPill();
  initGlobalSearch();

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = user.displayName || user.email || "Signed in";
  });
  document.querySelectorAll("[data-user-email]").forEach((el) => {
    el.textContent = user.email || "";
  });
  document.querySelectorAll("[data-user-avatar]").forEach((el) => {
    el.textContent = initials(user.displayName || user.email);
  });

  const here = (document.body.dataset.page || "").trim();
  document.querySelectorAll("nav a[data-path]").forEach((link) => {
    const isActive = link.dataset.path === here;
    link.classList.toggle("bg-primary-container", isActive);
    link.classList.toggle("text-on-primary-container", isActive);
    link.classList.toggle("font-semibold", isActive);
    link.classList.toggle("shadow-[0_1px_3px_rgba(79,70,229,0.15)]", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
      link.classList.add("text-on-surface-variant");
    }
  });

  document.querySelectorAll("[data-sign-out]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await signOutUser();
      window.location.href = "index.html";
    });
  });

  // Best-effort background cleanup — never blocks page render.
  cleanupOldTransactions(user.uid).catch((err) =>
    console.warn("Retention cleanup skipped:", err.message)
  );
}

