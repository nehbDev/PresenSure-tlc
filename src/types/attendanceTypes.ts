// src/types/attendanceTypes.ts

export interface AwayInterval {
  start: string;
  end: string;
  duration_minutes: number;
  duration_readable: string;
  reason: 'LATE_ARRIVAL' | 'AWAY_MID_CLASS' | 'LEFT_EARLY' | 'NO_SHOW';
}

export interface AwayAnalysis {
  total_away_minutes: number;
  total_away_readable: string;
  away_intervals: AwayInterval[];
}

export interface StudentResult {
  attendance_record_id: number;
  student_id: string;
  student_name: string;
  lastname: string;
  sex: string;
  program: string;
  year_level: string;
  block: string;
  
  // New Fields from Backend
  time_in: string;        // e.g., "15:20:00" or "--"
  time_out: string;       // e.g., "16:00:00" or "--"
  first_rssi: number | null;
  proximity_status: string; // "Immediate", "Near", "Far", "N/A"
  
  minutes_late: number;
  final_status: string;
  note: string | null;
  profile_image: string | null;

  // The backend REPLACED locations_data with this:
  away_analysis: AwayAnalysis;

  all_detections?: { detected_at: string; rssi: number; }[]
}
