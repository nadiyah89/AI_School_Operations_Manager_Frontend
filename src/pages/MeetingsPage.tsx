import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createMeeting,
  getMeetings,
  getMyMeetings,
} from "../api/meetingsApi";
import { getStudents } from "../api/studentsApi";
import { getTeachers } from "../api/teachersApi";
import { useAuth } from "../context/AuthContext";
import type {
  CreateMeetingDto,
  Meeting,
  MeetingStatus,
  MeetingSummary,
} from "../types/meeting";
import type { Student } from "../types/student";
import type { Teacher } from "../types/teacher";
import styles from "./MeetingsPage.module.css";

function formatDateTime(date: string): string {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleString();
}


export default function MeetingsPage() {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [myMeetings, setMyMeetings] = useState<MeetingSummary[]>([]);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<MeetingStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    teacherId: "",
    meetingDate: "",
    purpose: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const isAdmin = user?.role === "Admin";
  const isTeacher = user?.role === "Teacher";
  const isParent = user?.role === "Parent";

  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoading(true);
        setError("");

        if (isAdmin) {
          const data = await getMeetings(includeInactive);
          setMeetings(data);
          setMyMeetings([]);
        } else if (isTeacher || isParent) {
          const data = await getMyMeetings(
            statusFilter || undefined,
            dateFilter || undefined
          );

          setMyMeetings(data);
          setMeetings([]);
        } else {
          setMeetings([]);
          setMyMeetings([]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load meetings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, [
    isAdmin,
    isTeacher,
    isParent,
    includeInactive,
    statusFilter,
    dateFilter,
  ]);

  useEffect(() => {
    async function loadFormData() {
      if (!showForm) {
        return;
      }

      try {
        setFormLoading(true);
        setFormError("");

        const [studentData, teacherData] = await Promise.all([
          getStudents(false, ""),
          getTeachers(false, ""),
        ]);

        setStudents(studentData);
        setTeachers(teacherData);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : "Failed to load students and teachers."
        );
      } finally {
        setFormLoading(false);
      }
    }

    loadFormData();
  }, [showForm]);

  const filteredMeetings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!isAdmin) {
      return myMeetings;
    }

    return meetings.filter((meeting) => {
      const studentName = meeting.student
        ? `${meeting.student.firstName} ${meeting.student.lastName}`
        : "";

      const teacherName = meeting.teacher
        ? `${meeting.teacher.firstName} ${meeting.teacher.lastName}`
        : "";

      const matchesSearch =
        !query ||
        studentName.toLowerCase().includes(query) ||
        teacherName.toLowerCase().includes(query) ||
        meeting.studentId.toString().includes(query) ||
        meeting.teacherId.toString().includes(query) ||
        meeting.purpose.toLowerCase().includes(query);

      const matchesStatus =
        !statusFilter || meeting.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        meeting.meetingDate.slice(0, 10) === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    meetings,
    myMeetings,
    search,
    statusFilter,
    dateFilter,
    isAdmin,
  ]);

  function handleOpenForm() {
    setFormData({
      studentId: "",
      teacherId: "",
      meetingDate: "",
      purpose: "",
      notes: "",
    });

    setFormError("");
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setFormError("");
  }

  async function handleCreateMeeting() {
    if (
      !formData.studentId ||
      !formData.teacherId ||
      !formData.meetingDate ||
      !formData.purpose.trim()
    ) {
      setFormError(
        "Please fill in all required fields."
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const data: CreateMeetingDto = {
        studentId: Number(formData.studentId),
        teacherId: Number(formData.teacherId),
        meetingDate: formData.meetingDate,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim() || null,
      };

      const createdMeeting = await createMeeting(data);

      if (isAdmin) {
        setMeetings((current) => [
          createdMeeting,
          ...current,
        ]);
      }

      handleCloseForm();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create meeting."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Meetings</h1>
          <p className={styles.subtitle}>
            Manage scheduled meetings between students,
            teachers, and parents.
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            type="button"
            className={styles.addButton}
            onClick={handleOpenForm}
          >
            Record Meeting
          </button>
        )}
      </div>

      {showForm && (
        <section className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Record Meeting</h2>
              <p>
                Create a new meeting for a student and teacher.
              </p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCloseForm}
              disabled={saving}
            >
              Close
            </button>
          </div>

          {formLoading ? (
            <p className={styles.loading}>
              Loading students and teachers...
            </p>
          ) : (
            <>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="meetingStudent">
                    Student
                  </label>

                  <select
                    id="meetingStudent"
                    value={formData.studentId}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        studentId: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map((student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {student.firstName}{" "}
                        {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="meetingTeacher">
                    Teacher
                  </label>

                  <select
                    id="meetingTeacher"
                    value={formData.teacherId}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        teacherId: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Select teacher
                    </option>

                    {teachers.map((teacher) => (
                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {teacher.firstName}{" "}
                        {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="meetingDate">
                    Meeting Date & Time
                  </label>

                  <input
                    id="meetingDate"
                    type="datetime-local"
                    value={formData.meetingDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        meetingDate: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="meetingPurpose">
                    Purpose
                  </label>

                  <input
                    id="meetingPurpose"
                    type="text"
                    value={formData.purpose}
                    placeholder="Enter meeting purpose"
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        purpose: event.target.value,
                      }))
                    }
                  />
                </div>

                <div
                  className={`${styles.formField} ${styles.fullWidth}`}
                >
                  <label htmlFor="meetingNotes">
                    Notes
                  </label>

                  <textarea
                    id="meetingNotes"
                    value={formData.notes}
                    placeholder="Enter optional meeting notes"
                    rows={4}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {formError && (
                <p className={styles.formError}>
                  {formError}
                </p>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCloseForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleCreateMeeting}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Meeting"}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by student, teacher, ID or purpose..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className={styles.filters}>
          {isAdmin && (
            <>
              <button
                type="button"
                className={
                  !includeInactive
                    ? styles.activeFilter
                    : styles.filterButton
                }
                onClick={() =>
                  setIncludeInactive(false)
                }
              >
                Active Meetings
              </button>

              <button
                type="button"
                className={
                  includeInactive
                    ? styles.activeFilter
                    : styles.filterButton
                }
                onClick={() =>
                  setIncludeInactive(true)
                }
              >
                All Meetings
              </button>
            </>
          )}

          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as MeetingStatus | ""
              )
            }
          >
            <option value="">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            className={styles.dateFilter}
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
          />
        </div>
      </div>

      {loading && (
        <p className={styles.loading}>
          Loading meetings...
        </p>
      )}

      {!loading && error && (
        <p className={styles.error}>{error}</p>
      )}

      {!loading &&
        !error &&
        filteredMeetings.length === 0 && (
          <div className={styles.empty}>
            No meetings found.
          </div>
        )}

      {!loading &&
        !error &&
        filteredMeetings.length > 0 && (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date & Time</th>
                    <th>Student</th>
                    <th>Teacher</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    {isAdmin && <th>Record Status</th>}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMeetings.map((meeting) => {
                    const meetingId = meeting.id;

                    const studentName =
                      "student" in meeting &&
                      meeting.student
                        ? `${meeting.student.firstName} ${meeting.student.lastName}`
                        : "studentName" in meeting
                          ? meeting.studentName
                          : `Student ${meeting.studentId}`;

                    const teacherName =
                      "teacher" in meeting &&
                      meeting.teacher
                        ? `${meeting.teacher.firstName} ${meeting.teacher.lastName}`
                        : "teacherName" in meeting
                          ? meeting.teacherName
                          : `Teacher ${meeting.teacherId}`;

                    return (
                      <tr key={meetingId}>
                        <td>{meetingId}</td>

                        <td>
                          {formatDateTime(
                            meeting.meetingDate
                          )}
                        </td>

                        <td>
                          {studentName}
                        </td>

                        <td>
                          {teacherName}
                        </td>

                        <td>
                          {meeting.purpose}
                        </td>

                        <td>
                          <span
                            className={
                              meeting.status ===
                              "Scheduled"
                                ? styles.scheduledStatus
                                : meeting.status ===
                                    "Completed"
                                  ? styles.completedStatus
                                  : styles.cancelledStatus
                            }
                          >
                            {meeting.status}
                          </span>
                        </td>

                        {isAdmin && (
                          <td>
                            {"isActive" in meeting && (
                              <span
                                className={
                                  meeting.isActive
                                    ? styles.activeStatus
                                    : styles.inactiveStatus
                                }
                              >
                                {meeting.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            )}
                          </td>
                        )}

                        <td>
                          <Link
                            to={`/operations/meetings/${meetingId}`}
                            className={styles.viewButton}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}