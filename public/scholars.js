const API_URL = "http://localhost:5000/api/scholars";

// DOM elements
const addScholarBtn = document.getElementById("addScholarBtn");
const addScholarModal = document.getElementById("addScholarModal");
const detailsModal = document.getElementById("detailsModal");
const addScholarForm = document.getElementById("addScholarForm");
const cancelScholarBtn = document.getElementById("cancelScholarBtn");
const modalTitle = document.getElementById("modalTitle");

const searchInput = document.getElementById("searchInput");

const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");

const scholarsTableBody = document.getElementById("scholarsTableBody");

let scholars = []; // Local copy for search/sort


// ===================================
// INIT
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  loadScholars();
  setupListeners();
});


// ===================================
// LOAD LIST
// ===================================
async function loadScholars() {
  try {
    const res = await fetch(API_URL);
    scholars = await res.json();
    updateDisplay();
  } catch (err) {
    console.error("Failed to load scholars");
  }
}


// ===================================
// UPDATE DISPLAY
// ===================================
function updateDisplay() {
  let list = applySearch(scholars);
  list = applySorting(list);
  renderScholars(list);
}


// ===================================
// SEARCH
// ===================================
function applySearch(list) {
  const q = searchInput.value.toLowerCase();
  if (!q) return list;

  return list.filter(s =>
    (s.fullname || "").toLowerCase().includes(q) ||
    (s.degreeProgram || "").toLowerCase().includes(q) ||
    (s.scholarID || "").toLowerCase().includes(q) ||
    (s.contactNo || "").toLowerCase().includes(q)
  );
}

searchInput.addEventListener("input", updateDisplay);


// ===================================
// SORTING
// ===================================
sortField.addEventListener("change", updateDisplay);
sortDirection.addEventListener("change", updateDisplay);

function applySorting(list) {
  const field = sortField.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;

  return [...list].sort((a, b) => {
    if (field === "id") return (a.scholarID || "").localeCompare(b.scholarID || "") * dir;
    if (field === "name") return a.fullname.localeCompare(b.fullname) * dir;
    if (field === "program") return a.degreeProgram.localeCompare(b.degreeProgram) * dir;
    if (field === "yearLevel") return (a.yearLevel - b.yearLevel) * dir;
    if (field === "status") return a.status.localeCompare(b.status) * dir;
    return 0;
  });
}


// ===================================
// RENDER TABLE
// ===================================
function renderScholars(list) {
  scholarsTableBody.innerHTML = "";

  if (!list.length) {
    scholarsTableBody.innerHTML = `
      <tr><td colspan="8" style="padding:40px; text-align:center">No scholars found.</td></tr>`;
    return;
  }

  list.forEach(s => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    const yearLabel = ["", "1st", "2nd", "3rd", "4th", "5th"][s.yearLevel];

    row.innerHTML = `
      <td>${s.scholarID || "N/A"}</td>
      <td>
        <div class="table-avatar">
          ${s.picture ? `<img src="${s.picture}">` : `<div class="avatar-placeholder"></div>`}
        </div>
      </td>
      <td><strong>${s.fullname}</strong></td>
      <td>${s.degreeProgram}</td>
      <td>${yearLabel} Year</td>
      <td>${s.contactNo}</td>
      <td><span class="status-badge ${s.status}">${capitalize(s.status)}</span></td>
      <td>
        <button class="action-btn view-btn" data-id="${s._id}">View</button>
        <button class="action-btn edit-btn" data-id="${s._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${s._id}">Delete</button>
      </td>
    `;

    scholarsTableBody.appendChild(row);
  });

  attachActionListeners();
}


// ===================================
// ACTION LISTENERS
// ===================================
function attachActionListeners() {
  document.querySelectorAll(".view-btn").forEach(btn =>
    btn.onclick = () => showScholarDetails(btn.dataset.id)
  );

  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.onclick = () => startEdit(btn.dataset.id)
  );

  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.onclick = () => deleteScholar(btn.dataset.id)
  );
}


// ===================================
// ADD OR EDIT
// ===================================
addScholarForm.addEventListener("submit", handleSaveScholar);

function handleSaveScholar(e) {
  e.preventDefault();

  const id = document.getElementById("editID").value;
  const data = {
    fullname: fullname.value.trim(),
    email: email.value.trim(),
    contactNo: contactNo.value.trim(),
    picture: picture.value.trim(),
    degreeProgram: degreeProgram.value,
    yearLevel: Number(yearLevel.value),
    status: status.value
  };

  if (!id) {
    return createScholar(data);
  } else {
    return updateScholar(id, data);
  }
}

async function createScholar(data) {
  await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  closeAddModal();
  loadScholars();
}

async function updateScholar(id, data) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  closeAddModal();
  loadScholars();
}


function startEdit(id) {
  const s = scholars.find(x => x._id === id);
  if (!s) return;

  modalTitle.textContent = "Edit Scholar";
  addScholarModal.style.display = "block";

  document.getElementById("editID").value = s._id;
  fullname.value = s.fullname;
  email.value = s.email || "";
  contactNo.value = s.contactNo;
  picture.value = s.picture || "";
  degreeProgram.value = s.degreeProgram;
  yearLevel.value = s.yearLevel;
  status.value = s.status;
}


// ===================================
// DELETE
// ===================================
async function deleteScholar(id) {
  if (!confirm("Delete this scholar?")) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadScholars();
}


// ===================================
// VIEW DETAILS
// ===================================
async function showScholarDetails(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const s = await res.json();

  detailName.textContent = s.fullname;
  detailProgram.textContent = "Program: " + s.degreeProgram;
  detailContact.textContent = "Contact: " + s.contactNo;
  detailID.textContent = s.scholarID || "N/A";
  detailYear.textContent = s.yearLevel + " Year";
  detailStatus.textContent = capitalize(s.status);
  detailEmail.textContent = s.email || "N/A";
  detailDate.textContent = new Date(s.dateAdded).toLocaleDateString();

  detailPicture.innerHTML = s.picture
    ? `<img src="${s.picture}"/>`
    : `<div class="avatar-placeholder"></div>`;

  detailsModal.style.display = "block";
}


function setupListeners() {
  addScholarBtn.onclick = openAddModal;
  cancelScholarBtn.onclick = closeAddModal;

  document.querySelectorAll(".modal .close").forEach(btn =>
    btn.onclick = () => {
      addScholarModal.style.display = "none";
      detailsModal.style.display = "none";
    }
  );

  window.onclick = (e) => {
    if (e.target === addScholarModal) closeAddModal();
    if (e.target === detailsModal) detailsModal.style.display = "none";
  };
}

function openAddModal() {
  modalTitle.textContent = "Add New Scholar";
  addScholarForm.reset();
  document.getElementById("editID").value = "";
  addScholarModal.style.display = "block";
}

function closeAddModal() {
  addScholarModal.style.display = "none";
}


// ===================================
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
