// ✅ API 取得當週匯率
async function fetchExchangeRate() {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwnYltTdnhaKGv4t9gQGGThd6KAhbyL9utX6Mg_6X6L2wPRKAJhwXj5lqVH5WZCWv4z/exec");
    const data = await response.json();
    document.getElementById("rate").textContent = `1 RMB = ${data.rate} TWD`;
    document.getElementById("rate-period").textContent = `適用期間: ${data.startDate} 至 ${data.endDate}`;
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

    const exchangeRate = parseFloat(document.getElementById("rate").textContent.split(" ")[3]);

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
