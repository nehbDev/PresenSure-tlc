// src/utils/excelExporterPeriods.ts

// @ts-ignore
import XLSX from "xlsx-js-style";
import dayjs from "dayjs";

// ... (Interfaces remain the same) ...
export interface PeriodSessionInfo {
  id: number;
  date: string;
  type: string;
}

export interface PeriodsApiResponse {
  course: string;
  description: string;
  instructor?: string;
  periods_metadata: any;
  students: any[];
  policy_summary?: any;
}

// ✅ CHANGE 1: Accept selectedPeriod as an optional second argument
export const exportPeriodsToExcel = (data: PeriodsApiResponse, selectedPeriod?: string) => {
  if (!data || !data.students || data.students.length === 0) return;

  // --- GET SEMESTER INFO ---
  let semesterHeader = "SEMESTER / SCHOOL YEAR";
  try {
    const cachedSemester = localStorage.getItem("semesterInfo");
    if (cachedSemester) {
      const sem = JSON.parse(cachedSemester);
      semesterHeader = `${sem.description}, SY ${sem.schoolyear_start}-${sem.schoolyear_end}`;
    }
  } catch (e) {
    console.error("Error parsing semester info", e);
  }

  const males = data.students.filter((s) => s.sex === 'Male' || s.sex === 'M');
  const females = data.students.filter((s) => s.sex === 'Female' || s.sex === 'F');

  // ✅ CHANGE 2: Filter periodKeys based on selection
  let periodKeys = Object.keys(data.periods_metadata);
  
  if (selectedPeriod && selectedPeriod !== "") {
    // Only keep the selected period if it exists in metadata
    if (Object.prototype.hasOwnProperty.call(data.periods_metadata, selectedPeriod)) {
        periodKeys = [selectedPeriod];
    }
  }

  // 2. Updated Row Indices
  const PERIOD_ROW_IDX = 10;       
  const SESSION_DATE_ROW_IDX = 11; 
  const SESSION_TYPE_ROW_IDX = 12;
  
  const headerRow1: string[] = ["", "", ""]; 
  const headerRow2: string[] = ["No.", "Student ID", "Student Name"];
  const headerRow3: string[] = ["", "", ""]; 
  
  const merges: any[] = [];
  const colWidths: any[] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }]; 

  // Merge Identity Columns
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: 0 }, e: { r: SESSION_TYPE_ROW_IDX, c: 0 } });
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: 1 }, e: { r: SESSION_TYPE_ROW_IDX, c: 1 } });
  merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: 2 }, e: { r: SESSION_TYPE_ROW_IDX, c: 2 } });

  let currentColIndex = 3; 

  periodKeys.forEach(period => {
      const meta = data.periods_metadata[period];
      const sessions = meta.sessions || [];
      const sessionCount = sessions.length;
      
      headerRow1.push(period);
      
      const colsToSpan = sessionCount + 1; 

      for (let i = 1; i < colsToSpan; i++) {
          headerRow1.push("");
      }
      
      merges.push({ 
          s: { r: PERIOD_ROW_IDX, c: currentColIndex }, 
          e: { r: PERIOD_ROW_IDX, c: currentColIndex + colsToSpan - 1 } 
      });
      
      sessions.forEach((session: PeriodSessionInfo) => {
          const dateStr = dayjs(session.date).format("MMM D");
          headerRow2.push(dateStr);
          const typeStr = session.type ? session.type.substring(0, 3) : "-"; 
          headerRow3.push(typeStr);
          colWidths.push({ wch: 10 }); 
      });

      headerRow2.push("Grade");
      headerRow3.push(""); 
      
      const gradeColIdx = currentColIndex + sessionCount;
      merges.push({ s: { r: SESSION_DATE_ROW_IDX, c: gradeColIdx }, e: { r: SESSION_TYPE_ROW_IDX, c: gradeColIdx } });

      colWidths.push({ wch: 6 }); 

      currentColIndex += colsToSpan;
  });

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
  excelData.push([semesterHeader.toUpperCase()]); 
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } }); 

  // 3
  excelData.push([]); 
  
  // 4
  excelData.push(["GRADING / ATTENDANCE RECORDS"]);
  merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: totalCols } });
  
  // 5
  excelData.push([]); 
  
  // 6
  excelData.push(["Course:", `${data.course} - ${data.description}`]);

  // 7
  excelData.push(["Instructor:", data.instructor || "N/A"]);
  
  // 8
  excelData.push(["Date Generated:", new Date().toLocaleDateString()]);
  
  // 9
  excelData.push([]); 

  // 10
  excelData.push(headerRow1);
  // 11
  excelData.push(headerRow2);
  // 12
  excelData.push(headerRow3);

  // --- STYLES ---
  const styles = {
    title: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center", vertical: "center" } },
    subTitle: { font: { bold: true, sz: 11 }, alignment: { horizontal: "center", vertical: "center" } }, 
    sectionHeader: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } }, 
        alignment: { horizontal: "center", vertical: "center" }
    },
    periodHeader: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2D336B" } }, 
        alignment: { horizontal: "center", vertical: "center" },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    sessionHeader: { 
        font: { bold: true, sz: 9 }, 
        fill: { fgColor: { rgb: "E0E0E0" } }, 
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    },
    typeHeader: { 
        font: { sz: 8, italic: true, color: { rgb: "555555" } }, 
        fill: { fgColor: { rgb: "F2F2F2" } },
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

        // ✅ CHANGE 3: Iterate only over the filtered periodKeys
        periodKeys.forEach(period => {
            const meta = data.periods_metadata[period];
            const pData = student.periods[period];
            const sessions = meta.sessions || [];

            sessions.forEach((session: PeriodSessionInfo) => {
                const status = pData?.logs?.[session.id];
                let code = "-";
                if(status === 'present') code = "P";
                else if(status === 'late') code = "L";
                else if(status === 'absent') code = "A";
                else if(status === 'excused') code = "E";
                row.push(code);
            });

            let grade = "-";
            if (pData?.attendance_grade !== undefined && pData?.attendance_grade !== null) {
                if (sessions.length > 0 || pData.attendance_grade > 0) {
                      grade = Number(pData.attendance_grade).toFixed(2);
                }
            }
            row.push(grade);
        });

        excelData.push(row);
      });
  };

  if (males.length > 0) {
      const idx = excelData.length;
      excelData.push(["MALE"]);
      merges.push({ s: { r: idx, c: 0 }, e: { r: idx, c: totalCols } });
      rowStyles[idx] = styles.sectionHeader;
      processStudents(males);
  }

  if (females.length > 0) {
      const idx = excelData.length;
      excelData.push(["FEMALE"]);
      merges.push({ s: { r: idx, c: 0 }, e: { r: idx, c: totalCols } });
      rowStyles[idx] = styles.sectionHeader;
      processStudents(females);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  ws["!merges"] = merges;
  ws["!cols"] = colWidths;

  // --- APPLY STYLES ---
  for (let c = 3; c <= totalCols; c++) { 
      const cellRef = XLSX.utils.encode_cell({ r: PERIOD_ROW_IDX, c: c });
      if(ws[cellRef]) ws[cellRef].s = styles.periodHeader;
  }
  for (let c = 0; c <= totalCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: SESSION_DATE_ROW_IDX, c: c });
      if(ws[cellRef]) ws[cellRef].s = styles.sessionHeader;
  }
  for (let c = 0; c <= totalCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: SESSION_TYPE_ROW_IDX, c: c });
      if(ws[cellRef]) {
          if (c < 3 || headerRow2[c] === 'Grade') {
              ws[cellRef].s = styles.sessionHeader; 
          } else {
              ws[cellRef].s = styles.typeHeader; 
          }
      }
  }

  Object.keys(rowStyles).forEach(r => {
      const idx = parseInt(r);
      const cellRef = `A${idx + 1}`;
      if(ws[cellRef]) ws[cellRef].s = rowStyles[idx];
  });

  const dataStartRow = 13; 
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
  
  if (ws["A1"]) ws["A1"].s = styles.title;
  if (ws["A2"]) ws["A2"].s = styles.title;
  if (ws["A3"]) ws["A3"].s = styles.subTitle; 
  if (ws["A5"]) ws["A5"].s = styles.title;

  ws['!protect'] = {
    password: "12345", 
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false
  };

  const cleanCourseCode = data.course.replace(/\s+/g, "");
  const fileName = `${cleanCourseCode}_Attendance_Records.xlsx`;
  XLSX.utils.book_append_sheet(wb, ws, "Matrix");
  XLSX.writeFile(wb, fileName);
};