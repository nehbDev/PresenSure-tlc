export interface LocationLog {
  location_id: number;
  rssi: number;
  detected_at: string;
}

export interface StudentResult {
  attendance_record_id: number | null;
  student_id: string;
  student_name: string;
  lastname: string;
  sex: string;

  program: string;
  year_level: string;
  block: string;

  arrival_time: string;
  minutes_late: number;
  final_status: "Present" | "Late" | "Absent" | "Unverified";
  note: string | null;
  locations_data: LocationLog[];
  profile_image?: string;
}