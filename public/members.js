// Base API URL
const API_URL = "http://localhost:5000/api/members";

const tableBody = document.getElementById("membersTableBody");
const searchInput = document.getElementById("searchInput");
const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");

// Modal Elements
const modal = document.getElementById("addMemberModal");
const openModalBtn = document.getElementById("openAddModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const form = document.getElementById("addMemberForm");
const modalTitle = document.getElementById("modalTitle");

const editID = document.getElementById("editID");
const memberIDInput = document.getElementById("memberID");
const fullnameInput = document.getElementById("fullname");
const contactInput = document.getElementById("contactNo");
const joinDateInput = document.getElementById("joinDate");
const statusInput = document.getElementById("status");

// ─────────────────────────────────────────────
// LOAD MEMBERS
// ─────────────────────────────────────────────
async function loadMembers() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    renderMembers(data);
  } catch (err) {
    console.error("Error loading members:", err);
  }
}

// ─────────────────────────────────────────────
// RENDER TABLE
// ─────────────────────────────────────────────
function renderMembers(members) {
  // SEARCH
  const searchValue = searchInput.value.toLowerCase();
  members = members.filter(m =>
    m.fullname.toLowerCase().includes(searchValue) ||
    m.memberID.toLowerCase().includes(searchValue)
  );

  // SORT
  const field = sortField.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;

  members.sort((a, b) => {
    let x = a[field];
    let y = b[field];

    if (field === "joinDate") {
      x = new Date(x);
      y = new Date(y);
    }

    return x > y ? dir : x < y ? -dir : 0;
  });

  tableBody.innerHTML = "";

  members.forEach(member => {
    const tr = document.createElement("tr");
    tr.classList.add("fade-in");

    tr.innerHTML = `
            <td>${member.memberID}</td>
            <td>${member.fullname}</td>
            <td>${member.contactNo}</td>
            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            <td>${member.status}</td>
            <td>
                <button class="action-btn edit-btn" onclick="openEdit('${member._id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteMember('${member._id}')">Delete</button>
            </td>
        `;

    tableBody.appendChild(tr);
  });
}

// ─────────────────────────────────────────────
// OPEN ADD MEMBER MODAL
// ─────────────────────────────────────────────
openModalBtn.onclick = () => {
  modalTitle.textContent = "Add New Member";
  editID.value = "";
  form.reset();
  modal.style.display = "block";
};

// ─────────────────────────────────────────────
// OPEN EDIT MEMBER MODAL
// ─────────────────────────────────────────────
async function openEdit(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const member = await res.json();

    modalTitle.textContent = "Edit Member";
    editID.value = member._id;

    memberIDInput.value = member.memberID;
    fullnameInput.value = member.fullname;
    contactInput.value = member.contactNo;
    joinDateInput.value = member.joinDate.split("T")[0];
    statusInput.value = member.status;

    modal.style.display = "block";
  } catch (err) {
    console.error("Error loading member:", err);
  }
}

window.openEdit = openEdit; // expose to HTML buttons

// ─────────────────────────────────────────────
// CLOSE MODAL
// ─────────────────────────────────────────────
closeModalBtn.onclick = () => modal.style.display = "none";
cancelBtn.onclick = () => modal.style.display = "none";

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ─────────────────────────────────────────────
// SUBMIT FORM (ADD OR EDIT)
// ─────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const member = {
    memberID: memberIDInput.value,
    fullname: fullnameInput.value,
    contactNo: contactInput.value,
    joinDate: joinDateInput.value || new Date(),
    status: statusInput.value
  };

  try {
    if (editID.value) {
      // UPDATE
      await fetch(`${API_URL}/${editID.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member)
      });
    } else {
      // CREATE
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member)
      });
    }

    modal.style.display = "none";
    loadMembers();

  } catch (err) {
    console.error("Error saving member:", err);
  }
});

// ─────────────────────────────────────────────
// DELETE MEMBER
// ─────────────────────────────────────────────
async function deleteMember(id) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadMembers();
  } catch (err) {
    console.error("Error deleting member:", err);
  }
}

window.deleteMember = deleteMember;

// ─────────────────────────────────────────────
// SEARCH + SORT LISTENERS
// ─────────────────────────────────────────────
searchInput.addEventListener("input", loadMembers);
sortField.addEventListener("change", loadMembers);
sortDirection.addEventListener("change", loadMembers);

// ─────────────────────────────────────────────
// INIT LOAD
// ─────────────────────────────────────────────
loadMembers();
