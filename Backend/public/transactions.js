// ===============================
// API ENDPOINTS
// ===============================
const API_URLS = {
  Donations: "http://localhost:5000/api/donations",
  Expenses: "http://localhost:5000/api/expenses"
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

  // Hide all dynamic fields
  document.getElementById('donationFields').style.display = 'none';
  document.getElementById('expenseFields').style.display = 'none';
  document.getElementById('purchaseFields').style.display = 'none';
  document.getElementById('receiptField').style.display = 'none';

  // Reset transType to default
  transType.value = "";

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
// MODAL DYNAMIC FIELDS
// ===============================
transType.addEventListener('change', function() {
  const type = this.value;

  // Hide all field groups first
  document.getElementById('donationFields').style.display = 'none';
  document.getElementById('expenseFields').style.display = 'none';
  document.getElementById('purchaseFields').style.display = 'none';
  document.getElementById('receiptField').style.display = 'none';

  // Show relevant fields based on type
  if (type === 'donation') {
    document.getElementById('donationFields').style.display = 'block';
    document.getElementById('receiptField').style.display = 'block';
  } else if (type === 'expense') {
    document.getElementById('expenseFields').style.display = 'block';
    document.getElementById('receiptField').style.display = 'block';
  } else if (type === 'purchase') {
    document.getElementById('purchaseFields').style.display = 'block';
    document.getElementById('receiptField').style.display = 'block';
  }
});


addTransactionForm.addEventListener("submit", async e => {
  e.preventDefault();

  let editID = document.getElementById("editID").value;
  const transactionType = transType.value;

  if (!transactionType) {
    alert("Please select a transaction type");
    return;
  }

  // Generate new ID if adding (not editing)
  // if (!editID) {
  //  editID = generateTransactionID();

  //}

  // Prepare data object based on transaction type
  let data = {};

  if (transactionType === 'donation') {
    // Validate donation fields
    if (!document.getElementById('donorID').value) {
      alert("Please enter Donor ID");
      return;
    }

    data = {

      donorID: document.getElementById('donorID').value,
      amount: Number(transAmount.value),
      dateReceived: transDate.value,
      mode: document.getElementById('paymentMode').value,
      remarks: document.getElementById('remarks').value || '',
      description: document.getElementById('donationDesc').value || '',
      receipt: '', // You would handle file upload separately
      type: 'donation'
    };
  }
  else if (transactionType === 'expense') {
    // Validate expense fields
    if (!document.getElementById('responsibleID').value) {
      alert("Please enter Responsible Member ID");
      return;
    }
    if (!document.getElementById('expenseDesc').value) {
      alert("Please enter expense description");
      return;
    }

    data = {
      amount: Number(transAmount.value),
      date: transDate.value,
      responsibleID: document.getElementById('responsibleID').value,
      remarks: document.getElementById('remarks').value || '',
      type: document.getElementById('expenseType').value,
      description: document.getElementById('expenseDesc').value,
      receipt: ''
    };
  }
  else if (transactionType === 'purchase') {
    // Validate purchase fields
    if (!document.getElementById('purchaseResponsibleID').value) {
      alert("Please enter Responsible Member ID");
      return;
    }
    if (!document.getElementById('purchaseDesc').value) {
      alert("Please enter purchase description");
      return;
    }

    data = {
      amount: Number(transAmount.value),
      date: transDate.value,
      responsibleID: document.getElementById('purchaseResponsibleID').value,
      remarks: document.getElementById('remarks').value || '',
      description: document.getElementById('purchaseDesc').value,
      paymentMode: document.getElementById('purchasePaymentMode').value,
      receiptNumber: document.getElementById('receiptNumber').value || '',
      receipt: '',
      type: 'purchase'
    };
  }

  // Common validations
  if (!data.amount || data.amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  if (!transDate.value) {
    alert("Please select a date");
    return;
  }

  try {
    // Determine API endpoint
    let apiUrl;
    if (transactionType === 'donation') {
      apiUrl = API_URLS.Donations;
    } else {
      apiUrl = API_URLS.Expenses;
    }

    // Call API
    if (document.getElementById("editID").value !== "") {
      // Update existing
      await fetch(`${apiUrl}/${editID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Create new
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
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

async function deleteTransaction(id, type) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;

  const apiUrl = type === 'donation' ? API_URLS.Donations : API_URLS.Expenses;

  try {
    const res = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    alert("Transaction deleted successfully");
    await updateDisplay();
  } catch (err) {
    console.error(err);
    alert(`Failed to delete transaction: ${err.message}`);
  }
}


// ===============================
// EDIT (load into modal)
// ===============================
function editTransaction(id) {
  const t = transactions.find(x => x._id === id);
  if (!t) return;

  modalTitle.textContent = "Edit Transaction";

  // Set common fields
  document.getElementById("editID").value = t._id;
  transType.value = t.type || 'expense';
  transAmount.value = t.amount || "";
  transDate.value = formatDate(t.date)|| "";
  document.getElementById("remarks").value = t.remarks || "";

  // Trigger field display based on type
  transType.dispatchEvent(new Event('change'));

  // Set type-specific fields
  if (t.type === 'donation') {
    document.getElementById('donorID').value = t.donorID || "";
    document.getElementById('paymentMode').value = t.mode || "cash";
    document.getElementById('donationDesc').value = t.description || "";
  } else if (t.type === 'expense' || t.type === 'purchase') {
    document.getElementById('responsibleID').value = t.responsibleID || "";
    document.getElementById('expenseDesc').value = t.description || "";
    document.getElementById('expenseType').value = t.expenseType || "operational";
  }

  addTransactionModal.style.display = "block";
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


/// ===============================
// RENDER TABLE
// ===============================
function renderTransactions(list) {
  transTableBody.innerHTML = "";

  // Show message if no transactions
  if (list.length === 0) {
    transTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: #888;">
          No transactions found
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(t => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    // Fix: Include the type parameter in deleteTransaction call
    row.innerHTML = `
      <td>${t._id}</td>
      <td>${t.type || 'unknown'}</td>
      <td>${t.description || ''}</td>
      <td>${formatMoney(t.amount || 0)}</td>
      <td>${t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editTransaction('${t._id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTransaction('${t._id}', '${t.type || 'expense'}')">Delete</button>
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

  return list.filter(t => {
    return (
        (t._id && t._id.toLowerCase().includes(q)) ||
        (t.type && t.type.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.amount && String(t.amount).includes(q)) ||
        (t.date && t.date.toLowerCase().includes(q))
    );
  });
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
// Fetch Data
// ===============================

async function fetchTransactions() {
  try {
    // Fetch both donations and expenses
    const [donationsRes, expensesRes] = await Promise.all([
      fetch(API_URLS.Donations),
      fetch(API_URLS.Expenses)
    ]);

    if (!donationsRes.ok) throw new Error('Failed to fetch donations');
    if (!expensesRes.ok) throw new Error('Failed to fetch expenses');

    const donations = await donationsRes.json();
    const expenses = await expensesRes.json();

    // Merge and normalize data
    const allTransactions = [
      ...donations.map(d => ({
          ...d,
          type: 'donation',
        date: d.date || d.dateReceived
      })),
      ...expenses.map(e => ({
         ...e,
          type: e.type || 'expense',
      }))
    ];

    return allTransactions;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    alert('Failed to load transactions');
    return [];
  }
}
// ===============================
// GENERATE TRANSACTION ID
// ===============================
function generateTransactionID() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `TRX-${timestamp}-${random}`.toUpperCase();
}
function formatDate(dateString) {
  if (!dateString) return '';

  try {
    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it includes time (ISO format)
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    // Parse as Date object
    const date = new Date(dateString);

    // Check if valid date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return '';
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

// ===============================
// INITIAL
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await updateDisplay();
    console.log('Transactions loaded successfully');
  } catch (err) {
    console.error('Failed to initialize:', err);
    alert('Failed to load transactions. Please refresh the page.');
  }
});

