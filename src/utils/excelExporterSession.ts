// src/utils/excelExporterSession.ts

// @ts-ignore
import XLSX from "xlsx-js-style"; 
import type { StudentResult } from "../types/attendanceTypes";

// --- Helpers ---

// Formats "15:30:00" to "3:30 PM"
const formatSqlTime = (timeStr: string | null) => {
  if (!timeStr || timeStr === "--" || timeStr === "--:--") return "--:--";
  
  // Handle cases where it might be a full ISO string (though backend sends H:i:s)
  if (timeStr.includes("T")) {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const m = minutes; 
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; 
  return `${h}:${m} ${ampm}`;
};

// --- Export Function ---
export const exportAttendanceToExcel = (
  sessionData: any, 
  students: StudentResult[]
) => {
  if (!students || students.length === 0) return;

  const males = students.filter((s) => s.sex === "Male" || s.sex === "M");
  const females = students.filter((s) => s.sex === "Female" || s.sex === "F");

  // --- 1. GET SEMESTER INFO ---
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

  // --- STYLES CONFIGURATION ---
  const styles = {
    title: {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
    },
    subTitle: {
      font: { sz: 11 },
      alignment: { horizontal: "center", vertical: "center" },
    },
    semHeader: { 
      font: { bold: true, sz: 11 },
      alignment: { horizontal: "center", vertical: "center" },
    },
    tableHeader: {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "E0E0E0" } }, 
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      }
    },
    sectionHeader: {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }, 
      alignment: { horizontal: "center", vertical: "center" },
    },
    cellCenter: {
       alignment: { horizontal: "center", vertical: "center" }
    },
    // Style for status (Present/Late/Absent)
    statusCell: {
        alignment: { horizontal: "center", vertical: "center" }
    }
  };

  const COLS = [ "No.", "Student Name", "Program & Section", "Status", "Time In", "Time Out" ];
  const totalCols = COLS.length - 1; 

  // --- BUILD DATA ---
  const data: any[][] = [];
  const merges: any[] = [];
  const rowStyles: { [key: number]: any } = {}; 

  // Headers
  data.push(["THE LEWIS COLLEGE"]); 
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } });
  
  data.push(["479 Magsaysay st., Cogon, Sorsogon City"]); 
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } });

  data.push(["HIGHER EDUCATION DEPARTMENT"]); 
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } });

  data.push([semesterHeader.toUpperCase()]);
  merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols } });

  data.push([]); 

  data.push(["ATTENDANCE REPORT"]); 
  merges.push({ s: { r: 5, c: 0 }, e: { r: 5, c: totalCols } });

  data.push([]); 

  const courseStr = `${sessionData.course?.code || ""} - ${sessionData.course?.description || ""}`;
  const instructorStr = sessionData.instructor?.name || "N/A";
  const roomStr = sessionData.course?.room || "N/A";
  
  const startTimeFormatted = formatSqlTime(sessionData.start_time);
  const endTimeFormatted = formatSqlTime(sessionData.end_time);

  data.push(["", courseStr]); 
  data.push(["", instructorStr, "", "Room:", roomStr]);
  data.push(["", sessionData.date, "", "Time:", `${startTimeFormatted} - ${endTimeFormatted}`]);
  data.push([]); 

  const headerRowIndex = data.length; 
  data.push(COLS);

  // --- MALE SECTION ---
  if (males.length > 0) {
    const sectionRowIdx = data.length;
    data.push(["MALE"]);
    merges.push({ s: { r: sectionRowIdx, c: 0 }, e: { r: sectionRowIdx, c: totalCols } });
    rowStyles[sectionRowIdx] = styles.sectionHeader; 

    males.forEach((s, index) => {
      // UPDATED: Directly use the fields from backend
      const timeIn = formatSqlTime(s.time_in);
      const timeOut = formatSqlTime(s.time_out);
      
      const fullName = `${s.lastname}, ${(s.student_name || "").split(",")[1] || ""}`;
      const programStr = s.program && s.program !== 'N/A' ? `${s.program} ${s.year_level}-${s.block}` : "N/A";

      data.push([
        index + 1, 
        fullName, 
        programStr, 
        s.final_status,
        timeIn, 
        timeOut
      ]);
    });
  }

  // --- FEMALE SECTION ---
  if (females.length > 0) {
    const sectionRowIdx = data.length;
    data.push(["FEMALE"]);
    merges.push({ s: { r: sectionRowIdx, c: 0 }, e: { r: sectionRowIdx, c: totalCols } });
    rowStyles[sectionRowIdx] = styles.sectionHeader;

    females.forEach((s, index) => {
      // UPDATED: Directly use the fields from backend
      const timeIn = formatSqlTime(s.time_in);
      const timeOut = formatSqlTime(s.time_out);

      const fullName = `${s.lastname}, ${(s.student_name || "").split(",")[1] || ""}`;
      const programStr = s.program && s.program !== 'N/A' ? `${s.program} ${s.year_level}-${s.block}` : "N/A";

      data.push([
        index + 1, 
        fullName, 
        programStr, 
        s.final_status,
        timeIn, 
        timeOut
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!merges"] = merges;
  
  ws["!cols"] = [
    { wch: 5 },  // No.
    { wch: 30 }, // Name
    { wch: 20 }, // Program
    { wch: 12 }, // Status
    { wch: 15 }, // Time In (Widened slightly)
    { wch: 15 }, // Time Out (Widened slightly)
  ];

  if (ws["A1"]) ws["A1"].s = styles.title;
  if (ws["A2"]) ws["A2"].s = styles.subTitle;
  if (ws["A3"]) ws["A3"].s = styles.subTitle;
  if (ws["A4"]) ws["A4"].s = styles.semHeader;
  if (ws["A6"]) ws["A6"].s = styles.title;

  const colLetters = ["A", "B", "C", "D", "E", "F"]; 
  colLetters.forEach(col => {
      const cellRef = `${col}${headerRowIndex + 1}`; 
      if (ws[cellRef]) ws[cellRef].s = styles.tableHeader;
  });

  Object.keys(rowStyles).forEach(rowIndex => {
      const idx = parseInt(rowIndex);
      const cellRef = `A${idx + 1}`; 
      if (ws[cellRef]) ws[cellRef].s = rowStyles[idx];
  });

  const dataStartRow = headerRowIndex + 1;
  const range = XLSX.utils.decode_range(ws['!ref']!);
  
  for (let R = dataStartRow; R <= range.e.r; ++R) {
      // Apply center style to Status, Time In, Time Out columns
      [3, 4, 5].forEach(C => {
          const cellRef = XLSX.utils.encode_cell({r: R, c: C});
          if (ws[cellRef]) ws[cellRef].s = styles.cellCenter;
      });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  const safeCode = (sessionData?.course?.code || "Report").replace(/[^a-z0-9]/gi, '_');
  XLSX.writeFile(wb, `${safeCode}-${sessionData?.date || "Date"}.xlsx`);
};