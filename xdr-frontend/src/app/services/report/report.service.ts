import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  generatePDF(data: any[]) {
    const doc = new jsPDF();
    doc.text('Reporte de Anomalías', 10, 10);

    let y = 20;
    data.forEach((row, index) => {
      doc.text(
        `${index + 1}. IP: ${row._source.src_ip} → ${row._source.dest_ip}`,
        10,
        y,
      );
      y += 10;
    });

    doc.save('reporte_anomalias.pdf');
  }

  generateExcel(data: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = {
      Sheets: { Reporte: worksheet },
      SheetNames: ['Reporte'],
    };
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'reporte_anomalias.xlsx');
  }
}
