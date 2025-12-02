// ===============================
// LOCAL STORAGE
// ===============================
let distributions = JSON.parse(localStorage.getItem("distributions") || "[]");

function saveData() {
  localStorage.setItem("distributions", JSON.stringify(distributions));
}


// ===============================
// ELEMENTS
// ===============================
const addDistributionBtn = document.getElementById("addDistributionBtn");
const addDistributionModal = document.getElementById("addDistributionModal");
const cancelDistributionBtn = document.getElementById("cancelDistributionBtn");
const addDistributionForm = document.getElementById("addDistributionForm");
const modalTitle = document.getElementById("modalTitle");

const distTableBody = document.getElementById("distTableBody");
const searchDist = document.getElementById("searchDist");

const sortField = document.getElementById("sortField");
const sortDirection = document.getElementById("sortDirection");


// ===============================
// MODAL OPEN / CLOSE
// ===============================
addDistributionBtn.onclick = () => {
  addDistributionForm.reset();
  document.getElementById("editID").value = "";
  modalTitle.textContent = "Add New Distribution";
  addDistributionModal.style.display = "block";
};

cancelDistributionBtn.onclick = () =>
  addDistributionModal.style.display = "none";

document.querySelector(".modal .close").onclick = () =>
  addDistributionModal.style.display = "none";

window.onclick = (e) => {
  if (e.target === addDistributionModal) addDistributionModal.style.display = "none";
};


// ===============================
// ADD / EDIT SUBMIT
// ===============================
addDistributionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const editID = document.getElementById("editID").value;

  const entry = {
    id: editID || ("DIST-" + String(distributions.length + 1).padStart(3, "0")),
    scholar: distScholar.value,
    type: distType.value,
    amount: Number(distAmount.value),
    location: distLocation.value,
    proof: distProof.value || "-"
  };

  if (editID) {
    const idx = distributions.findIndex(d => d.id === editID);
    if (idx !== -1) distributions[idx] = entry;
  } else {
    distributions.push(entry);
  }

  saveData();
  updateDisplay();
  addDistributionModal.style.display = "none";
});


// ===============================
// DELETE
// ===============================
function deleteDist(id) {
  if (!confirm("Delete this distribution?")) return;

  distributions = distributions.filter(d => d.id !== id);
  saveData();
  updateDisplay();
}


// ===============================
// EDIT
// ===============================
function editDist(id) {
  const d = distributions.find(x => x.id === id);
  if (!d) return;

  modalTitle.textContent = "Edit Distribution";

  document.getElementById("editID").value = d.id;
  distScholar.value = d.scholar;
  distType.value = d.type;
  distAmount.value = d.amount;
  distLocation.value = d.location;
  distProof.value = d.proof === "-" ? "" : d.proof;

  addDistributionModal.style.display = "block";
}


// ===============================
// RENDER
// ===============================
function renderDistributions(list) {
  distTableBody.innerHTML = "";

  list.forEach(d => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");

    row.innerHTML = `
      <td>${d.id}</td>
      <td>${d.scholar}</td>
      <td>${d.type}</td>
      <td>₱ ${d.amount.toLocaleString()}</td>
      <td>${d.location || "-"}</td>
      <td>${d.proof === "-" ? "-" : `<a href="${d.proof}" target="_blank">View</a>`}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editDist('${d.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteDist('${d.id}')">Delete</button>
      </td>
    `;

    distTableBody.appendChild(row);
  });
}


// ===============================
// SEARCH
// ===============================
searchDist.addEventListener("input", updateDisplay);

function applySearch(list) {
  const q = searchDist.value.toLowerCase();
  if (!q) return list;

  return list.filter(d =>
    d.id.toLowerCase().includes(q) ||
    d.scholar.toLowerCase().includes(q) ||
    d.type.toLowerCase().includes(q) ||
    String(d.amount).includes(q) ||
    (d.location || "").toLowerCase().includes(q)
  );
}


// ===============================
// SORTING
// ===============================
sortField.addEventListener("change", updateDisplay);
sortDirection.addEventListener("change", updateDisplay);

function applySorting(list) {
  const field = sortField.value;
  const dir = sortDirection.value === "asc" ? 1 : -1;

  return [...list].sort((a, b) => {
    if (field === "amount") return (a.amount - b.amount) * dir;
    return a[field].localeCompare(b[field]) * dir;
  });
}


// ===============================
// UPDATE DISPLAY
// ===============================
function updateDisplay() {
  let list = applySearch(distributions);
  list = applySorting(list);
  renderDistributions(list);
}


// INIT
updateDisplay();
