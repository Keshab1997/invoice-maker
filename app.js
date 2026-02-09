let rowCounter = 0;

// Login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        localStorage.setItem('loggedIn', 'true');
        showApp();
        return false;
    } else {
        alert('Please enter username and password');
        return false;
    }
}

function logout() {
    localStorage.removeItem('loggedIn');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('appPage').classList.add('hidden');
    document.getElementById('appPage').classList.remove('active');
}

function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('appPage').classList.remove('hidden');
    document.getElementById('appPage').classList.add('active');
    loadData();
}

window.onload = function() {
    if (localStorage.getItem('loggedIn') === 'true') {
        showApp();
    }
    document.getElementById('reportDate').valueAsDate = new Date();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
};

// Add Row
function addRow(type) {
    rowCounter++;
    const tbody = type === 'received' ? document.getElementById('receivedBody') : document.getElementById('handoverBody');
    const row = tbody.insertRow();
    row.id = `row-${rowCounter}`;
    
    row.innerHTML = `
        <td>${tbody.rows.length}</td>
        <td><input type="text" placeholder="Name" onchange="saveData()" list="nameList"></td>
        <td><input type="text" placeholder="Item" onchange="saveData()" list="itemList"></td>
        <td><input type="number" placeholder="0" min="0" onfocus="clearZero(this)" onblur="restoreZero(this)" onchange="calculate()" list="rateList"></td>
        <td><input type="number" placeholder="0" min="0" onfocus="clearZero(this)" onblur="restoreZero(this)" onchange="calculate()" list="amountList"></td>
        <td class="total">0.00</td>
        <td><button class="delete-btn" onclick="deleteRow('${row.id}', '${type}')">Delete</button></td>
    `;
    
    row.dataset.type = type;
    addMobileCard(rowCounter, type);
    updateDatalist();
    saveData();
}

// Add Mobile Card
function addMobileCard(id, type) {
    const mobileCards = document.getElementById('mobileCards');
    const typeSymbol = type === 'received' ? '+' : '-';
    const typeClass = type === 'received' ? 'type-received' : 'type-handover';
    
    const card = document.createElement('div');
    card.className = 'card-item';
    card.id = `card-${id}`;
    card.dataset.type = type;
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-sl">#${id}</span>
            <span class="card-type ${typeClass}">${typeSymbol}</span>
        </div>
        <div class="card-body">
            <div class="card-field">
                <label>Name</label>
                <input type="text" placeholder="Name" onchange="syncData(${id})" list="nameList">
            </div>
            <div class="card-field">
                <label>Item</label>
                <input type="text" placeholder="Item" onchange="syncData(${id})" list="itemList">
            </div>
            <div class="card-field">
                <label>Rate</label>
                <input type="number" placeholder="0" min="0" onfocus="clearZero(this)" onblur="restoreZero(this)" onchange="syncData(${id}); calculate()" list="rateList">
            </div>
            <div class="card-field">
                <label>Amount</label>
                <input type="number" placeholder="0" min="0" onfocus="clearZero(this)" onblur="restoreZero(this)" onchange="syncData(${id}); calculate()" list="amountList">
            </div>
            <div class="card-total">Total: <span class="card-total-value">0.00</span></div>
        </div>
        <div class="card-footer">
            <button class="delete-btn" onclick="deleteRow('row-${id}')">Delete</button>
        </div>
    `;
    
    mobileCards.appendChild(card);
}

// Sync Data between table and cards
function syncData(id) {
    const row = document.getElementById(`row-${id}`);
    const card = document.getElementById(`card-${id}`);
    
    if (row && card) {
        const cardInputs = card.querySelectorAll('input');
        const rowInputs = row.querySelectorAll('input');
        
        cardInputs.forEach((input, index) => {
            if (rowInputs[index]) {
                rowInputs[index].value = input.value;
            }
        });
    }
    
    saveData();
}

// Delete Row
function deleteRow(rowId, type) {
    const row = document.getElementById(rowId);
    if (row) {
        const cardId = rowId.replace('row-', 'card-');
        const card = document.getElementById(cardId);
        if (card) card.remove();
        row.remove();
    }
    updateSerialNumbers();
    calculate();
    saveData();
}

// Update Serial Numbers
function updateSerialNumbers() {
    const receivedRows = document.querySelectorAll('#receivedBody tr');
    const handoverRows = document.querySelectorAll('#handoverBody tr');
    const cards = document.querySelectorAll('.card-item');
    
    receivedRows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
    
    handoverRows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
    
    cards.forEach((card, index) => {
        card.querySelector('.card-sl').textContent = `#${index + 1}`;
    });
}

// Calculate
function calculate() {
    const receivedRows = document.querySelectorAll('#receivedBody tr');
    const handoverRows = document.querySelectorAll('#handoverBody tr');
    const openingBal = parseFloat(document.getElementById('openingBal').value) || 0;
    let totalReceived = 0;
    let totalHandover = 0;
    
    receivedRows.forEach((row, index) => {
        const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const amount = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const total = rate * amount;
        
        row.cells[5].textContent = total.toFixed(2);
        totalReceived += total;
        
        // Update mobile card total
        const receivedCards = document.querySelectorAll('.card-item[data-type="received"]');
        if (receivedCards[index]) {
            receivedCards[index].querySelector('.card-total-value').textContent = total.toFixed(2);
        }
    });
    
    handoverRows.forEach((row, index) => {
        const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const amount = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const total = rate * amount;
        
        row.cells[5].textContent = total.toFixed(2);
        totalHandover += total;
        
        // Update mobile card total
        const handoverCards = document.querySelectorAll('.card-item[data-type="handover"]');
        if (handoverCards[index]) {
            handoverCards[index].querySelector('.card-total-value').textContent = total.toFixed(2);
        }
    });
    
    const closingBal = openingBal + totalReceived - totalHandover;
    
    document.getElementById('totalReceived').textContent = totalReceived.toFixed(2);
    document.getElementById('totalHandover').textContent = totalHandover.toFixed(2);
    document.getElementById('summaryOpening').textContent = openingBal.toFixed(2);
    document.getElementById('closingBal').textContent = closingBal.toFixed(2);
    
    saveData();
}

// Save Data
function saveData() {
    const data = {
        customerName: document.getElementById('customerName').value,
        reportTitle: document.getElementById('reportTitle').value,
        reportDate: document.getElementById('reportDate').value,
        openingBal: document.getElementById('openingBal').value,
        received: [],
        handover: []
    };
    
    const receivedRows = document.querySelectorAll('#receivedBody tr');
    receivedRows.forEach(row => {
        data.received.push({
            name: row.cells[1].querySelector('input').value,
            item: row.cells[2].querySelector('input').value,
            rate: row.cells[3].querySelector('input').value,
            amount: row.cells[4].querySelector('input').value
        });
    });
    
    const handoverRows = document.querySelectorAll('#handoverBody tr');
    handoverRows.forEach(row => {
        data.handover.push({
            name: row.cells[1].querySelector('input').value,
            item: row.cells[2].querySelector('input').value,
            rate: row.cells[3].querySelector('input').value,
            amount: row.cells[4].querySelector('input').value
        });
    });
    
    localStorage.setItem('cashReportData', JSON.stringify(data));
}

// Load Data
function loadData() {
    const saved = localStorage.getItem('cashReportData');
    if (!saved) return;
    
    const data = JSON.parse(saved);
    
    document.getElementById('customerName').value = data.customerName || '';
    document.getElementById('reportTitle').value = data.reportTitle || 'DAILY CASH REPORT';
    document.getElementById('reportDate').value = data.reportDate || '';
    document.getElementById('openingBal').value = data.openingBal || 0;
    
    if (data.received && data.received.length > 0) {
        data.received.forEach(item => {
            addRow('received');
            const lastRow = document.querySelector('#receivedBody tr:last-child');
            const lastCard = document.querySelector('.card-item[data-type="received"]:last-of-type');
            
            lastRow.cells[1].querySelector('input').value = item.name;
            lastRow.cells[2].querySelector('input').value = item.item;
            lastRow.cells[3].querySelector('input').value = item.rate;
            lastRow.cells[4].querySelector('input').value = item.amount;
            
            if (lastCard) {
                const cardInputs = lastCard.querySelectorAll('input');
                cardInputs[0].value = item.name;
                cardInputs[1].value = item.item;
                cardInputs[2].value = item.rate;
                cardInputs[3].value = item.amount;
            }
        });
    }
    
    if (data.handover && data.handover.length > 0) {
        data.handover.forEach(item => {
            addRow('handover');
            const lastRow = document.querySelector('#handoverBody tr:last-child');
            const lastCard = document.querySelector('.card-item[data-type="handover"]:last-of-type');
            
            lastRow.cells[1].querySelector('input').value = item.name;
            lastRow.cells[2].querySelector('input').value = item.item;
            lastRow.cells[3].querySelector('input').value = item.rate;
            lastRow.cells[4].querySelector('input').value = item.amount;
            
            if (lastCard) {
                const cardInputs = lastCard.querySelectorAll('input');
                cardInputs[0].value = item.name;
                cardInputs[1].value = item.item;
                cardInputs[2].value = item.rate;
                cardInputs[3].value = item.amount;
            }
        });
    }
    
    calculate();
}

// Export as PDF
function exportAsPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const customerName = document.getElementById('customerName').value || 'Customer';
    const reportTitle = document.getElementById('reportTitle').value || 'DAILY CASH REPORT';
    const reportDate = document.getElementById('reportDate').value || new Date().toLocaleDateString();
    const openingBal = parseFloat(document.getElementById('openingBal').value) || 0;
    
    const receivedRows = document.querySelectorAll('#receivedBody tr');
    const handoverRows = document.querySelectorAll('#handoverBody tr');
    
    let totalReceived = 0;
    let totalHandover = 0;
    
    pdf.setFont('helvetica');
    let y = 20;
    
    // Title
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportTitle, 105, y, { align: 'center' });
    y += 12;
    
    // Header Info
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Customer: ${customerName}`, 20, y);
    pdf.text(`Date: ${reportDate}`, 150, y);
    y += 6;
    pdf.text(`Opening Balance: ${openingBal.toFixed(2)}`, 20, y);
    y += 12;
    
    // Received Section
    pdf.setFillColor(232, 245, 233);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(39, 174, 96);
    pdf.text('CASH RECEIVED (+)', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    // Column headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sl', 20, y);
    pdf.text('Name', 30, y);
    pdf.text('Item', 80, y);
    pdf.text('Rate', 120, y);
    pdf.text('Qty', 145, y);
    pdf.text('Total', 170, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, y, 190, y);
    y += 5;
    
    pdf.setFont('helvetica', 'normal');
    receivedRows.forEach((row, index) => {
        const name = row.cells[1].querySelector('input').value || '-';
        const item = row.cells[2].querySelector('input').value || '-';
        const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const amount = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const total = rate * amount;
        totalReceived += total;
        
        pdf.text(`${index + 1}`, 20, y);
        pdf.text(name.substring(0, 20), 30, y);
        pdf.text(item.substring(0, 15), 80, y);
        pdf.text(rate.toFixed(2), 120, y);
        pdf.text(amount.toString(), 145, y);
        pdf.text(total.toFixed(2), 170, y);
        y += 6;
        
        if (y > 265) {
            pdf.addPage();
            y = 20;
        }
    });
    
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Received: ${totalReceived.toFixed(2)}`, 145, y);
    y += 12;
    
    // Handover Section
    pdf.setFillColor(255, 235, 238);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setFontSize(13);
    pdf.setTextColor(231, 76, 60);
    pdf.text('CASH HANDOVER (-)', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Sl', 20, y);
    pdf.text('Name', 30, y);
    pdf.text('Item', 80, y);
    pdf.text('Rate', 120, y);
    pdf.text('Qty', 145, y);
    pdf.text('Total', 170, y);
    y += 2;
    pdf.line(20, y, 190, y);
    y += 5;
    
    pdf.setFont('helvetica', 'normal');
    handoverRows.forEach((row, index) => {
        const name = row.cells[1].querySelector('input').value || '-';
        const item = row.cells[2].querySelector('input').value || '-';
        const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const amount = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const total = rate * amount;
        totalHandover += total;
        
        pdf.text(`${index + 1}`, 20, y);
        pdf.text(name.substring(0, 20), 30, y);
        pdf.text(item.substring(0, 15), 80, y);
        pdf.text(rate.toFixed(2), 120, y);
        pdf.text(amount.toString(), 145, y);
        pdf.text(total.toFixed(2), 170, y);
        y += 6;
        
        if (y > 265) {
            pdf.addPage();
            y = 20;
        }
    });
    
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Handover: ${totalHandover.toFixed(2)}`, 145, y);
    y += 15;
    
    // Summary Box
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(15, y - 5, 180, 30);
    
    pdf.setFontSize(11);
    pdf.text('Opening Balance:', 20, y);
    pdf.text(openingBal.toFixed(2), 170, y);
    y += 7;
    pdf.text('Total Received:', 20, y);
    pdf.text(totalReceived.toFixed(2), 170, y);
    y += 7;
    pdf.text('Total Handover:', 20, y);
    pdf.text(totalHandover.toFixed(2), 170, y);
    y += 9;
    
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    const closingBal = openingBal + totalReceived - totalHandover;
    pdf.text('CLOSING BALANCE:', 20, y);
    pdf.text(closingBal.toFixed(2), 170, y);
    
    pdf.save(`${customerName}.pdf`);
}

// Export as Image
function exportAsImage() {
    // Use same PDF generation logic but save as image
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const customerName = document.getElementById('customerName').value || 'Customer';
    const reportDate = document.getElementById('reportDate').value || new Date().toLocaleDateString();
    const openingBal = parseFloat(document.getElementById('openingBal').value) || 0;
    
    const receivedRows = document.querySelectorAll('#receivedBody tr');
    const handoverRows = document.querySelectorAll('#handoverBody tr');
    
    let totalReceived = 0;
    let totalHandover = 0;
    
    pdf.setFont('helvetica');
    let y = 20;
    
    // Title
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DAILY CASH REPORT', 105, y, { align: 'center' });
    y += 12;
    
    // Header Info
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Customer: ${customerName}`, 20, y);
    pdf.text(`Date: ${reportDate}`, 150, y);
    y += 6;
    pdf.text(`Opening Balance: ${openingBal.toFixed(2)}`, 20, y);
    y += 12;
    
    // Received Section
    pdf.setFillColor(232, 245, 233);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(39, 174, 96);
    pdf.text('CASH RECEIVED (+)', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    // Column headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sl', 20, y);
    pdf.text('Name', 30, y);
    pdf.text('Item', 80, y);
    pdf.text('Rate', 120, y);
    pdf.text('Qty', 145, y);
    pdf.text('Total', 170, y);
    y += 2;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, y, 190, y);
    y += 5;
    
    pdf.setFont('helvetica', 'normal');
    receivedRows.forEach((row, index) => {
        const name = row.cells[1].querySelector('input').value || '-';
        const item = row.cells[2].querySelector('input').value || '-';
        const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const amount = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const total = rate * amount;
        totalReceived += total;
        
        pdf.text(`${index + 1}`, 20, y);
        pdf.text(name.substring(0, 20), 30, y);
        pdf.text(item.substring(0, 15), 80, y);
        pdf.text(rate.toFixed(2), 120, y);
        pdf.text(amount.toString(), 145, y);
        pdf.text(total.toFixed(2), 170, y);
        y += 6;
    });
    
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Received: ${totalReceived.toFixed(2)}`, 145, y);
    y += 12;
    
    // Handover Section
    pdf.setFillColor(255, 235, 238);
    pdf.rect(15, y - 5, 180, 8, 'F');
    pdf.setFontSize(13);
    pdf.setTextColor(231, 76, 60);
    pdf.text('CASH HANDOVER (-)', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Sl', 20, y);
    pdf.text('Name', 30, y);
    pdf.text('Item', 80, y);
    pdf.text('Rate', 120, y);
    pdf.text('Qty', 145, y);
    pdf.text('Total', 170, y);
    y += 2;
    pdf.line(20, y, 190, y);
    y += 5;
    
    pdf.setFont('helvetica', 'normal');
    handoverRows.forEach((row, index) => {
        const name = row.cells[1].querySelector('input').value || '-';
        const item = row.cells[2].querySelector('input').value || '-';
        const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const amount = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const total = rate * amount;
        totalHandover += total;
        
        pdf.text(`${index + 1}`, 20, y);
        pdf.text(name.substring(0, 20), 30, y);
        pdf.text(item.substring(0, 15), 80, y);
        pdf.text(rate.toFixed(2), 120, y);
        pdf.text(amount.toString(), 145, y);
        pdf.text(total.toFixed(2), 170, y);
        y += 6;
    });
    
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Handover: ${totalHandover.toFixed(2)}`, 145, y);
    y += 15;
    
    // Summary Box
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(15, y - 5, 180, 30);
    
    pdf.setFontSize(11);
    pdf.text('Opening Balance:', 20, y);
    pdf.text(openingBal.toFixed(2), 170, y);
    y += 7;
    pdf.text('Total Received:', 20, y);
    pdf.text(totalReceived.toFixed(2), 170, y);
    y += 7;
    pdf.text('Total Handover:', 20, y);
    pdf.text(totalHandover.toFixed(2), 170, y);
    y += 9;
    
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    const closingBal = openingBal + totalReceived - totalHandover;
    pdf.text('CLOSING BALANCE:', 20, y);
    pdf.text(closingBal.toFixed(2), 170, y);
    
    // Convert to PNG
    const canvas = document.createElement('canvas');
    canvas.width = 2100;
    canvas.height = 2970;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get PDF as data URL and convert
    const pdfData = pdf.output('dataurlstring');
    const pdfImg = new Image();
    pdfImg.src = pdfData;
    
    pdfImg.onload = () => {
        ctx.drawImage(pdfImg, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.download = `${customerName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
}

// Print
function printInvoice() {
    window.print();
}

// Clear All
function clearAll() {
    if (confirm('Clear all data?')) {
        localStorage.removeItem('cashReportData');
        document.getElementById('receivedBody').innerHTML = '';
        document.getElementById('handoverBody').innerHTML = '';
        document.getElementById('mobileCards').innerHTML = '';
        document.getElementById('customerName').value = '';
        document.getElementById('reportTitle').value = 'DAILY CASH REPORT';
        document.getElementById('openingBal').value = 0;
        document.getElementById('reportDate').valueAsDate = new Date();
        rowCounter = 0;
        calculate();
    }
}

// Save to History
function saveToHistory() {
    const data = JSON.parse(localStorage.getItem('cashReportData') || '{}');
    if (!data.customerName) {
        alert('Please enter customer name');
        return;
    }
    
    const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    const timestamp = new Date().getTime();
    
    history.unshift({
        id: timestamp,
        date: new Date().toLocaleString(),
        data: data
    });
    
    localStorage.setItem('reportHistory', JSON.stringify(history));
    alert('Report saved to history!');
}

// Show History
function showHistory() {
    document.getElementById('appPage').classList.add('hidden');
    document.getElementById('appPage').classList.remove('active');
    document.getElementById('historyPage').classList.remove('hidden');
    document.getElementById('historyPage').classList.add('active');
    loadHistory();
}

// Close History
function closeHistory() {
    document.getElementById('historyPage').classList.add('hidden');
    document.getElementById('historyPage').classList.remove('active');
    document.getElementById('appPage').classList.remove('hidden');
    document.getElementById('appPage').classList.add('active');
}

// Load History
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <div class="empty-history-icon">📋</div>
                <p>No history found</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-header">
                <h3>📄 ${item.data.customerName || 'Unnamed Report'}</h3>
            </div>
            <div class="history-body">
                <p><strong>Title:</strong> <span class="history-badge">${item.data.reportTitle || 'N/A'}</span></p>
                <p><strong>Date:</strong> <span>${item.data.reportDate || 'N/A'}</span></p>
                <p><strong>Saved:</strong> <span>${item.date}</span></p>
                <p><strong>Opening:</strong> <span class="history-badge">${item.data.openingBal || 0}</span></p>
                <div class="history-actions">
                    <button class="btn-load" onclick="loadFromHistory(${item.id})">📂 Load</button>
                    <button class="btn-delete" onclick="deleteFromHistory(${item.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load from History
function loadFromHistory(id) {
    const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    const item = history.find(h => h.id === id);
    
    if (item) {
        localStorage.setItem('cashReportData', JSON.stringify(item.data));
        closeHistory();
        loadData();
    }
}

// Delete from History
function deleteFromHistory(id) {
    if (confirm('Delete this report from history?')) {
        let history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        history = history.filter(h => h.id !== id);
        localStorage.setItem('reportHistory', JSON.stringify(history));
        loadHistory();
    }
}

// Clear Zero on Focus
function clearZero(input) {
    if (input.value === '0' || input.value === '') {
        input.value = '';
    }
}

// Restore Zero on Blur
function restoreZero(input) {
    if (input.value === '') {
        input.value = '';
    }
}

// Update Datalist with Suggestions
function updateDatalist() {
    const nameList = document.getElementById('nameList');
    const itemList = document.getElementById('itemList');
    const rateList = document.getElementById('rateList');
    const amountList = document.getElementById('amountList');
    
    if (!nameList || !itemList || !rateList || !amountList) return;
    
    const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    const names = new Set();
    const items = new Set();
    const rates = new Set();
    const amounts = new Set();
    
    history.forEach(record => {
        if (record.data.received) {
            record.data.received.forEach(item => {
                if (item.name) names.add(item.name);
                if (item.item) items.add(item.item);
                if (item.rate) rates.add(item.rate);
                if (item.amount) amounts.add(item.amount);
            });
        }
        if (record.data.handover) {
            record.data.handover.forEach(item => {
                if (item.name) names.add(item.name);
                if (item.item) items.add(item.item);
                if (item.rate) rates.add(item.rate);
                if (item.amount) amounts.add(item.amount);
            });
        }
    });
    
    nameList.innerHTML = Array.from(names).map(n => `<option value="${n}">`).join('');
    itemList.innerHTML = Array.from(items).map(i => `<option value="${i}">`).join('');
    rateList.innerHTML = Array.from(rates).map(r => `<option value="${r}">`).join('');
    amountList.innerHTML = Array.from(amounts).map(a => `<option value="${a}">`).join('');
}
