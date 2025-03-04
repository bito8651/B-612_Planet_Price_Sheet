// ✅ API 取得當週匯率
async function fetchExchangeRate() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbxXWeLsHdPc-FJw5rvbyODCnR-A62G52MPLSygSAxQp6wOR96Bfnxy2gaNGNejHrkjD/exec");
        const data = await response.json();
        
        console.log("📢 API 回傳數據:", data); // 確保 API 回傳正確

        // 🔹 強制轉換 `exchangeRate` 為數字
        let exchangeRate = parseFloat(data.exchangeRate);
        if (isNaN(exchangeRate)) {
            console.error("❌ 匯率數據無法轉換為數字:", data.exchangeRate);
            document.getElementById("rate").textContent = "❌ 匯率載入失敗";
            return;
        }

        // ✅ 顯示匯率資訊
        document.getElementById("rate").textContent = `1 RMB = ${exchangeRate.toFixed(4)} TWD`;
        document.getElementById("rate-period").textContent = `適用期間: ${data.startDate} 至 ${data.endDate}`;

        // ✅ 將 `exchangeRate` 存入全域變數，確保計算時可用
        window.currentExchangeRate = exchangeRate;

    } catch (error) {
        console.error("❌ API 取得錯誤:", error);
        document.getElementById("rate").textContent = "❌ 無法載入匯率";
    }
}
fetchExchangeRate();

// ✅ 費率設定（內建，無需 API）
const purchaseRates = [
    { min: 1, max: 100, rate: 0.10, minFee: 30 },
    { min: 101, max: 200, rate: 0.09, minFee: 0 },
    { min: 201, max: 300, rate: 0.08, minFee: 0 },
    { min: 301, max: 999, rate: 0.06, minFee: 0 },
    { min: 1000, max: Infinity, rate: 0.05, minFee: 0 }
];

const paymentRates = [
    { min: 1, max: 100, rate: 0.08, minFee: 25 },
    { min: 101, max: 200, rate: 0.07, minFee: 0 },
    { min: 201, max: 500, rate: 0.06, minFee: 0 },
    { min: 501, max: 1000, rate: 0.05, minFee: 0 },
    { min: 1000, max: Infinity, rate: 0.03, minFee: 0 }
];

// ✅ 計算費用
function calculate() {
    const serviceType = document.getElementById("serviceType").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!amount || amount <= 0) {
        alert("請輸入有效的金額！");
        return;
    }

    // 🔹 確保 `exchangeRate` 有值
    if (typeof window.currentExchangeRate === "undefined") {
        alert("❌ 匯率未載入，請稍後再試");
        return;
    }
    let exchangeRate = window.currentExchangeRate; // ✅ 使用全域變數

    let rateTable = serviceType === "purchase" ? purchaseRates : paymentRates;
    let selectedRate = rateTable.find(r => amount >= r.min && amount <= r.max);

    let serviceFee = Math.max(amount * selectedRate.rate, selectedRate.minFee);
    let paymentFee = amount >= 201 ? amount * 0.03 : 0;
    let totalTWD = Math.ceil((amount + serviceFee + paymentFee) * exchangeRate);

    document.getElementById("result").innerHTML = `
        <p>人民幣金額: ${amount.toFixed(2)} RMB</p>
        <p>代購/代付費用: ${serviceFee.toFixed(2)} RMB</p>
        <p>支付寶手續費: ${paymentFee.toFixed(2)} RMB</p>
        <h3>最終報價: ${totalTWD} TWD</h3>
    `;
}
