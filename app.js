let entries = [];
let rowCounter = 1;

// Initialize app
window.onload = function() {
    if (localStorage.getItem('loggedIn') === 'true') {
        showApp();
        loadData();
    }
    document.getElementById('reportDate').valueAsDate = new Date();
};

// Login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);
        showApp();
    } else {
        alert('Please enter username and password');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedIn');
        location.reload();
    }
}

function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appPage').classList.remove('hidden');
}

// Add new row
function addRow(type) {
    const entry = {
        id: Date.now(),
        slNo: rowCounter++,
        name: '',
        item: '',
        rate: 0,
        amount: 0,
        total: 0,
        type: type
    };
    entries.push(entry);
    renderTable();
    saveData();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.slNo}</td>
            <td><input type="text" value="${entry.name}" onchange="updateEntry(${index}, 'name', this.value)" ondblclick="this.select()"></td>
            <td><input type="text" value="${entry.item}" onchange="updateEntry(${index}, 'item', this.value)" ondblclick="this.select()"></td>
            <td><input type="number" value="${entry.rate}" onchange="updateEntry(${index}, 'rate', this.value)" ondblclick="this.select()"></td>
            <td><input type="number" value="${entry.amount}" onchange="updateEntry(${index}, 'amount', this.value)" ondblclick="this.select()"></td>
            <td><strong>${entry.total.toFixed(2)}</strong></td>
            <td>
                <span class="type-badge type-${entry.type}">
                    ${entry.type === 'received' ? '+ Received' : '- Handover'}
                </span>
            </td>
            <td><button class="delete-btn" onclick="deleteEntry(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
    
    calculate();
}

// Update entry
function updateEntry(index, field, value) {
    entries[index][field] = field === 'rate' || field === 'amount' ? parseFloat(value) || 0 : value;
    entries[index].total = entries[index].rate * entries[index].amount;
    renderTable();
    saveData();
}

// Delete entry
function deleteEntry(index) {
    if (confirm('Delete this entry?')) {
        entries.splice(index, 1);
        renderTable();
        saveData();
    }
}

// Calculate totals
function calculate() {
    const openingBal = parseFloat(document.getElementById('openingBal').value) || 0;
    
    let received = 0;
    let handover = 0;
    
    entries.forEach(entry => {
        if (entry.type === 'received') {
            received += entry.total;
        } else {
            handover += entry.total;
        }
    });
    
    const pettyCash = received - handover;
    const grandTotal = openingBal + pettyCash;
    
    document.getElementById('pettyCash').textContent = pettyCash.toFixed(2);
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
}

// Save data to localStorage
function saveData() {
    const data = {
        date: document.getElementById('reportDate').value,
        openingBal: document.getElementById('openingBal').value,
        entries: entries,
        rowCounter: rowCounter
    };
    localStorage.setItem('cashReportData', JSON.stringify(data));
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('cashReportData');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('reportDate').value = data.date;
        document.getElementById('openingBal').value = data.openingBal;
        entries = data.entries || [];
        rowCounter = data.rowCounter || 1;
        renderTable();
    }
}

// Clear all data
function clearAll() {
    if (confirm('Clear all data? This cannot be undone.')) {
        entries = [];
        rowCounter = 1;
        document.getElementById('openingBal').value = '';
        document.getElementById('reportDate').valueAsDate = new Date();
        renderTable();
        saveData();
    }
}

// Export as image
function exportAsImage() {
    const container = document.querySelector('.container');
    const buttons = document.querySelectorAll('.action-buttons, .export-buttons');
    
    buttons.forEach(btn => btn.style.display = 'none');
    
    html2canvas(container, {
        scale: 2,
        backgroundColor: '#f5f7fa',
        logging: false
    }).then(canvas => {
        buttons.forEach(btn => btn.style.display = '');
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cash-report-${document.getElementById('reportDate').value}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}
