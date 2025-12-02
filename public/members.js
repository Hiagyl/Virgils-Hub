const API_URL = "http://localhost:5000/api/members";

// DOM Elements
const membersTableBody = document.getElementById("membersTableBody");
const addMemberModal = document.getElementById("addMemberModal");
const addMemberForm = document.getElementById("addMemberForm");
const openAddModal = document.getElementById("openAddModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const modalTitle = document.getElementById("modalTitle");

const searchInput = document.getElementById("searchInput");
const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");

let members = []; // local store


// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  loadMembers();
  setupListeners();
});


// LOAD MEMBERS
async function loadMembers() {
  try {
    const res = await fetch(API_URL);
    members = await res.json();
    updateDisplay();
  } catch (err) {
    console.error("Failed to load members");
  }
}


// MAIN DISPLAY HANDLER (search + sort)
function updateDisplay() {
  let list = applySearch(members);
  list = applySorting(list);
  renderMembers(list);
}


// RENDER TABLE
function renderMembers(list) {
  membersTableBody.innerHTML = "";

  if (!list.length) {
    membersTableBody.innerHTML =
      `<tr><td colspan="6" style="padding:20px; text-align:center;">No members found.</td></tr>`;
    return;
  }

  list.forEach(mem => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    row.innerHTML = `
      <td>${mem.memberID}</td>
      <td>${mem.fullname}</td>
      <td>${mem.contactNo}</td>
      <td>${new Date(mem.joinDate).toLocaleDateString()}</td>
      <td><span class="status-badge ${mem.status}">
          ${mem.status.charAt(0).toUpperCase() + mem.status.slice(1)}
      </span></td>
      <td>
        <button class="action-btn edit-btn" data-id="${mem._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${mem._id}">Delete</button>
      </td>
    `;

    membersTableBody.appendChild(row);
  });

  attachRowActions();
}


// =============================
// SEARCH
// =============================
function applySearch(list) {
  const q = searchInput.value.toLowerCase();
  if (!q) return list;

  return list.filter(m =>
    m.memberID.toLowerCase().includes(q) ||
    m.fullname.toLowerCase().includes(q) ||
    m.contactNo.includes(q)
  );
}

searchInput.addEventListener("input", updateDisplay);


// =============================
// SORTING
// =============================
sortField.addEventListener("change", updateDisplay);
sortDirection.addEventListener("change", updateDisplay);

function applySorting(list) {
  const field = sortField.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;

  return [...list].sort((a, b) => {
    if (field === "joinDate") {
      return (new Date(a.joinDate) - new Date(b.joinDate)) * dir;
    }
    return a[field].localeCompare(b[field]) * dir;
  });
}


// =============================
// ADD / EDIT / DELETE
// =============================
function attachRowActions() {
  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.onclick = () => startEdit(btn.dataset.id)
  );

  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.onclick = () => deleteMember(btn.dataset.id)
  );
}


// START EDIT
function startEdit(id) {
  const m = members.find(x => x._id === id);
  if (!m) return;

  modalTitle.textContent = "Edit Member";
  document.getElementById("editID").value = m._id;

  memberID.value = m.memberID;
  fullname.value = m.fullname;
  contactNo.value = m.contactNo;
  joinDate.value = m.joinDate.split("T")[0];
  status.value = m.status;

  addMemberModal.style.display = "block";
}


// SAVE HANDLER
addMemberForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editID").value;

  const data = {
    memberID: memberID.value.trim(),
    fullname: fullname.value.trim(),
    contactNo: contactNo.value.trim(),
    joinDate: joinDate.value,
    status: status.value
  };

  if (id) {
    await updateMember(id, data);
  } else {
    await createMember(data);
  }

  closeModalFn();
  loadMembers();
});


// CREATE MEMBER
async function createMember(data) {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}


// UPDATE MEMBER
async function updateMember(id, data) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}


// DELETE MEMBER
async function deleteMember(id) {
  if (!confirm("Delete this member?")) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadMembers();
}


// =============================
// MODAL CONTROL
// =============================
function setupListeners() {
  openAddModal.onclick = () => {
    modalTitle.textContent = "Add New Member";
    addMemberForm.reset();
    document.getElementById("editID").value = "";
    addMemberModal.style.display = "block";
  };

  closeModal.onclick = closeModalFn;
  cancelBtn.onclick = closeModalFn;

  window.onclick = e => {
    if (e.target === addMemberModal) closeModalFn();
  };
}

function closeModalFn() {
  addMemberModal.style.display = "none";
}
