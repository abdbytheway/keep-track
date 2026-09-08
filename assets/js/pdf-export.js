// Builds a one-month expense report as a downloadable PDF using jsPDF + the
// AutoTable plugin (loaded globally via <script> tags — see the CDN includes
// in transactions.html / dashboard.html).
import { getCategory } from "./categories.js";
import { formatCurrency, formatDate } from "./util.js";

export function exportMonthPdf({ monthLabel, userEmail, transactions }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(53, 37, 205); // brand primary
  doc.text("Keep Track", 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(70, 69, 85);
  doc.text(`Expense Report — ${monthLabel}`, 14, 27);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  doc.text(userEmail || "", 14, 33);

  const rows = transactions.map((t) => [
    formatDate(t.date),
    getCategory(t.category).label,
    t.merchant || t.note || "—",
    t.status === "pending" ? "Pending" : "Paid",
    formatCurrency(t.amount),
  ]);

  const total = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  doc.autoTable({
    startY: 40,
    head: [["Date", "Category", "Description", "Status", "Amount"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    columnStyles: { 4: { halign: "right" } },
    foot: [["", "", "", "Total", formatCurrency(total)]],
    footStyles: { fillColor: [239, 244, 255], textColor: [11, 28, 48], fontStyle: "bold" },
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 40;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 160);
  doc.text(`${transactions.length} transaction(s) • Generated ${new Date().toLocaleString()}`, 14, finalY + 10);

  const fileSafeMonth = monthLabel.replace(/\s+/g, "_");
  doc.save(`KeepTrack_${fileSafeMonth}.pdf`);
}

