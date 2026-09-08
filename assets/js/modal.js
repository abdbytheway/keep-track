// Shared "Add Expense" modal logic — imported by dashboard.html and
// transactions.html, both of which contain the same modal markup shell.
import { CATEGORIES } from "./categories.js";
import { addTransaction } from "./db.js";
import { todayIso } from "./util.js";

let selectedCategory = CATEGORIES[0].id;
let selectedStatus = "paid";

export function initAddExpenseModal(uid, { onAdded } = {}) {
  const backdrop = document.getElementById("addExpenseModal");
  const form = document.getElementById("addExpenseForm");
  const grid = document.getElementById("categoryGrid");
  const dateInput = document.getElementById("expenseDate");
  const errorEl = document.getElementById("addExpenseError");
  const recurringInput = document.getElementById("expenseRecurring");
  const statusBtns = backdrop
    ? backdrop.querySelectorAll("[data-status-btn]")
    : [];
  if (!backdrop || !form || !grid) return;

  dateInput.value = todayIso();
  dateInput.max = todayIso();

  statusBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectStatus(btn.dataset.statusBtn, statusBtns));
  });
  selectStatus(selectedStatus, statusBtns);

  // Build the category picker cards once.
  grid.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.category = cat.id;
    btn.className =
      "category-card group flex flex-col items-start p-space-sm rounded-xl text-left transition-all relative";
    btn.innerHTML = `
      <div class="icon-box w-8 h-8 rounded-lg flex items-center justify-center shadow-xs mb-space-2xs">
        <span class="material-symbols-outlined text-[18px]">${cat.icon}</span>
      </div>
      <span class="cat-label font-title-md text-title-md">${cat.label}</span>
      <div class="check-indicator absolute top-2.5 right-2.5 hidden w-4 h-4 rounded-full bg-primary text-on-primary items-center justify-center">
        <span class="material-symbols-outlined text-[12px]">check</span>
      </div>`;
    btn.addEventListener("click", () => selectCategory(cat.id, grid));
    grid.appendChild(btn);
  });
  selectCategory(selectedCategory, grid);

  function openModal() {
    selectedCategory = CATEGORIES[0].id;
    selectCategory(selectedCategory, grid);
    selectedStatus = "paid";
    selectStatus(selectedStatus, statusBtns);
    form.reset();
    dateInput.value = todayIso();
    errorEl.classList.add("hidden");
    backdrop.classList.remove("hidden");
  }
  function closeModal() {
    backdrop.classList.add("hidden");
  }

  document.querySelectorAll("[data-open-add-expense]").forEach((btn) => {
    btn.addEventListener("click", openModal);
  });
  backdrop.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const merchant = document.getElementById("expenseMerchant").value.trim();
    const date = dateInput.value;
    const note = document.getElementById("expenseNotes").value.trim();

    if (!amount || amount <= 0) {
      errorEl.textContent = "Enter an amount greater than $0.";
      errorEl.classList.remove("hidden");
      return;
    }
    if (!date) {
      errorEl.textContent = "Pick a date for this expense.";
      errorEl.classList.remove("hidden");
      return;
    }

    // The submit button lives outside the <form> element (associated via the
    // HTML `form="addExpenseForm"` attribute), so it must be looked up from
    // the document rather than as a descendant of `form`.
    const submitBtn = document.querySelector('[data-submit-expense][form="' + form.id + '"]');
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-60");
    try {
      await addTransaction(uid, {
        amount,
        category: selectedCategory,
        merchant,
        note,
        date,
        status: selectedStatus,
        recurring: recurringInput ? recurringInput.checked : false,
      });
      closeModal();
      onAdded && onAdded();
    } catch (err) {
      errorEl.textContent = "Couldn't save that expense: " + err.message;
      errorEl.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-60");
    }
  });
}

function selectCategory(id, grid) {
  selectedCategory = id;
  grid.querySelectorAll(".category-card").forEach((card) => {
    const isSelected = card.dataset.category === id;
    card.classList.toggle("bg-primary-fixed", isSelected);
    card.classList.toggle("shadow-sm", isSelected);
    card.classList.toggle("bg-surface-container-low", !isSelected);
    const label = card.querySelector(".cat-label");
    label.classList.toggle("text-on-primary-fixed", isSelected);
    label.classList.toggle("text-on-surface", !isSelected);
    const iconBox = card.querySelector(".icon-box");
    iconBox.classList.toggle("bg-primary", isSelected);
    iconBox.classList.toggle("text-on-primary", isSelected);
    iconBox.classList.toggle("bg-surface-container-lowest", !isSelected);
    iconBox.classList.toggle("text-on-surface", !isSelected);
    const check = card.querySelector(".check-indicator");
    check.classList.toggle("hidden", !isSelected);
    check.classList.toggle("flex", isSelected);
  });
}

function selectStatus(status, statusBtns) {
  selectedStatus = status;
  statusBtns.forEach((btn) => {
    const isSelected = btn.dataset.statusBtn === status;
    btn.classList.toggle("bg-surface-container-lowest", isSelected);
    btn.classList.toggle("shadow-sm", isSelected);
    btn.classList.toggle(
      "text-tertiary",
      isSelected && btn.dataset.statusBtn === "paid"
    );
    btn.classList.toggle(
      "text-primary",
      isSelected && btn.dataset.statusBtn === "pending"
    );
    btn.classList.toggle("text-on-surface-variant", !isSelected);
  });
}
