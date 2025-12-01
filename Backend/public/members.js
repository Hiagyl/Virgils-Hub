// API base URL
const API_URL = 'http://localhost:5000/api/members';

// DOM elements
const membersTableBody = document.querySelector('.members-table tbody');
const addMemberBtn = document.querySelector('.btn');
const modal = document.getElementById('addMemberModal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const addMemberForm = document.getElementById('addMemberForm');
const searchInput = document.querySelector('.filters-card input[type="text"]');
const statusFilter = document.querySelector('.filters-card select');

// Load members on page load
document.addEventListener('DOMContentLoaded', () => {
  loadMembers();
  setupEventListeners();
});

// Fetch and display all members
async function loadMembers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch members');
    
    const members = await response.json();
    renderMembers(members);
  } catch (error) {
    console.error('Error loading members:', error);
    showMessage('Failed to load members', 'error');
  }
}

// Render members to the table
function renderMembers(members) {
  if (!membersTableBody) return;
  
  membersTableBody.innerHTML = '';
  
  if (members.length === 0) {
    membersTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px;">
          No members found. Click "Add Member" to create one.
        </td>
      </tr>
    `;
    return;
  }
  
  members.forEach(member => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${member.memberID}</td>
      <td>${member.fullname}</td>
      <td>${member.contactNo}</td>
      <td>${new Date(member.joinDate).toLocaleDateString()}</td>
      <td>
        <span class="status-badge ${member.status}">
          ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </span>
      </td>
    `;
    membersTableBody.appendChild(row);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Add Member button
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }
  
  // Modal close buttons
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
  
  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Form submission
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', handleAddMember);
  }
  
  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterMembers, 300));
  }
  
  // Status filter
  if (statusFilter) {
    statusFilter.addEventListener('change', filterMembers);
  }
}

// Open modal
function openModal() {
  if (modal) {
    modal.style.display = 'block';
    addMemberForm.reset();
    // Set today's date as default
    document.getElementById('joinDate').valueAsDate = new Date();
  }
}

// Close modal
function closeModal() {
  if (modal) {
    modal.style.display = 'none';
  }
}

// Handle form submission
async function handleAddMember(e) {
  e.preventDefault();
  
  const memberData = {
    memberID: document.getElementById('memberID').value.trim(),
    fullname: document.getElementById('fullname').value.trim(),
    contactNo: document.getElementById('contactNo').value.trim(),
    joinDate: document.getElementById('joinDate').value || new Date().toISOString().split('T')[0],
    status: document.getElementById('status').value
  };
  
  // Validation
  if (!memberData.memberID || !memberData.fullname || !memberData.contactNo) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add member');
    }
    
    showMessage('Member added successfully!', 'success');
    closeModal();
    loadMembers(); // Refresh the table
  } catch (error) {
    console.error('Error adding member:', error);
    showMessage(error.message || 'Failed to add member', 'error');
  }
}

// Filter members based on search and status
async function filterMembers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch members');
    
    let members = await response.json();
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      members = members.filter(member => 
        member.fullname.toLowerCase().includes(searchTerm) ||
        member.memberID.toLowerCase().includes(searchTerm) ||
        member.contactNo.includes(searchTerm)
      );
    }
    
    // Apply status filter
    const statusValue = statusFilter.value.toLowerCase();
    if (statusValue !== 'all') {
      members = members.filter(member => member.status === statusValue);
    }
    
    renderMembers(members);
  } catch (error) {
    console.error('Error filtering members:', error);
  }
}

// Utility: Debounce function for search
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
    padding: 10px 20px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') {
    messageDiv.style.backgroundColor = '#4CAF50';
  } else {
    messageDiv.style.backgroundColor = '#f44336';
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