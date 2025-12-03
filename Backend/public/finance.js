// ===============================
// SHARED STORAGE
// ===============================
function loadTransactions() {
  return JSON.parse(localStorage.getItem("transactions") || "[]");
}
function saveTransactions(list) {
  localStorage.setItem("transactions", JSON.stringify(list));
}

let records = loadTransactions();


// ===============================
// ELEMENTS
// ===============================
const addRecordBtn = document.getElementById("addRecordBtn");
const addRecordModal = document.getElementById("addRecordModal");
const cancelRecordBtn = document.getElementById("cancelRecordBtn");
const addRecordForm = document.getElementById("addRecordForm");
const modalTitle = document.getElementById("modalTitle");

const txnTableBody = document.querySelector("#txnTable tbody");
const searchFinance = document.getElementById("searchFinance");

const donationsEl = document.getElementById("donations");
const expensesEl = document.getElementById("expenses");
const balanceEl = document.getElementById("balance");

const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");


// ===============================
// MODAL OPEN
// ===============================
addRecordBtn.onclick = () => {
  addRecordForm.reset();
  document.getElementById("editID").value = "";
  modalTitle.textContent = "Add New Record";
  addRecordModal.style.display = "block";
};

cancelRecordBtn.onclick = () => {
  addRecordModal.style.display = "none";
};

document.querySelector(".modal .close").onclick = () =>
  addRecordModal.style.display = "none";

window.onclick = (e) => {
  if (e.target === addRecordModal) addRecordModal.style.display = "none";
};


// ===============================
// ADD / EDIT RECORD
// ===============================
addRecordForm.addEventListener("submit", e => {
  e.preventDefault();

  const editID = document.getElementById("editID").value;

  const newData = {
    id: editID || ("TRX-" + String(records.length + 1).padStart(3, "0")),
    type: recType.value,
    description: recDesc.value,
    amount: Number(recAmount.value),
    date: recDate.value
  };

  if (editID) {
    // UPDATE EXISTING
    const index = records.findIndex(r => r.id === editID);
    if (index !== -1) records[index] = newData;
  } else {
    // ADD NEW
    records.push(newData);
  }

  saveTransactions(records);
  updateDisplay();
  addRecordModal.style.display = "none";
});


// ===============================
// DELETE RECORD
// ===============================
function deleteRecord(id) {
  if (!confirm("Delete this transaction?")) return;

  records = records.filter(r => r.id !== id);
  saveTransactions(records);
  updateDisplay();
}


// ===============================
// EDIT RECORD (fills form)
// ===============================
function editRecord(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;

  modalTitle.textContent = "Edit Record";
  document.getElementById("editID").value = r.id;
  recType.value = r.type;
  recDesc.value = r.description;
  recAmount.value = r.amount;
  recDate.value = r.date;

  addRecordModal.style.display = "block";
}


// ===============================
// UPDATE DISPLAY
// ===============================
function updateDisplay() {
  let list = applySearch(records);
  list = applySorting(list);
  renderRecords(list);
  computeTotals();
}


// ===============================
// RENDER TABLE
// ===============================
function renderRecords(list) {
  txnTableBody.innerHTML = "";

  list.forEach(r => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    row.innerHTML = `
      <td>${r.id}</td>
      <td>${r.type}</td>
      <td>${r.description}</td>
      <td>${formatMoney(r.amount)}</td>
      <td>${new Date(r.date).toLocaleDateString()}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editRecord('${r.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteRecord('${r.id}')">Delete</button>
      </td>
    `;

    txnTableBody.appendChild(row);
  });
}


// ===============================
function formatMoney(v) {
  return "₱ " + new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(v);
}


// ===============================
function computeTotals() {
  let donations = 0, expenses = 0;

  records.forEach(r => {
    if (r.type === "donation") donations += r.amount;
    else expenses += r.amount;
  });

  donationsEl.textContent = formatMoney(donations);
  expensesEl.textContent = formatMoney(expenses);
  balanceEl.textContent = formatMoney(donations - expenses);
}


// ===============================
searchFinance.addEventListener("input", updateDisplay);

function applySearch(list) {
  const q = searchFinance.value.toLowerCase();
  if (!q) return list;

  return list.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    String(r.amount).includes(q) ||
    r.date.includes(q)
  );
}


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
// INITIAL LOAD
// ===============================
updateDisplay();
