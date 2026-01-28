// @ts-ignore
import XLSX from "xlsx-js-style"; 
import type { StudentResult, LocationLog } from "../types/attendanceTypes";

// --- Helpers ---

// 1. For Student Logs (Full Date Strings like "2023-10-10 08:30:00")
const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "--:--";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// 2. NEW: For Session Headers (Time-only Strings like "13:30:00")
const formatSqlTime = (timeStr: string | null) => {
  if (!timeStr) return "";
  // Manually parse to ensure consistency regardless of Date object quirks
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const m = minutes; 
  const ampm = h >= 12 ? 'PM' : 'AM';
  
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  
  return `${h}:${m} ${ampm}`;
};

const getBleTimes = (logs: LocationLog[]) => {
  if (!logs || logs.length === 0) return { timeIn: "--:--", timeOut: "--:--" };
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime()
  );
  return {
    timeIn: formatTime(sortedLogs[0].detected_at),
    timeOut: formatTime(sortedLogs[sortedLogs.length - 1].detected_at),
  };
};

export const exportAttendanceToExcel = (
  sessionData: any,
  students: StudentResult[]
) => {
  if (!students || students.length === 0) return;

  const males = students.filter((s) => s.sex === "Male" || s.sex === "M");
  const females = students.filter((s) => s.sex === "Female" || s.sex === "F");

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
    }
  };

  const COLS = [ "No.", "Student Name", "Program & Section", "Status", "Time In", "Time Out", "Mins Late", "Notes" ];
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

  data.push([]); 

  data.push(["ATTENDANCE REPORT"]); 
  merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: totalCols } });

  data.push([]); 

  // Metadata
  const courseStr = `${sessionData.course?.code || ""} - ${sessionData.course?.description || ""}`;
  const instructorStr = sessionData.instructor?.name || "N/A";
  const roomStr = sessionData.course?.room || "N/A";
  
  // Format the Session Times here using the new helper
  const startTimeFormatted = formatSqlTime(sessionData.start_time);
  const endTimeFormatted = formatSqlTime(sessionData.end_time);

  data.push(["", courseStr]); 
  data.push(["", instructorStr, "", "Room:", roomStr]);
  data.push(["", sessionData.date, "", "Time:", `${startTimeFormatted} - ${endTimeFormatted}`]);
  data.push([]); 

  // Row 10: Column Headers
  const headerRowIndex = data.length; 
  data.push(COLS);

  // --- MALE SECTION ---
  if (males.length > 0) {
    const sectionRowIdx = data.length;
    data.push(["MALE"]);
    merges.push({ s: { r: sectionRowIdx, c: 0 }, e: { r: sectionRowIdx, c: totalCols } });
    rowStyles[sectionRowIdx] = styles.sectionHeader; 

    males.forEach((s, index) => {
      const { timeIn, timeOut } = getBleTimes(s.locations_data);
      const fullName = `${s.lastname}, ${(s.student_name || "").split(",")[1] || ""}`;
      const programStr = s.program && s.program !== 'N/A' ? `${s.program} ${s.year_level}-${s.block}` : "N/A";

      data.push([
        index + 1, fullName, programStr, s.final_status,
        timeIn, timeOut, s.minutes_late > 0 ? s.minutes_late : "-", s.note || ""
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
      const { timeIn, timeOut } = getBleTimes(s.locations_data);
      const fullName = `${s.lastname}, ${(s.student_name || "").split(",")[1] || ""}`;
      const programStr = s.program && s.program !== 'N/A' ? `${s.program} ${s.year_level}-${s.block}` : "N/A";

      data.push([
        index + 1, fullName, programStr, s.final_status,
        timeIn, timeOut, s.minutes_late > 0 ? s.minutes_late : "-", s.note || ""
      ]);
    });
  }

  // --- CREATE WORKSHEET ---
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!merges"] = merges;
  ws["!cols"] = [
    { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, 
    { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 25 }
  ];

  // --- APPLY STYLES ---
  if (ws["A1"]) ws["A1"].s = styles.title;
  if (ws["A2"]) ws["A2"].s = styles.subTitle;
  if (ws["A3"]) ws["A3"].s = styles.subTitle;
  if (ws["A5"]) ws["A5"].s = styles.title;

  const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
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
      [3, 4, 5, 6].forEach(C => {
          const cellRef = XLSX.utils.encode_cell({r: R, c: C});
          if (ws[cellRef]) ws[cellRef].s = styles.cellCenter;
      });
  }

  // --- WRITE FILE ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  const safeCode = (sessionData?.course?.code || "Report").replace(/[^a-z0-9]/gi, '_');
  XLSX.writeFile(wb, `Attendance_${safeCode}_${sessionData?.date || "Date"}.xlsx`);
};