// State
let items = [
  { description: "Website UI Design & Architecture", qty: 1, rate: 500 },
  { description: "Frontend Development", qty: 1, rate: 800 }
];

// DOM Element references
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const invoiceTableBody = document.getElementById("invoiceTableBody");

const inputCurrency = document.getElementById("inputCurrency");
const inputInvNum = document.getElementById("inputInvNum");
const inputSenderName = document.getElementById("inputSenderName");
const inputSenderAddress = document.getElementById("inputSenderAddress");
const inputClientName = document.getElementById("inputClientName");
const inputClientAddress = document.getElementById("inputClientAddress");
const inputTaxRate = document.getElementById("inputTaxRate");
const inputDueDate = document.getElementById("inputDueDate");

const viewCurrency = () => inputCurrency.value;

// Sync general fields to preview canvas
function bindInputToView(inputElem, viewId, defaultText) {
  inputElem.addEventListener("input", (e) => {
    document.getElementById(viewId).innerText = e.target.value.trim() || defaultText;
  });
}

bindInputToView(inputInvNum, "viewInvNum", "INV-001");
bindInputToView(inputSenderName, "viewSenderName", "Your Business Name");
bindInputToView(inputSenderAddress, "viewSenderAddress", "Your Business Address");
bindInputToView(inputClientName, "viewClientName", "Client Company Name");
bindInputToView(inputClientAddress, "viewClientAddress", "Client Address");
bindInputToView(inputDueDate, "viewDueDate", "--");

inputTaxRate.addEventListener("input", calculateTotals);
inputCurrency.addEventListener("change", renderTableAndTotals);

// Render Line Item Inputs in Form
function renderItemInputs() {
  itemsContainer.innerHTML = "";
  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "flex gap-2 items-center";
    row.innerHTML = `
      <input type="text" placeholder="Item description" value="${item.description}" 
        class="flex-1 border rounded p-1.5 text-xs outline-none" 
        oninput="updateItem(${index}, 'description', this.value)">
      <input type="number" placeholder="Qty" value="${item.qty}" min="1" 
        class="w-16 border rounded p-1.5 text-xs text-center outline-none" 
        oninput="updateItem(${index}, 'qty', this.value)">
      <input type="number" placeholder="Rate" value="${item.rate}" min="0" 
        class="w-20 border rounded p-1.5 text-xs text-right outline-none" 
        oninput="updateItem(${index}, 'rate', this.value)">
      <button onclick="removeItem(${index})" class="text-rose-500 font-bold px-1 hover:text-rose-700 text-sm">×</button>
    `;
    itemsContainer.appendChild(row);
  });
  renderTableAndTotals();
}

window.updateItem = function(index, field, value) {
  items[index][field] = field === "description" ? value : parseFloat(value) || 0;
  renderTableAndTotals();
};

window.removeItem = function(index) {
  if (items.length > 1) {
    items.splice(index, 1);
    renderItemInputs();
  }
};

addItemBtn.addEventListener("click", () => {
  items.push({ description: "New Item", qty: 1, rate: 0 });
  renderItemInputs();
});

// Render Items in the Printable Invoice View
function renderTableAndTotals() {
  invoiceTableBody.innerHTML = "";
  const cur = viewCurrency();

  items.forEach(item => {
    const amount = (item.qty * item.rate).toFixed(2);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="py-2.5 text-slate-800">${item.description || "Untitled Item"}</td>
      <td class="py-2.5 text-center text-slate-600">${item.qty}</td>
      <td class="py-2.5 text-right text-slate-600">${cur}${item.rate.toFixed(2)}</td>
      <td class="py-2.5 text-right font-medium text-slate-800">${cur}${amount}</td>
    `;
    invoiceTableBody.appendChild(tr);
  });

  calculateTotals();
}

function calculateTotals() {
  const cur = viewCurrency();
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxRate = parseFloat(inputTaxRate.value) || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  document.getElementById("viewSubtotal").innerText = `${cur}${subtotal.toFixed(2)}`;
  document.getElementById("viewTaxLabel").innerText = `Tax (${taxRate}%):`;
  document.getElementById("viewTaxAmount").innerText = `${cur}${taxAmount.toFixed(2)}`;
  document.getElementById("viewTotal").innerText = `${cur}${total.toFixed(2)}`;
}

// Download PDF Action via html2pdf library
document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  const element = document.getElementById("invoiceCanvas");
  const invoiceNum = inputInvNum.value.trim() || "INV";
  
  const opt = {
    margin: 10,
    filename: `${invoiceNum}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
});

// Set default date to today
inputDueDate.value = new Date().toISOString().split('T')[0];
document.getElementById("viewDueDate").innerText = inputDueDate.value;

// Initial invocation
renderItemInputs();