const API_URL = "http://localhost:5000/api/distributions";

const addDistributionBtn = document.getElementById("addDistributionBtn");
const addDistributionModal = document.getElementById("addDistributionModal");
const cancelDistributionBtn = document.getElementById("cancelDistributionBtn");
const addDistributionForm = document.getElementById("addDistributionForm");
const distTableBody = document.getElementById("distTableBody");
const searchDist = document.getElementById("searchDist");

let distributions = [];

/* =========================
   OPEN / CLOSE MODAL
========================= */
addDistributionBtn.onclick = () => {
  addDistributionForm.reset();
  document.getElementById("editID").value = "";
  document.getElementById("modalTitle").textContent = "Add New Distribution";
  addDistributionModal.style.display = "block";
};

cancelDistributionBtn.onclick = () => {
  addDistributionModal.style.display = "none";
};

/* =========================
   SUBMIT FORM
========================= */
addDistributionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editID").value;

  const data = {
    scholar: distScholar.value,
    type: distType.value,
    amount: Number(distAmount.value),
    location: distLocation.value,
    proof: distProof.value
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  addDistributionModal.style.display = "none";
  loadDistributions();
});

/* =========================
   LOAD
========================= */
async function loadDistributions() {
  const res = await fetch(API_URL);
  distributions = await res.json();
  renderDistributions(distributions);
}

/* =========================
   DELETE
========================= */
async function deleteDist(id) {
  if (!confirm("Delete this distribution?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadDistributions();
}

/* =========================
   EDIT
========================= */
function editDist(id) {
  const d = distributions.find(x => x._id === id);
  if (!d) return;

  document.getElementById("editID").value = d._id;
  document.getElementById("modalTitle").textContent = "Edit Distribution";

  distScholar.value = d.scholar;
  distType.value = d.type;
  distAmount.value = d.amount;
  distLocation.value = d.location;
  distProof.value = d.proof;

  addDistributionModal.style.display = "block";
}

/* =========================
   RENDER TABLE
========================= */
function renderDistributions(list) {
  distTableBody.innerHTML = "";

  list.forEach(d => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${d.distributionID}</td>
      <td>${d.scholar}</td>
      <td>${d.type}</td>
      <td>₱ ${d.amount.toLocaleString()}</td>
      <td>${d.location || "-"}</td>
      <td>${d.proof ? `<a href="${d.proof}" target="_blank">View</a>` : "-"}</td>
      <td>
        <button class="action-btn edit-btn"
                onclick="editDist('${d._id}')">
          Edit
        </button>
        <button class="action-btn delete-btn"
                onclick="deleteDist('${d._id}')">
          Delete
        </button>
      </td>
    `;

    distTableBody.appendChild(row);
  });
}

/* =========================
   SEARCH
========================= */
searchDist.addEventListener("input", () => {
  const value = searchDist.value.toLowerCase();
  renderDistributions(
    distributions.filter(d =>
      d.scholar.toLowerCase().includes(value)
    )
  );
});

/* =========================
   INIT
========================= */
loadDistributions();
