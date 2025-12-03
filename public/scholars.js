document.addEventListener("DOMContentLoaded", () => {
  // ====== ELEMENTS ======
  const addScholarBtn = document.getElementById("addScholarBtn");
  const addScholarModal = document.getElementById("addScholarModal");
  const cancelScholarBtn = document.getElementById("cancelScholarBtn");
  const addScholarForm = document.getElementById("addScholarForm");
  const modalTitle = document.getElementById("modalTitle");
  const scholarsTableBody = document.getElementById("scholarsTableBody");

  const searchInput = document.getElementById("searchInput");
  const sortField = document.getElementById("sortField");
  const sortDirection = document.getElementById("sortDirection");

  let scholars = [];

  // ====== MODAL OPEN/CLOSE ======
  addScholarBtn.onclick = () => {
    addScholarForm.reset();
    document.getElementById("editID").value = "";
    modalTitle.textContent = "Add New Scholar";
    addScholarModal.style.display = "block";
  };

  cancelScholarBtn.onclick = () => (addScholarModal.style.display = "none");
  document.querySelector(".modal .close").onclick = () =>
    (addScholarModal.style.display = "none");
  window.onclick = (e) => {
    if (e.target === addScholarModal) addScholarModal.style.display = "none";
  };

  // ====== LOAD SCHOLARS ======
  async function loadScholars() {
    try {
      const res = await fetch("http://localhost:5000/api/scholars");
      const data = await res.json();
      scholars = data;
      renderScholars(scholars);
    } catch (err) {
      console.error("Error loading scholars:", err);
      alert("Error fetching scholars data");
    }
  }

  // ====== ADD / EDIT SCHOLAR ======
  addScholarForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editID = document.getElementById("editID").value.trim();

    // Get form values
    const scholarID = document.getElementById("scholarID").value.trim();
    const fullname = document.getElementById("fullname").value.trim();
    // const email = document.getElementById("email").value.trim();
    const contactNo = document.getElementById("contactNo").value.trim();
    const picture = document.getElementById("picture").value.trim();
    const degreeProgram = document.getElementById("degreeProgram").value;
    const yearLevel = Number(document.getElementById("yearLevel").value);
    const status = document.getElementById("status").value;

    // Required fields check
    if (!scholarID || !fullname || !degreeProgram || !yearLevel || !contactNo) {
      return alert("Please fill in all required fields (*)");
    }

    const payload = {
      scholarID,
      fullname,
      // email,
      contactNo,
      picture,
      degreeProgram,
      yearLevel,
      status,
    };

    const apiUrl = "http://localhost:5000/api/scholars";
    const method = editID ? "PUT" : "POST";
    const url = editID ? `${apiUrl}/${editID}` : apiUrl;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) return alert(data.message || "Error saving scholar");

      addScholarForm.reset();
      addScholarModal.style.display = "none";
      loadScholars();
    } catch (err) {
      console.error(err);
      alert("Error saving scholar");
    }
  });

  // ====== DELETE SCHOLAR ======
  async function deleteScholar(id) {
    if (!confirm("Delete this scholar?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/scholars/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Error deleting scholar");
      loadScholars();
    } catch (err) {
      console.error(err);
      alert("Error deleting scholar");
    }
  }
  window.deleteScholar = deleteScholar;

  // ====== EDIT SCHOLAR ======
  function editScholar(id) {
    const scholar = scholars.find((s) => s._id === id);
    if (!scholar) return;

    modalTitle.textContent = "Edit Scholar";
    document.getElementById("editID").value = scholar._id;
    document.getElementById("scholarID").value = scholar.scholarID || "";
    document.getElementById("fullname").value = scholar.fullname || "";
    // document.getElementById("email").value = scholar.email || "";
    document.getElementById("contactNo").value = scholar.contactNo || "";
    document.getElementById("picture").value = scholar.picture || "";
    document.getElementById("degreeProgram").value = scholar.degreeProgram || "";
    document.getElementById("yearLevel").value = scholar.yearLevel || "";
    document.getElementById("status").value = scholar.status || "active";

    addScholarModal.style.display = "block";
  }
  window.editScholar = editScholar;

  // ====== RENDER ======
  function renderScholars(list) {
    const query = searchInput.value.toLowerCase();
    if (query) {
      list = list.filter(
        (s) =>
          s.fullname.toLowerCase().includes(query) ||
          // (s.email && s.email.toLowerCase().includes(query)) ||
          s.contactNo.includes(query) ||
          s.degreeProgram.toLowerCase().includes(query) ||
          String(s.yearLevel).includes(query) ||
          s.status.toLowerCase().includes(query) ||
          (s.scholarID && s.scholarID.toLowerCase().includes(query))
      );
    }

    const field = sortField.value;
    const dir = sortDirection.value === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (field === "yearLevel") return (a.yearLevel - b.yearLevel) * dir;
      if (field === "id") return (a.scholarID || "").localeCompare(b.scholarID || "") * dir;
      return (a[field] || "").toString().localeCompare((b[field] || "").toString()) * dir;
    });

    scholarsTableBody.innerHTML = "";
    list.forEach((s) => {
      const row = document.createElement("tr");
      row.classList.add("fade-in");
      row.innerHTML = `
        <td>${s.scholarID || s._id}</td>
        <td><img src="${s.picture || 'https://via.placeholder.com/50'}" width="50" height="50"></td>
        <td>${s.fullname}</td>
        <td>${s.degreeProgram}</td>
        <td>${s.yearLevel}</td>
        <td>${s.contactNo}</td>
        <td>${s.status}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editScholar('${s._id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteScholar('${s._id}')">Delete</button>
        </td>
      `;
      scholarsTableBody.appendChild(row);
    });
  }

  // ====== EVENT LISTENERS ======
  searchInput.addEventListener("input", () => renderScholars(scholars));
  sortField.addEventListener("change", () => renderScholars(scholars));
  sortDirection.addEventListener("change", () => renderScholars(scholars));

  // ====== INITIAL LOAD ======
  loadScholars();
});
