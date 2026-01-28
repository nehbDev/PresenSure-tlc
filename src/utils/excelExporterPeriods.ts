// @ts-ignore
import XLSX from "xlsx-js-style";
import type { PeriodsApiResponse } from "../components/tables/AttendancePeriodsTable";
import dayjs from "dayjs";

export const exportPeriodsToExcel = (data: PeriodsApiResponse) => {
  if (!data || !data.students || data.students.length === 0) return;

  // 1. Filter Students
  const males = data.students.filter(s => s.sex === 'Male' || s.sex === 'M');
  const females = data.students.filter(s => s.sex === 'Female' || s.sex === 'F');

  const periodKeys = Object.keys(data.periods_metadata);

  // 2. Build Header Rows
  // Row Indices:
  const PERIOD_ROW_IDX = 8;       // Period Names
  const SESSION_DATE_ROW_IDX = 9; // Dates + Main Headers
  const SESSION_TYPE_ROW_IDX = 10;// Types (Lec/Lab)
  
  // Initialize Rows
  const headerRow1: string[] = ["", "", ""]; // Spacers for No, ID, Name
  const headerRow2: string[] = ["No.", "Student ID", "Student Name"];
  const headerRow3: string[] = ["", "", ""]; // Spacers for vertical merge of No, ID, Name
  
  const merges: any[] = [];
  const colWidths: any[] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }]; 

  // Merge Identity Columns (Rows 9-10)
  // No.
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: 0 }, e: { r: SESSION_TYPE_ROW_IDX, c: 0 } });
  // Student ID
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: 1 }, e: { r: SESSION_TYPE_ROW_IDX, c: 1 } });
  // Student Name
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: 2 }, e: { r: SESSION_TYPE_ROW_IDX, c: 2 } });

  // Start processing periods from column index 3
  let currentColIndex = 3; 

  periodKeys.forEach(period => {
      const meta = data.periods_metadata[period];
      const sessions = meta.sessions || [];
      const sessionCount = sessions.length;
      
      // --- ROW 1: Period Name ---
      headerRow1.push(period);
      
      // Calculate Span: Sessions + Grade + Status
      const colsToSpan = sessionCount + 2; 

      // Fill spacers for Row 1 merge
      for (let i = 1; i < colsToSpan; i++) {
          headerRow1.push("");
      }
      
      // Merge Period Header
      merges.push({ 
          s: { r: PERIOD_ROW_IDX, c: currentColIndex }, 
          e: { r: PERIOD_ROW_IDX, c: currentColIndex + colsToSpan - 1 } 
      });
      
      // --- ROW 2 & 3: Sessions ---
      sessions.forEach(session => {
          // Date
          const dateStr = dayjs(session.date).format("MMM D");
          headerRow2.push(dateStr);
          
          // Type (New Row)
          // Handle null types, default to "-" or "Gen"
          const typeStr = session.type ? session.type.substring(0, 3) : "-"; 
          headerRow3.push(typeStr);

          colWidths.push({ wch: 6 }); 
      });

      // --- Grade & Status Columns ---
      headerRow2.push("Grd");
      headerRow3.push(""); // Spacer for merge
      
      headerRow2.push("Stat");
      headerRow3.push(""); // Spacer for merge

      // Merge "Grd" vertically (Row 9-10)
      const gradeColIdx = currentColIndex + sessionCount;
      merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: gradeColIdx }, e: { r: SESSION_TYPE_ROW_IDX, c: gradeColIdx } });

      // Merge "Stat" vertically (Row 9-10)
      const statColIdx = gradeColIdx + 1;
      merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: statColIdx }, e: { r: SESSION_TYPE_ROW_IDX, c: statColIdx } });

      colWidths.push({ wch: 6 }); 
      colWidths.push({ wch: 8 }); 

      currentColIndex += colsToSpan;
  });

  // --- Remarks Column ---
  headerRow1.push(""); 
  headerRow2.push("Remarks");
  headerRow3.push("");
  
  // Merge Remarks vertically
  const remarksColIdx = currentColIndex;
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: remarksColIdx }, e: { r: SESSION_TYPE_ROW_IDX, c: remarksColIdx } });
  
  colWidths.push({ wch: 15 });

  const excelData: any[][] = [];

  // --- TOP METADATA SECTION ---
  const totalCols = headerRow2.length - 1;

  // 0
  excelData.push(["THE LEWIS COLLEGE"]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } });
  // 1
  excelData.push(["HIGHER EDUCATION DEPARTMENT"]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } });
  // 2
  excelData.push([]); 
  // 3
  excelData.push(["GRADING / ATTENDANCE MATRIX"]);
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols } });
  // 4
  excelData.push([]); 
  // 5
  excelData.push(["Course:", `${data.course} - ${data.description}`]);
  // 6
  excelData.push(["Date Generated:", new Date().toLocaleDateString()]);
  // 7
  excelData.push([]); 

  // 8: Period Header
  excelData.push(headerRow1);
  // 9: Session Date Header
  excelData.push(headerRow2);
  // 10: Session Type Header
  excelData.push(headerRow3);

  // --- STYLES ---
  const styles = {
    title: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center", vertical: "center" } },
    sectionHeader: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } }, // Blue
        alignment: { horizontal: "center", vertical: "center" }
    },
    periodHeader: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2D336B" } }, // Dark Blue
        alignment: { horizontal: "center", vertical: "center" },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    sessionHeader: { 
        font: { bold: true, sz: 9 }, 
        fill: { fgColor: { rgb: "E0E0E0" } }, // Light Gray
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    typeHeader: { 
        font: { sz: 8, italic: true, color: { rgb: "555555" } }, 
        fill: { fgColor: { rgb: "F2F2F2" } }, // Very Light Gray
        alignment: { horizontal: "center", vertical: "center" },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    cellCenter: { 
        alignment: { horizontal: "center", vertical: "center" }, 
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } 
    },
    cellLeft: { 
        alignment: { horizontal: "left", vertical: "center" }, 
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } 
    }
  };

  const rowStyles: { [key: number]: any } = {};

  const processStudents = (students: any[]) => {
      students.forEach((student, index) => {
        const row = [ index + 1, student.student_id, student.name ];

        periodKeys.forEach(period => {
            const meta = data.periods_metadata[period];
            const pData = student.periods[period];
            const sessions = meta.sessions || [];

            // 1. Session Logs
            sessions.forEach((session: any) => {
                const status = pData?.logs?.[session.id];
                let code = "-";
                if(status === 'present') code = "P";
                else if(status === 'late') code = "L";
                else if(status === 'absent') code = "A";
                else if(status === 'excused') code = "E";
                row.push(code);
            });

            // 2. Grade
            let grade = "-";
            if (pData?.attendance_grade !== undefined && pData?.attendance_grade !== null) {
                if (sessions.length > 0 || pData.attendance_grade > 0) {
                     grade = Number(pData.attendance_grade).toFixed(2);
                }
            }
            row.push(grade);

            // 3. Status
            const stat = pData?.period_status ? pData.period_status : "-";
            row.push(stat);
        });

        row.push(student.remarks || student.status || "-");
        excelData.push(row);
      });
  };

  // --- MALE SECTION ---
  if (males.length > 0) {
      const idx = excelData.length;
      excelData.push(["MALE"]);
      merges.push({ s: { r: idx, c: 0 }, e: { r: idx, c: totalCols } });
      rowStyles[idx] = styles.sectionHeader;
      processStudents(males);
  }

  // --- FEMALE SECTION ---
  if (females.length > 0) {
      const idx = excelData.length;
      excelData.push(["FEMALE"]);
      merges.push({ s: { r: idx, c: 0 }, e: { r: idx, c: totalCols } });
      rowStyles[idx] = styles.sectionHeader;
      processStudents(females);
  }

  // --- CREATE ---
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  ws["!merges"] = merges;
  ws["!cols"] = colWidths;

  // --- APPLY STYLES ---
  
  // 1. Period Headers (Row 8)
  for (let c = 3; c < totalCols; c++) { 
     const cellRef = XLSX.utils.encode_cell({ r: PERIOD_ROW_IDX, c: c });
     if(ws[cellRef]) ws[cellRef].s = styles.periodHeader;
  }

  // 2. Session Date Headers (Row 9)
  for (let c = 0; c <= totalCols; c++) {
     const cellRef = XLSX.utils.encode_cell({ r: SESSION_DATE_ROW_IDX, c: c });
     if(ws[cellRef]) ws[cellRef].s = styles.sessionHeader;
  }

  // 3. Session Type Headers (Row 10)
  for (let c = 0; c <= totalCols; c++) {
     const cellRef = XLSX.utils.encode_cell({ r: SESSION_TYPE_ROW_IDX, c: c });
     if(ws[cellRef]) {
         // Apply styling. For identity columns (merged), this will style the bottom part of the merge which is fine.
         // Or strictly apply "typeHeader" only to actual session columns.
         // Let's reuse sessionHeader style for identity columns to look seamless.
         if (c < 3 || c === totalCols || headerRow2[c] === 'Grd' || headerRow2[c] === 'Stat') {
             ws[cellRef].s = styles.sessionHeader; 
         } else {
             ws[cellRef].s = styles.typeHeader; 
         }
     }
  }

  // 4. Section Headers & Data
  Object.keys(rowStyles).forEach(r => {
      const idx = parseInt(r);
      const cellRef = `A${idx + 1}`;
      if(ws[cellRef]) ws[cellRef].s = rowStyles[idx];
  });

  const dataStartRow = 11; // Data starts after the 3 header rows
  const range = XLSX.utils.decode_range(ws['!ref']!);
  
  for (let R = dataStartRow; R <= range.e.r; ++R) {
    if (rowStyles[R]) continue; 
    for (let C = 0; C <= totalCols; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellRef]) {
            if (C === 2) ws[cellRef].s = styles.cellLeft; 
            else ws[cellRef].s = styles.cellCenter;
        }
    }
  }
  
  // Title Styles
  const titleStyle = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };
  if (ws["A1"]) ws["A1"].s = titleStyle;
  if (ws["A2"]) ws["A2"].s = titleStyle;
  if (ws["A4"]) ws["A4"].s = titleStyle;

  XLSX.utils.book_append_sheet(wb, ws, "Matrix");
  XLSX.writeFile(wb, `Matrix_${data.course}.xlsx`);
};