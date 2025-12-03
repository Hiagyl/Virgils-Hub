// ===============================
// ELEMENTS
// ===============================
const addRecordBtn = document.getElementById("addRecordBtn");
const addRecordModal = document.getElementById("addRecordModal");
const cancelRecordBtn = document.getElementById("cancelRecordBtn");
const addRecordForm = document.getElementById("addRecordForm");
const modalTitle = document.getElementById("modalTitle");

const recType = document.getElementById("recType");
const recDesc = document.getElementById("recDesc");
const recAmount = document.getElementById("recAmount");
const recDate = document.getElementById("recDate");

const txnTableBody = document.querySelector("#txnTable tbody");
const searchFinance = document.getElementById("searchFinance");

const donationsEl = document.getElementById("donations");
const expensesEl = document.getElementById("expenses");
const balanceEl = document.getElementById("balance");

const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");

let records = []; // store fetched transactions

// ===============================
// MODAL HANDLERS
// ===============================
addRecordBtn.onclick = () => {
  addRecordForm.reset();
  document.getElementById("editID").value = "";
  modalTitle.textContent = "Add New Record";
  addRecordModal.style.display = "block";
};

cancelRecordBtn.onclick = () => (addRecordModal.style.display = "none");
document.querySelector(".modal .close").onclick = () =>
  (addRecordModal.style.display = "none");
window.onclick = (e) => {
  if (e.target === addRecordModal) addRecordModal.style.display = "none";
};

// ===============================
// API CALLS
// ===============================
async function loadTransactions() {
  try {
    const res = await fetch("http://localhost:5000/api/finance");
    const data = await res.json();
    records = data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function saveTransaction(txn) {
  try {
    const method = txn._id ? "PUT" : "POST";
    const url = txn._id
      ? `http://localhost:5000/api/finance/${txn._id}`
      : "http://localhost:5000/api/finance";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txn),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function deleteRecord(id, type) {
  if (!confirm("Delete this transaction?")) return;

  try {
    await fetch(`http://localhost:5000/api/finance/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    updateDisplay();
  } catch (err) {
    console.error(err);
  }
}

// ===============================
// ADD / EDIT RECORD
// ===============================
addRecordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const txn = {
    _id: document.getElementById("editID").value,
    type: recType.value,
    description: recDesc.value,
    amount: Number(recAmount.value),
    date: recDate.value,
  };

  await saveTransaction(txn);
  addRecordModal.style.display = "none";
  updateDisplay();
});

// ===============================
// EDIT RECORD
// ===============================
function editRecord(id, type) {
  const r = records.find((x) => x._id === id && x.type === type);
  if (!r) return;

  modalTitle.textContent = "Edit Record";
  document.getElementById("editID").value = r._id;
  recType.value = r.type;
  recDesc.value = r.description;
  recAmount.value = r.amount;
  recDate.value = r.date;

  addRecordModal.style.display = "block";
}

// ===============================
// DISPLAY & RENDER
// ===============================
async function updateDisplay() {
  await loadTransactions();
  let list = applySearch(records);
  list = applySorting(list);
  renderRecords(list);
  computeTotals(list);
}

function renderRecords(list) {
  txnTableBody.innerHTML = "";

  list.forEach((r) => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    row.innerHTML = `
      <td>${r._id}</td>
      <td>${r.type}</td>
      <td>${r.description}</td>
      <td>${formatMoney(r.amount)}</td>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editRecord('${r._id}', '${r.type}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteRecord('${r._id}', '${r.type}')">Delete</button>
      </td>
    `;

    txnTableBody.appendChild(row);
  });
}

// ===============================
// HELPERS
// ===============================
function formatMoney(v) {
  return "₱ " + new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(v);
}

function computeTotals(list) {
  let donations = 0,
    expenses = 0;

  list.forEach((r) => {
    if (r.type === "donation") donations += r.amount;
    else expenses += r.amount;
  });

  donationsEl.textContent = formatMoney(donations);
  expensesEl.textContent = formatMoney(expenses);
  balanceEl.textContent = formatMoney(donations - expenses);
}

// ===============================
// SEARCH & SORT
// ===============================
searchFinance.addEventListener("input", updateDisplay);

function applySearch(list) {
  const q = searchFinance.value.toLowerCase();
  if (!q) return list;

  return list.filter(
    (r) =>
      r._id.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      String(r.amount).includes(q) ||
      r.date.includes(q)
  );
}

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
// INITIAL LOAD
// ===============================
updateDisplay();
