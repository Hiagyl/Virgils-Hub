// ===============================
// LOCAL STORAGE SHARED FUNCTIONS
// ===============================
function loadTransactions() {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
}

function saveTransactions(list) {
  localStorage.setItem("transactions", JSON.stringify(list));
}


// ===============================
// ELEMENTS
// ===============================
const addTransactionBtn = document.getElementById("addTransactionBtn");
const addTransactionModal = document.getElementById("addTransactionModal");
const cancelTransactionBtn = document.getElementById("cancelTransactionBtn");
const addTransactionForm = document.getElementById("addTransactionForm");
const modalTitle = document.getElementById("modalTitle");

const transTableBody = document.getElementById("transTableBody");
const searchTrans = document.getElementById("searchTrans");

const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");

let transactions = loadTransactions();


// ===============================
// MODAL OPEN / CLOSE
// ===============================
addTransactionBtn.onclick = () => {
  addTransactionForm.reset();
  document.getElementById("editID").value = "";
  modalTitle.textContent = "Add New Transaction";
  addTransactionModal.style.display = "block";
};

cancelTransactionBtn.onclick = () =>
  addTransactionModal.style.display = "none";

document.querySelector(".modal .close").onclick = () =>
  addTransactionModal.style.display = "none";

window.onclick = (e) => {
  if (e.target === addTransactionModal) addTransactionModal.style.display = "none";
};


// ===============================
// ADD / EDIT SUBMIT
// ===============================
addTransactionForm.addEventListener("submit", e => {
  e.preventDefault();

  const editID = document.getElementById("editID").value;

  const data = {
    id: editID || ("TRX-" + String(transactions.length + 1).padStart(3, "0")),
    type: transType.value,
    description: transDesc.value,
    amount: Number(transAmount.value),
    date: transDate.value
  };

  if (editID) {
    // UPDATE
    const index = transactions.findIndex(t => t.id === editID);
    if (index !== -1) transactions[index] = data;
  } else {
    // ADD NEW
    transactions.push(data);
  }

  saveTransactions(transactions);
  updateDisplay();
  addTransactionModal.style.display = "none";
});


// ===============================
// DELETE
// ===============================
function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;

  transactions = transactions.filter(t => t.id !== id);
  saveTransactions(transactions);
  updateDisplay();
}


// ===============================
// EDIT (load into modal)
// ===============================
function editTransaction(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;

  modalTitle.textContent = "Edit Transaction";

  document.getElementById("editID").value = t.id;
  transType.value = t.type;
  transDesc.value = t.description;
  transAmount.value = t.amount;
  transDate.value = t.date;

  addTransactionModal.style.display = "block";
}


// ===============================
// UPDATE DISPLAY
// ===============================
function updateDisplay() {
  transactions = loadTransactions();

  let list = applySearch(transactions);
  list = applySorting(list);

  renderTransactions(list);
}


// ===============================
// RENDER TABLE
// ===============================
function renderTransactions(list) {
  transTableBody.innerHTML = "";

  list.forEach(t => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    row.innerHTML = `
      <td>${t.id}</td>
      <td>${t.type}</td>
      <td>${t.description}</td>
      <td>${formatMoney(t.amount)}</td>
      <td>${new Date(t.date).toLocaleDateString()}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editTransaction('${t.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTransaction('${t.id}')">Delete</button>
      </td>
    `;

    transTableBody.appendChild(row);
  });
}


// ===============================
function formatMoney(v) {
  return "₱ " + new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(v);
}


// ===============================
// SEARCH
// ===============================
searchTrans.addEventListener("input", updateDisplay);

function applySearch(list) {
  const q = searchTrans.value.toLowerCase();
  if (!q) return list;

  return list.filter(t =>
    t.id.toLowerCase().includes(q) ||
    t.type.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    String(t.amount).includes(q) ||
    t.date.includes(q)
  );
}


// ===============================
// SORT
// ===============================
sortField.addEventListener("change", updateDisplay);
sortDirection.addEventListener("change", updateDisplay);

function applySorting(list) {
  const field = sortField.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;

  return [...list].sort((a, b) => {
    if (field === "amount") return (a.amount - b.amount) * dir;
    if (field === "date") return (new Date(a.date) - new Date(b.date)) * dir;

    return a[field].localeCompare(b[field]) * dir;
  });
}


// ===============================
// INITIAL
// ===============================
updateDisplay();
