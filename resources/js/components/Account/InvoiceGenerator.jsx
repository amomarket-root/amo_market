import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const InvoiceGenerator = ({ orderInfo, billDetails, orderItems }) => {
    const generateInvoice = () => {
        const doc = new jsPDF();

        // Header Styling
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Amo Market Pvt. Ltd.", 105, 15, { align: "center" });
        doc.setDrawColor(41, 128, 185);
        doc.line(10, 20, 200, 20); // Horizontal line

        // Order Details Box
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        let yOffset = 30;
        doc.setDrawColor(0);
        doc.rect(10, yOffset - 10, 190, 50); // Border for order details

        const orderDetails = [
            `Order ID: ${orderInfo.orderId}`,
            `Order Placed: ${orderInfo.orderPlaced}`,
            `Deliver to: ${orderInfo.address}`,
            `Payment: ${orderInfo.payment}`
        ];


        orderDetails.forEach((text, index) => {
            doc.text(text, 105, yOffset + index * 10, { align: "center" });
        });

        yOffset += 50;

        // Bill Details
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Bill Details", 105, yOffset + 10, { align: "center" });

        const billData = Object.entries(billDetails).map(([key, value]) => [
            key.replace(/([A-Z])/g, " $1").trim(),
            `Rs. ${value.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: yOffset + 15,
            head: [["Description", "Amount"]],
            body: billData,
            theme: "striped",
            headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
            bodyStyles: { textColor: [0, 0, 0] },
            styles: { halign: "center" }
        });

        yOffset = doc.lastAutoTable.finalY + 10;

        // Order Items
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Order Items", 105, yOffset, { align: "center" });

        const itemsData = orderItems.map((item) => [
            item.name,
            item.quantity,
            `Rs. ${item.price.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: yOffset + 5,
            head: [["Item Name", "Quantity", "Price"]],
            body: itemsData,
            theme: "striped",
            headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold" },
            bodyStyles: { textColor: [0, 0, 0] },
            styles: { halign: "center" }
        });

        // Footer
        yOffset = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text("Thank you for shopping with us!", 105, yOffset, { align: "center" });

        // Save the PDF
        doc.save(`Invoice_${orderInfo.orderId}.pdf`);
    };

    return (
        <Button
            startIcon={<DownloadIcon />}
            sx={{ mt: 1, color: "green" }}
            onClick={generateInvoice}
        >
            Download Invoice
        </Button>
    );
};

export default InvoiceGenerator;
