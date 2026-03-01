import React, { useState, useCallback, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../layout/Breadcrumbs";
import apiService from "../../services/ApiService";
import { FaTrash } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- Constants ---

const DAYS_OPTIONS = [
  { value: "M", label: "Monday" },
  { value: "T", label: "Tuesday" },
  { value: "W", label: "Wednesday" },
  { value: "Th", label: "Thursday" },
  { value: "F", label: "Friday" },
  { value: "Sat", label: "Saturday" },
];

const BUILDINGS_LECTURE: Record<string, string[]> = {
  RFL: ["1A", "2B", "3B", "3C", "3D", "AVR 1"],
  FJN: [
    "102",
    "103",
    "104",
    "202",
    "203",
    "204",
    "205",
    "206",
    "207",
    "ComLab - A",
    "ComLab - B",
    "ComLab - C",
  ],
  RLO: ["201", "202", "301"],
};

const COMLAB_ROOMS = ["A", "B", "C"];

// --- Helper Functions ---

const calculateEndTime = (
  startTime: string,
  units: number,
  daysCount: number,
) => {
  if (!startTime || !units || !daysCount) return "";
  const totalMinutesNeeded = units * 60;
  const minutesPerSession = Math.ceil(totalMinutesNeeded / daysCount);
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minutesPerSession;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Formats string as "Building - Room"
const formatRoomString = (schedule: {
  type: string;
  building: string;
  room: string;
}) => {
  // If Laboratory or building is ComLab
  if (schedule.type === "Laboratory" || schedule.building === "ComLab") {
    const cleanRoom = schedule.room.replace("ComLab - ", "").trim();
    return `ComLab - ${cleanRoom}`;
  }

  if (schedule.room.includes("ComLab")) {
    return schedule.room;
  }

  return `${schedule.building} - ${schedule.room}`;
};

// Parses "Building - Room" into components
const parseRoomString = (roomString: string, type: string) => {
  if (!roomString) return { building: "", room: "" };

  if (type === "Laboratory") {
    const roomLetter = roomString.replace("ComLab - ", "").trim();
    return { building: "ComLab", room: roomLetter };
  }

  if (roomString.startsWith("ComLab")) {
    return { building: "FJN", room: roomString };
  }

  if (roomString.includes(" - ")) {
    const [building, ...roomParts] = roomString.split(" - ");
    return { building: building.trim(), room: roomParts.join(" - ").trim() };
  }

  const parts = roomString.split(" ");
  if (parts.length >= 2) {
    return { building: parts[0], room: parts.slice(1).join(" ") };
  }

  return { building: "", room: roomString };
};

const parseDaysString = (daysStr: string) => {
  if (!daysStr) return [];
  const result: string[] = [];
  const map = { M: "M", T: "T", W: "W", Th: "Th", F: "F", Sat: "Sat" };
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  let tempStr = daysStr;
  while (tempStr.length > 0) {
    let found = false;
    for (const key of keys) {
      if (tempStr.startsWith(key)) {
        result.push(key);
        tempStr = tempStr.slice(key.length);
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  return result;
};

// --- Components ---

const DayMultiSelect: React.FC<{
  value: string[];
  onChange: (newDays: string[]) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const toggleDay = (dayValue: string) => {
    if (value.includes(dayValue)) {
      onChange(value.filter((d) => d !== dayValue));
    } else {
      const newSelection = [...value, dayValue].sort((a, b) => {
        return (
          DAYS_OPTIONS.findIndex((o) => o.value === a) -
          DAYS_OPTIONS.findIndex((o) => o.value === b)
        );
      });
      onChange(newSelection);
    }
  };

  return (
    <div className="relative">
      <div
        className="w-full min-h-[42px] border border-gray-300 px-3 py-2 rounded-md text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer bg-white shadow-sm flex flex-wrap gap-1"
        onClick={() => setOpen(!open)}
      >
        {value.length > 0 ? (
          value.map((d) => (
            <span
              key={d}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium"
            >
              {DAYS_OPTIONS.find((opt) => opt.value === d)?.label}
            </span>
          ))
        ) : (
          <span className="text-gray-400">Select Days</span>
        )}
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          ></div>
          <div className="absolute mt-1 border rounded bg-white shadow-lg w-full z-20 max-h-60 overflow-y-auto">
            {DAYS_OPTIONS.map((d) => (
              <div
                key={d.value}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center ${
                  value.includes(d.value)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => toggleDay(d.value)}
              >
                {d.label}
                {value.includes(d.value) && <span>✓</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Stepper = ({ step }: { step: number }) => {
  const steps = [
    "Subject Information",
    "Schedule Details",
    "Assign Instructor",
    "Review & Confirm",
  ];
  return (
    <div className="flex justify-center mt-6 mb-8">
      <div className="flex items-center w-full max-w-4xl">
        {steps.map((label, index) => {
          const currentStep = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step > currentStep;
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1 relative z-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition shadow ${
                    isActive || isCompleted
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep}
                </div>
                <p
                  className={`mt-2 text-sm text-center whitespace-nowrap font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}
                >
                  {label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-all duration-300 rounded ${step > currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// --- Interfaces ---
interface CourseData {
  course_id: number;
  subject_code: string;
  description: string;
  units?: number;
  instructor_details: {
    user_id?: string;
    name?: string;
  };
  schedules: any[];
}

interface ApiResponse {
  data: CourseData;
}

// --- Main Page ---

const EditSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subject, setSubject] = useState({
    subject_code: "",
    description: "",
    units: "",
  });
  const [instructorId, setInstructorId] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);

  const { data: courseData, isLoading: isFetching } = useQuery({
    queryKey: ["course_details", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const response = await apiService.get<ApiResponse>(
        `/course/${id}/details`,
      );
      return response.data.data;
    },
    enabled: !!id,
    retry: 1,
  });

  useEffect(() => {
    if (courseData) {
      let derivedUnits = "";
      const lectureSched = courseData.schedules.find(
        (s: any) => s.schedule_type === "Lecture",
      );

      if (
        lectureSched &&
        lectureSched.units !== undefined &&
        lectureSched.units !== null
      ) {
        derivedUnits = lectureSched.units.toString();
      }
      if (derivedUnits === "0") derivedUnits = "";

      setSubject({
        subject_code: courseData.subject_code || "",
        description: courseData.description || "",
        units: derivedUnits,
      });

      if (courseData.instructor_details?.user_id) {
        setInstructorId(courseData.instructor_details.user_id);
        setInstructorName(courseData.instructor_details.name || "");
      }

      const formattedSchedules = courseData.schedules.map((s: any) => {
        const { building, room } = parseRoomString(s.room, s.schedule_type);
        return {
          schedule_id: s.schedule_id,
          type: s.schedule_type,
          days: parseDaysString(s.days),
          start_time: s.start_time ? s.start_time.substring(0, 5) : "",
          end_time: s.end_time ? s.end_time.substring(0, 5) : "",
          building: building,
          room: room,
        };
      });

      setSchedules(formattedSchedules);
    }
  }, [courseData]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "units") {
      const num = value.replace(/\D/g, "");
      newValue = num === "" ? "" : Math.min(3, parseInt(num)).toString();
    }
    setSubject((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...schedules];
    const item = { ...updated[index], [field]: value };

    // UPDATE: Handle Type Change
    if (field === "type") {
      if (value === "Laboratory") {
        item.building = "ComLab"; // Auto-set for Lab
        item.room = ""; // Reset room
      } else {
        item.building = ""; // Reset for Lecture
        item.room = "";
      }
    }

    updated[index] = item;

    if (field === "building") {
      item.room = "";
    }

    if ((field === "start_time" || field === "days") && subject.units) {
      const units = parseInt(subject.units);
      const daysCount = field === "days" ? value.length : item.days.length;
      const startTime = field === "start_time" ? value : item.start_time;
      if (startTime && daysCount > 0) {
        item.end_time = calculateEndTime(startTime, units, daysCount);
      }
    }
    setSchedules(updated);
  };

  const addLabManually = () => {
    if (schedules.length < 2) {
      setSchedules([
        ...schedules,
        {
          type: "Laboratory",
          days: [],
          start_time: "",
          end_time: "",
          building: "ComLab",
          room: "",
        },
      ]);
    }
  };

  const removeLab = () => setSchedules([schedules[0]]);

  const hasConflict = useCallback(
    (labStart: string, labEnd: string, labDays: string[]) => {
      const lec = schedules[0];
      if (!lec || !lec.start_time || !lec.end_time) return false;
      const commonDays = labDays.filter((d) => lec.days.includes(d));
      if (commonDays.length === 0) return false;
      const lStart = toMinutes(labStart);
      const lEnd = toMinutes(labEnd);
      const lecStart = toMinutes(lec.start_time);
      const lecEnd = toMinutes(lec.end_time);
      return lStart < lecEnd && lEnd > lecStart;
    },
    [schedules],
  );

  const validateStep1 = () => {
    if (!subject.subject_code || !subject.description || !subject.units) {
      toast.error("Please fill all subject fields.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (const sch of schedules) {
      if (!sch.days.length || !sch.start_time || !sch.end_time || !sch.room) {
        toast.error(`Please complete all fields for ${sch.type}.`);
        return false;
      }
      if (sch.type === "Lecture" && !sch.building) {
        toast.error("Please select a building for Lecture.");
        return false;
      }
    }
    if (
      schedules.length > 1 &&
      hasConflict(
        schedules[1].start_time,
        schedules[1].end_time,
        schedules[1].days,
      )
    ) {
      toast.error("Schedule conflict detected.");
      return false;
    }
    return true;
  };

  const checkInstructor = async () => {
    if (!instructorId) return toast.error("Enter Instructor ID");
    setIsLoading(true);
    try {
      const res = await apiService.get<{ exists: boolean; fullname?: string }>(
        `/instructors/${instructorId}`,
      );
      if (!res.data.exists) toast.error("Instructor not found.");
      else {
        setInstructorName(res.data.fullname || "");
        setStep(4);
      }
    } catch {
      toast.error("Instructor lookup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const formattedSchedules = schedules.map((s) => ({
        ...s,
        room: formatRoomString(s),
      }));

      await apiService.post(`/updateManualSchedule/${id}`, {
        ...subject,
        course_id: id,
        schedules: formattedSchedules,
        instructor_id: instructorId,
      });

      await queryClient.invalidateQueries({ queryKey: ["course_details", id] });
      await queryClient.invalidateQueries({
        queryKey: ["courses_active_semester"],
      });
      toast.success("Schedule updated successfully!");
      setTimeout(() => navigate(`/schedules/schedule-details?id=${id}`), 500);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update schedule.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading schedule details...
      </div>
    );

  return (
    <div className="space-y-4">
      <Toaster position="top-center" containerClassName="mt-10" />
      <Breadcrumbs
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Schedules", to: "/schedules" },
          {
            label: "Course Details",
            to: `/schedules/schedule-details?id=${id}`,
          },
          { label: "Edit Schedule" },
        ]}
      />
      <Stepper step={step} />

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 ">
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 shadow">
                <h4 className="font-semibold text-white">
                  Subject Information
                </h4>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject_code"
                    value={subject.subject_code}
                    onChange={handleSubjectChange}
                    placeholder="e.g. IT 101"
                    className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={subject.description}
                    onChange={handleSubjectChange}
                    placeholder="Subject Name"
                    className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Units<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="units"
                    min="1"
                    max="3"
                    value={subject.units}
                    onChange={handleSubjectChange}
                    className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => validateStep1() && setStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-blue-600 px-4 py-3 shadow rounded-t-lg flex justify-between items-center">
                <h4 className="font-semibold text-white">Schedule Details</h4>
                {schedules.length < 2 && (
                  <button
                    onClick={addLabManually}
                    className="text-xs bg-white text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-50"
                  >
                    + Add Lab
                  </button>
                )}
              </div>
              <div className="p-4 space-y-6">
                {schedules.map((sch, index) => {
                  const isLab = sch.type === "Laboratory";
                  const conflict =
                    isLab &&
                    hasConflict(sch.start_time, sch.end_time, sch.days);
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 shadow-sm relative"
                    >
                      {/* Header with Type Selector and Delete Button */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-700">
                            Type:
                          </span>
                          <select
                            value={sch.type}
                            onChange={(e) =>
                              handleScheduleChange(
                                index,
                                "type",
                                e.target.value,
                              )
                            }
                            className="bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Lecture">Lecture</option>
                            <option value="Laboratory">Laboratory</option>
                          </select>
                        </div>
                        {/* Only allow deleting if it is not the primary schedule (index > 0) */}
                        {index > 0 && (
                          <button
                            onClick={removeLab}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Schedule"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">
                            Days <span className="text-red-500">*</span>
                          </label>
                          <DayMultiSelect
                            value={sch.days}
                            onChange={(v) =>
                              handleScheduleChange(index, "days", v)
                            }
                          />
                          {conflict && (
                            <p className="text-xs text-red-500 mt-1">
                              Time conflict with Lecture!
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                              Start <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              value={sch.start_time}
                              onChange={(e) =>
                                handleScheduleChange(
                                  index,
                                  "start_time",
                                  e.target.value,
                                )
                              }
                              className={`w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600 ${conflict ? "bg-red-50 border-red-300" : ""}`}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                              End <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              value={sch.end_time}
                              readOnly
                              className="w-full h-[42px] border px-3 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                        </div>
                        {!isLab && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                              Building <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={sch.building}
                              onChange={(e) =>
                                handleScheduleChange(
                                  index,
                                  "building",
                                  e.target.value,
                                )
                              }
                              className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="">Select Building</option>
                              {Object.keys(BUILDINGS_LECTURE).map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">
                            Room {isLab ? "(ComLab)" : ""}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {isLab ? (
                            <select
                              value={sch.room}
                              onChange={(e) =>
                                handleScheduleChange(
                                  index,
                                  "room",
                                  e.target.value,
                                )
                              }
                              className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="">Select Room</option>
                              {COMLAB_ROOMS.map((r) => (
                                <option key={r} value={r}>
                                  ComLab - {r}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={sch.room}
                              onChange={(e) =>
                                handleScheduleChange(
                                  index,
                                  "room",
                                  e.target.value,
                                )
                              }
                              disabled={!sch.building}
                              className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
                            >
                              <option value="">Select Room</option>
                              {sch.building &&
                                BUILDINGS_LECTURE[sch.building]?.map((r) => {
                                  const displayRoom = r.includes("ComLab")
                                    ? r
                                    : `${sch.building} - ${r}`;
                                  return (
                                    <option key={r} value={r}>
                                      {displayRoom}
                                    </option>
                                  );
                                })}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={() => validateStep2() && setStep(3)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 shadow">
                <h4 className="font-semibold text-white">Assign Instructor</h4>
              </div>
              <div className="p-6 grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Instructor ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    placeholder="Enter Instructor ID"
                    className="w-full h-[42px] border px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                {instructorName && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm font-medium">
                    Found: {instructorName}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={checkInstructor}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Checking..." : "Next"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 shadow">
                <h4 className="font-semibold text-white">Review & Confirm</h4>
              </div>
              <div className="p-6 grid gap-6">
                <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                  <div>
                    <span className="text-gray-500 block">Subject</span>
                    <span className="font-medium">{subject.subject_code}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Units</span>
                    <span className="font-medium">{subject.units}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Description</span>
                    <span className="font-medium">{subject.description}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Instructor</span>
                    <span className="font-medium">
                      {instructorName} ({instructorId})
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-700 text-xs uppercase">
                    Schedules
                  </h5>
                  {schedules.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between bg-gray-50 p-3 rounded border border-gray-200 text-sm"
                    >
                      <span className="font-bold text-blue-700">{s.type}</span>
                      <span>
                        {s.days.join(", ")} | {s.start_time}-{s.end_time}
                      </span>
                      <span className="text-gray-600">
                        {formatRoomString(s)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Confirm & Update"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSchedule;
