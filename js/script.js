document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const transactionForm = document.getElementById("transaction-form");
  const textInput = document.getElementById("text");
  const amountInput = document.getElementById("amount");
  const typeRadios = document.getElementsByName("type");
  const transactionsList = document.getElementById("transactions");
  const noTransactionsMsg = document.getElementById("no-transactions");
  const balanceElement = document.getElementById("balance");
  const incomeElement = document.getElementById("income");
  const expenseElement = document.getElementById("expense");
  const searchInput = document.getElementById("search");
  const clearAllBtn = document.getElementById("clear-all");

  // Local storage key
  const STORAGE_KEY = "expense_tracker_transactions";

  // Initialize app
  let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  updateAll();

  // Event Listeners
  transactionForm.addEventListener("submit", addTransaction);
  searchInput.addEventListener("input", filterTransactions);
  clearAllBtn.addEventListener("click", clearAllTransactions);

  // Functions
  function addTransaction(e) {
    e.preventDefault();

    // Get form values
    const text = textInput.value.trim();
    const amount = +amountInput.value;
    const type = document.querySelector('input[name="type"]:checked').value;

    if (text === "" || amount <= 0) {
      alert("Please enter valid description and amount");
      return;
    }

    // Create transaction object
    const transaction = {
      id: generateID(),
      text,
      amount: type === "income" ? amount : -amount,
      type,
      date: new Date().toISOString(),
    };

    // Add to transactions array
    transactions.push(transaction);

    // Update UI and local storage
    updateAll();

    // Reset form
    transactionForm.reset();
    textInput.focus();
  }

  function generateID() {
    return Math.floor(Math.random() * 1000000000);
  }

  function updateAll() {
    updateLocalStorage();
    updateBalance();
    updateTransactionList();
    updateClearAllButton();
  }

  function updateLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  function updateBalance() {
    const amounts = transactions.map((transaction) => transaction.amount);

    const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
    const income = amounts
      .filter((item) => item > 0)
      .reduce((acc, item) => acc + item, 0)
      .toFixed(2);
    const expense = (
      amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0) *
      -1
    ).toFixed(2);

    balanceElement.textContent = `$${total}`;
    incomeElement.textContent = `$${income}`;
    expenseElement.textContent = `$${expense}`;

    // Update balance color based on value
    balanceElement.className =
      total >= 0
        ? "text-2xl font-bold text-green-600"
        : "text-2xl font-bold text-red-600";
  }

  function updateTransactionList(filteredTransactions = null) {
    const transactionsToDisplay = filteredTransactions || transactions;

    if (transactionsToDisplay.length === 0) {
      noTransactionsMsg.style.display = "block";
      transactionsList.innerHTML = "";
      return;
    }

    noTransactionsMsg.style.display = "none";

    // Sort by date (newest first)
    const sortedTransactions = [...transactionsToDisplay].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    transactionsList.innerHTML = sortedTransactions
      .map(
        (transaction) => `
            <div class="transaction-item bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center fade-in">
                <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center 
                                ${
                                  transaction.type === "income"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                } mr-3">
                        <i class="fas ${
                          transaction.type === "income"
                            ? "fa-arrow-down"
                            : "fa-arrow-up"
                        }"></i>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-800">${
                          transaction.text
                        }</h3>
                        <p class="text-xs text-gray-500">${formatDate(
                          transaction.date
                        )}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <span class="${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    } font-medium mr-2">
                        ${transaction.type === "income" ? "+" : "-"}$${Math.abs(
          transaction.amount
        ).toFixed(2)}
                    </span>
                    <button onclick="deleteTransaction(${
                      transaction.id
                    })" class="text-gray-400 hover:text-red-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  function filterTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = transactions.filter(
      (transaction) =>
        transaction.text.toLowerCase().includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm) ||
        transaction.type.toLowerCase().includes(searchTerm)
    );
    updateTransactionList(filtered);
  }

  function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      transactions = transactions.filter(
        (transaction) => transaction.id !== id
      );
      updateAll();
    }
  }

  function clearAllTransactions() {
    if (transactions.length === 0) return;

    if (
      confirm(
        "Are you sure you want to delete ALL transactions? This cannot be undone."
      )
    ) {
      transactions = [];
      updateAll();
      searchInput.value = "";
    }
  }

  function updateClearAllButton() {
    clearAllBtn.disabled = transactions.length === 0;
  }

  // Make deleteTransaction available globally for the onclick handler
  window.deleteTransaction = deleteTransaction;
});
