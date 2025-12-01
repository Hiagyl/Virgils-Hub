// API Configuration
const API_URL = 'http://localhost:5000/api/scholars';

// DOM Elements
const addScholarBtn = document.getElementById('addScholarBtn');
const addScholarModal = document.getElementById('addScholarModal');
const detailsModal = document.getElementById('detailsModal');
const closeBtns = document.querySelectorAll('.close');
const cancelScholarBtn = document.getElementById('cancelScholarBtn');
const addScholarForm = document.getElementById('addScholarForm');
const scholarsTableBody = document.getElementById('scholarsTableBody');
const searchFilter = document.getElementById('searchFilter');
const statusFilter = document.getElementById('statusFilter');
const yearFilter = document.getElementById('yearFilter');

// Load scholars on page load
document.addEventListener('DOMContentLoaded', () => {
  loadScholars();
  setupEventListeners();
});

// Fetch and display all scholars
async function loadScholars() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch scholars');
    
    const scholars = await response.json();
    renderScholars(scholars);
  } catch (error) {
    console.error('Error loading scholars:', error);
    showMessage('Failed to load scholars', 'error');
  }
}

// Render scholars to the table
function renderScholars(scholars) {
  if (!scholarsTableBody) return;
  
  scholarsTableBody.innerHTML = '';
  
  if (!scholars || scholars.length === 0) {
    scholarsTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px;">
          <div style="color: #666; font-size: 16px;">
            <i class="fas fa-user-graduate" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
            No scholars found. Click "Add Scholar" to create one.
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  scholars.forEach(scholar => {
    const row = document.createElement('tr');
    
    // Format year level
    const yearText = scholar.yearLevel === 1 ? '1st' : 
                     scholar.yearLevel === 2 ? '2nd' : 
                     scholar.yearLevel === 3 ? '3rd' : 
                     scholar.yearLevel === 4 ? '4th' : '5th';
    
    // Status badge
    const statusClass = scholar.status === 'active' ? 'active' : 
                       scholar.status === 'graduate' ? 'graduate' : 'inactive';
    const statusText = scholar.status === 'active' ? 'Active' : 
                      scholar.status === 'graduate' ? 'Graduated' : 'Inactive';
    
    row.innerHTML = `
      <td><strong>${scholar.scholarID || 'N/A'}</strong></td>
      <td>
        <div class="table-avatar">
          ${scholar.picture ? 
            `<img src="${scholar.picture}" alt="${scholar.fullname}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👨‍🎓</text></svg>'">` : 
            '<div class="avatar-placeholder"><i class="fas fa-user-graduate"></i></div>'}
        </div>
      </td>
      <td><strong>${scholar.fullname}</strong></td>
      <td>${scholar.degreeProgram || 'N/A'}</td>
      <td>${yearText} Year</td>
      <td>${scholar.contactNo || 'N/A'}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" data-id="${scholar._id}" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn edit-btn" data-id="${scholar._id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${scholar._id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    scholarsTableBody.appendChild(row);
  });
  
  // Attach event listeners to action buttons
  attachActionListeners();
}

// Setup event listeners
function setupEventListeners() {
  // Add Scholar button
  if (addScholarBtn) {
    addScholarBtn.addEventListener('click', openAddModal);
  }
  
  // Modal close buttons
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      addScholarModal.style.display = 'none';
      detailsModal.style.display = 'none';
    });
  });
  
  // Cancel button
  if (cancelScholarBtn) {
    cancelScholarBtn.addEventListener('click', () => {
      addScholarModal.style.display = 'none';
    });
  }
  
  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === addScholarModal) addScholarModal.style.display = 'none';
    if (e.target === detailsModal) detailsModal.style.display = 'none';
  });
  
  // Form submission
  if (addScholarForm) {
    addScholarForm.addEventListener('submit', handleAddScholar);
  }
  
  // Filter events
  if (searchFilter) {
    searchFilter.addEventListener('input', debounce(filterScholars, 300));
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterScholars);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', filterScholars);
  }
}

// Open add scholar modal
function openAddModal() {
  addScholarModal.style.display = 'block';
  addScholarForm.reset();
  // Set current date as default
  document.getElementById('status').value = 'active';
}

// Handle form submission
async function handleAddScholar(e) {
  e.preventDefault();
  
  const scholarData = {
    fullname: document.getElementById('fullname').value.trim(),
    picture: document.getElementById('picture').value.trim() || '',
    status: document.getElementById('status').value,
    degreeProgram: document.getElementById('degreeProgram').value,
    yearLevel: parseInt(document.getElementById('yearLevel').value),
    contactNo: document.getElementById('contactNo').value.trim(),
    email: document.getElementById('email').value.trim() || ''
  };
  
  // Validation
  if (!scholarData.fullname || !scholarData.degreeProgram || 
      !scholarData.yearLevel || !scholarData.contactNo) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scholarData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add scholar');
    }
    
    showMessage('Scholar added successfully!', 'success');
    addScholarModal.style.display = 'none';
    loadScholars(); // Refresh the table
  } catch (error) {
    console.error('Error adding scholar:', error);
    showMessage(error.message || 'Failed to add scholar', 'error');
  }
}

// Attach listeners to action buttons
function attachActionListeners() {
  // View buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scholarId = e.currentTarget.dataset.id;
      showScholarDetails(scholarId);
    });
  });
  
  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scholarId = e.currentTarget.dataset.id;
      editScholar(scholarId);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scholarId = e.currentTarget.dataset.id;
      deleteScholar(scholarId);
    });
  });
}

// Show scholar details
async function showScholarDetails(scholarId) {
  try {
    const response = await fetch(`${API_URL}/${scholarId}`);
    if (!response.ok) throw new Error('Failed to fetch scholar details');
    
    const scholar = await response.json();
    
    // Populate details modal
    document.getElementById('detailName').textContent = scholar.fullname;
    document.getElementById('detailProgram').textContent = `Program: ${scholar.degreeProgram}`;
    document.getElementById('detailContact').textContent = `Contact: ${scholar.contactNo}`;
    document.getElementById('detailID').textContent = scholar.scholarID || 'N/A';
    document.getElementById('detailYear').textContent = scholar.yearLevel ? 
      (scholar.yearLevel === 1 ? '1st Year' : 
       scholar.yearLevel === 2 ? '2nd Year' : 
       scholar.yearLevel === 3 ? '3rd Year' : 
       scholar.yearLevel === 4 ? '4th Year' : '5th Year') : 'N/A';
    document.getElementById('detailStatus').textContent = scholar.status ? 
      scholar.status.charAt(0).toUpperCase() + scholar.status.slice(1) : 'N/A';
    document.getElementById('detailEmail').textContent = scholar.email || 'N/A';
    document.getElementById('detailDate').textContent = scholar.dateAdded ? 
      new Date(scholar.dateAdded).toLocaleDateString() : 'N/A';
    
    // Set picture if available
    const pictureElement = document.getElementById('detailPicture');
    if (scholar.picture) {
      pictureElement.innerHTML = `<img src="${scholar.picture}" alt="${scholar.fullname}" 
        onerror="this.parentElement.innerHTML='<i class=\"fas fa-user-graduate\"></i>'">`;
    } else {
      pictureElement.innerHTML = '<i class="fas fa-user-graduate"></i>';
    }
    
    // Show modal
    detailsModal.style.display = 'block';
  } catch (error) {
    console.error('Error loading scholar details:', error);
    showMessage('Failed to load scholar details', 'error');
  }
}

// Edit scholar
function editScholar(scholarId) {
  showMessage('Edit functionality coming soon!', 'info');
  // You can implement edit modal similar to add modal
}

// Delete scholar
async function deleteScholar(scholarId) {
  if (!confirm('Are you sure you want to delete this scholar? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${scholarId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete scholar');
    }
    
    showMessage('Scholar deleted successfully!', 'success');
    loadScholars(); // Refresh the table
  } catch (error) {
    console.error('Error deleting scholar:', error);
    showMessage('Failed to delete scholar', 'error');
  }
}

// Filter scholars
async function filterScholars() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch scholars');
    
    let scholars = await response.json();
    
    // Apply search filter
    const searchTerm = searchFilter.value.toLowerCase();
    if (searchTerm) {
      scholars = scholars.filter(scholar => 
        (scholar.fullname && scholar.fullname.toLowerCase().includes(searchTerm)) ||
        (scholar.degreeProgram && scholar.degreeProgram.toLowerCase().includes(searchTerm)) ||
        (scholar.scholarID && scholar.scholarID.toLowerCase().includes(searchTerm)) ||
        (scholar.contactNo && scholar.contactNo.includes(searchTerm))
      );
    }
    
    // Apply status filter
    const statusValue = statusFilter.value;
    if (statusValue !== 'all') {
      scholars = scholars.filter(scholar => scholar.status === statusValue);
    }
    
    // Apply year filter
    const yearValue = yearFilter.value;
    if (yearValue !== 'all') {
      scholars = scholars.filter(scholar => scholar.yearLevel == yearValue);
    }
    
    renderScholars(scholars);
  } catch (error) {
    console.error('Error filtering scholars:', error);
  }
}

// Utility: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility: Show message to user
function showMessage(message, type) {
  // Remove existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) existingMessage.remove();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 6px;
    color: white;
    z-index: 10000;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') {
    messageDiv.style.backgroundColor = '#10b981';
  } else if (type === 'error') {
    messageDiv.style.backgroundColor = '#ef4444';
  } else if (type === 'info') {
    messageDiv.style.backgroundColor = '#3b82f6';
  } else {
    messageDiv.style.backgroundColor = '#6b7280';
  }
  
  document.body.appendChild(messageDiv);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => messageDiv.remove(), 300);
    }
  }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);