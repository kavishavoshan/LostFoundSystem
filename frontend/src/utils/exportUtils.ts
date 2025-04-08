import * as XLSX from "xlsx";
import saveAs from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data: any[], filename: string) => {
    const now = new Date().toLocaleString();
    const header = [[`${filename} - Generated at ${now}`], []]; // title + blank row
    const worksheet = XLSX.utils.aoa_to_sheet(header);
  
    const dataSheet = XLSX.utils.json_to_sheet(data, { origin: -1 }); // append data below title
    Object.assign(worksheet, dataSheet); // merge
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${filename}.xlsx`);
  };  

  export const exportToCSV = (data: any[], filename: string) => {
    const now = new Date().toLocaleString();
    const worksheet = XLSX.utils.aoa_to_sheet([[`${filename} - Generated at ${now}`], []]);
    const dataSheet = XLSX.utils.json_to_sheet(data, { origin: -1 });
    Object.assign(worksheet, dataSheet);
  
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  };  

  export const exportToPDF = (data: any[], filename: string) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();
    const title = `${filename} Report`;
    const columns = Object.keys(data[0]);
    const rows = data.map(obj => columns.map(col => obj[col]));
  
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated at: ${now}`, 14, 27);
  
    autoTable(doc, {
      startY: 35,
      head: [columns],
      body: rows,
      styles: {
        fontSize: 9,
        halign: 'left',
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [30, 62, 98], // Dark blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 35 },
    });
  
    doc.save(`${filename}.pdf`);
  };  
