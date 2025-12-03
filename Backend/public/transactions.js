// ===============================
// API ENDPOINTS
// ===============================
const API_URLS = {
  Donations: "http://localhost:3000/api/donations",
  Expenses: "http://localhost:3000/api/expenses"
};

// ===============================
// ELEMENTS
// ===============================
const addTransactionBtn = document.getElementById("addTransactionBtn");
const addTransactionModal = document.getElementById("addTransactionModal");
const cancelTransactionBtn = document.getElementById("cancelTransactionBtn");
const addTransactionForm = document.getElementById("addTransactionForm");
const modalTitle = document.getElementById("modalTitle");

// Form inputs
const transType = document.getElementById("transType");
const transDesc = document.getElementById("transDesc");
const transAmount = document.getElementById("transAmount");
const transDate = document.getElementById("transDate");
const paymentMode = document.getElementById("paymentMode");
const remarks = document.getElementById("remarks");
const donorIDInput = document.getElementById("donorID");

const transTableBody = document.getElementById("transTableBody");
const searchTrans = document.getElementById("searchTrans");
const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");

// ===============================
// GLOBAL VARIABLES
// ===============================
let transactions = [];

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
addTransactionForm.addEventListener("submit", async e => {
  e.preventDefault();

  const editID = document.getElementById("editID").value;
  const transactionType = (transType.value || "").toLowerCase();
  const apiUrl = transactionType === "donation" ? API_URLS.Donations : API_URLS.Expenses;


  // Prepare data object
  let data = {};
  if (transactionType === "Donation") {
    data = {
      amount: Number(transAmount.value),
      dateReceived: transDate.value,
      mode: paymentMode?.value || "cash",
      remarks: remarks?.value || "",
      description: transDesc.value || "",
      type: "Donation",
      category: "Donation",
      donorID: donorIDInput?.value || generateTransactionID("Trx")
    };
  } else {
    data = {
      description: transDesc.value,
      amount: Number(transAmount.value),
      date: transDate.value,
      type: "Expense",
      category: "Expense",
      responsibleID: "ADMIN001",
      remarks: remarks?.value || ""
    };
  }

  // Validate form inputs
  if (!data.description || !data.description.trim()) {
    alert("Please enter a description");
    return;
  }

  if (!data.amount || data.amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  if (!data.date) {
    alert("Please select a date");
    return;
  }

  if (transactionType === "Expense" && !data.responsibleID) {
    alert("Please enter responsible person ID");
    return;
  }

  try {
    if (editID) {
      await updateTransactionAPI(editID, data, transactionType);
    } else {
      await createTransaction(data, transactionType);
    }
    addTransactionModal.style.display = "none";
    await updateDisplay();
  } catch (err) {
    console.error(err);
    alert(`Failed to save transaction: ${err.message}`);
  }
});

// ===============================
// DELETE
// ===============================
async function deleteTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  if (!confirm("Delete this transaction?")) return;

  const apiUrl = transaction.category === "Donation" ? API_URLS.Donations : API_URLS.Expenses;

  try {
    await deleteTransactionAPI(id, apiUrl);
    await updateDisplay();
  } catch (err) {
    console.error(err);
    alert("Failed to delete transaction.");
  }
}

// ===============================
// EDIT
// ===============================
function editTransaction(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;

  modalTitle.textContent = "Edit Transaction";

  document.getElementById("editID").value = t.id;
  transType.value = t.type;
  transDesc.value = t.description;
  transAmount.value = t.amount;
  transDate.value = (t.date || t.dateReceived || "").split('T')[0];
  if (t.category === "Donation" && donorIDInput) donorIDInput.value = t.donorID || "";

  addTransactionModal.style.display = "block";
}

// ===============================
// FETCH BOTH TRANSACTIONS
// ===============================
async function fetchTransactions() {
  try {
    const [donationsRes, expensesRes] = await Promise.all([
      fetch(API_URLS.Donations),
      fetch(API_URLS.Expenses)
    ]);

    const donations = (await donationsRes.json()).map(t => ({
      ...t,
      id: t._id,
      category: "Donation",
      type: t.type || "Donation"
    }));

    const expenses = (await expensesRes.json()).map(t => ({
      ...t,
      id: t._id,
      category: "Expense",
      type: t.type || "Expense",
      description: t.remarks || ""
    }));

    return [...donations, ...expenses];
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return [];
  }
}

// ===============================
// CREATE / UPDATE / DELETE API
// ===============================
async function createTransaction(data, transactionType) {
  // Determine API endpoint
  const apiUrl = transactionType === "donation" ? API_URLS.Donations : API_URLS.Expenses;

  let payload = {};

  if (transactionType === "donation") {
    payload = {
      id:generateTransactionID("TRX"),
      amount: Number(data.amount) || 0,
      date: data.dateReceived || new Date().toISOString().split('T')[0],
      donorID: 001,
      mode: data.mode || "cash",
      remarks: data.remarks || "",
      description: data.description || ""
    };
  } else {
    payload = {
      id:generateTransactionID("TRX"),
      amount: Number(data.amount) || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      responsibleID: data.responsibleID || "ADMIN001",
      remarks: data.remarks || "",
      description: data.description || ""
    };
  }

  // Basic validation
  if (!payload.description || !payload.description.trim()) {
    throw new Error("Description is required");
  }
  if (!payload.amount || payload.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  if (transactionType === "Expense" && !payload.responsibleID) {
    throw new Error("Responsible ID is required for expenses");
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    const result = await res.json();
    console.log("Transaction created successfully:", result);
    return result;
  } catch (err) {
    console.error("Failed to create transaction:", err);
    throw err;
  }
}

async function updateTransactionAPI(id, data, apiUrl) {
  const res = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

async function deleteTransactionAPI(id, apiUrl) {
  const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

// ===============================
// UPDATE DISPLAY
// ===============================
async function updateDisplay() {
  transactions = await fetchTransactions();
  let list = applySearch(transactions);
  list = applySorting(list);
  renderTransactions(list);
}

// ===============================
// RENDER TABLE
// ===============================
function renderTransactions(list) {
  transTableBody.innerHTML = "";

  if (list.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" class="no-data">No transactions found</td>`;
    transTableBody.appendChild(row);
    return;
  }

  list.forEach(t => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    row.innerHTML = `
      <td>${t.id}</td>
      <td>${t.type}</td>
      <td>${t.description}</td>
      <td>${formatMoney(t.amount)}</td>
      <td>${new Date(t.date || t.dateReceived).toLocaleDateString()}</td>
      <td>${t.category}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editTransaction('${t.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTransaction('${t.id}')">Delete</button>
      </td>
    `;
    transTableBody.appendChild(row);
  });
}

// ===============================
// FORMAT MONEY
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
      (t.id || "").toLowerCase().includes(q) ||
      (t.type || "").toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      String(t.amount).includes(q) ||
      (t.date || t.dateReceived || "").toLowerCase().includes(q) ||
      (t.category || "").toLowerCase().includes(q)
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
    const aVal = a[field] || '';
    const bVal = b[field] || '';

    if (field === "amount") return (a.amount - b.amount) * dir;
    if (field === "date") return (new Date(a.date || a.dateReceived) - new Date(b.date || b.dateReceived)) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });
}

// ===============================
// GENERATE TRANSACTION ID
// ===============================
function generateTransactionID(prefix = 'TRX') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

// ===============================
// INITIAL LOAD
// ===============================
updateDisplay();
