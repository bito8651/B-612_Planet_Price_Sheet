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
    { min: 1, max: 100, rate: 0.10, minFeeTWD: 30 },
    { min: 101, max: 200, rate: 0.09, minFeeTWD: 0 },
    { min: 201, max: 300, rate: 0.08, minFeeTWD: 0 },
    { min: 301, max: 999, rate: 0.06, minFeeTWD: 0 },
    { min: 1000, max: Infinity, rate: 0.05, minFeeTWD: 0 }
];

const paymentRates = [
    { min: 1, max: 100, rate: 0.08, minFeeTWD: 25 },
    { min: 101, max: 200, rate: 0.07, minFeeTWD: 0 },
    { min: 201, max: 500, rate: 0.06, minFeeTWD: 0 },
    { min: 501, max: 1000, rate: 0.05, minFeeTWD: 0 },
    { min: 1000, max: Infinity, rate: 0.03, minFeeTWD: 0 }
];

// ✅ 計算費用
function calculate() {
    const serviceType = document.getElementById("serviceType").value;
    const amountRMB = parseFloat(document.getElementById("amount").value);
    if (!amountRMB || amountRMB <= 0) {
        alert("請輸入有效的金額！");
        return;
    }

    // 取得當前匯率
    const exchangeRate = parseFloat(document.getElementById("rate").textContent.split(" ")[3]);

    let rateTable = serviceType === "purchase" ? purchaseRates : paymentRates;
    let selectedRate = rateTable.find(r => amountRMB >= r.min && amountRMB <= r.max);

    // 📌 計算人民幣金額
    let serviceFeeRMB = amountRMB * selectedRate.rate; // 服務費 (RMB)
    let paymentFeeRMB = amountRMB >= 201 ? amountRMB * 0.03 : 0; // 支付寶手續費 (RMB)

    // 📌 轉換台幣 & 無條件進位
    let amountTWD = Math.ceil(amountRMB * exchangeRate); // 商品台幣金額
    let paymentFeeTWD = Math.ceil(paymentFeeRMB * exchangeRate); // 支付寶手續費台幣
    let serviceFeeTWD = Math.ceil(serviceFeeRMB * exchangeRate); // 服務費台幣

    // 📌 判斷服務費是否低於最低門檻
    let finalServiceFeeRMB = serviceFeeRMB;
    let serviceFeeMessage = `${serviceFeeRMB.toFixed(2)} RMB`; // 預設顯示人民幣

    if (serviceFeeTWD < selectedRate.minFeeTWD && selectedRate.minFeeTWD > 0) {
        finalServiceFeeRMB = (selectedRate.minFeeTWD / exchangeRate); // 反推 RMB
        serviceFeeMessage = `收取最低服務費 ${selectedRate.minFeeTWD} TWD`;
    }

    let finalServiceFeeTWD = Math.ceil(finalServiceFeeRMB * exchangeRate); // 服務費最終台幣
    let totalTWD = Math.ceil(amountTWD + paymentFeeTWD + finalServiceFeeTWD); // 最終總價

    // 📌 顯示結果
    document.getElementById("result").innerHTML = `
        <p>人民幣金額: ${amountRMB.toFixed(2)} RMB</p>
        <p>支付寶手續費: ${paymentFeeRMB.toFixed(2)} RMB</p>
        <p>代購/代付費用: ${serviceFeeMessage}</p>
        <h3>最終報價: ${totalTWD} TWD</h3>
    `;
}
