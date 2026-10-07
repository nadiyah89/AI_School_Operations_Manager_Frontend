import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createAttendance,
  getAttendance,
} from "../api/attendanceApi";
import { getStudents } from "../api/studentsApi";
import type { Student } from "../types/student";
import type {
  Attendance,
  CreateAttendanceDto,
} from "../types/attendance";
import styles from "./AttendancePage.module.css";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "absent"
  >("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<CreateAttendanceDto>({
    studentId: 0,
    date: "",
    isPresent: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      try {
        setLoading(true);
        setError("");

        const data = await getAttendance(includeInactive);

        if (!cancelled) {
          setAttendance(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load attendance records."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [includeInactive]);

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        setStudentsLoading(true);

        const data = await getStudents(false, "");

        if (!cancelled) {
          setStudents(data);
        }
      } catch {
        if (!cancelled) {
          setStudents([]);
        }
      } finally {
        if (!cancelled) {
          setStudentsLoading(false);
        }
      }
    }

    if (showForm) {
      loadStudents();
    }

    return () => {
      cancelled = true;
    };
  }, [showForm]);

  function handleInputChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === "studentId"
          ? Number(value)
          : name === "isPresent"
            ? value === "true"
            : value,
    }));
  }

  function resetForm() {
    setFormData({
      studentId: 0,
      date: "",
      isPresent: true,
    });

    setFormError("");
  }

  function handleCancelForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleCreateAttendance(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (formData.studentId === 0) {
      setFormError("Please select a student.");
      return;
    }

    if (!formData.date) {
      setFormError("Please select an attendance date.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const createdAttendance = await createAttendance({
        ...formData,
        date: `${formData.date}T00:00:00`,
      });

      setAttendance((current) => [
        createdAttendance,
        ...current,
      ]);

      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create attendance record."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredAttendance = attendance.filter((record) => {
    const student = record.student;

    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      studentName.toLowerCase().includes(searchText) ||
      String(record.studentId).includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "present" && record.isPresent) ||
      (statusFilter === "absent" && !record.isPresent);

    return matchesSearch && matchesStatus;
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Attendance</h1>

          <p className={styles.subtitle}>
            Manage student attendance records.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          Record Attendance
        </button>
      </header>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Record Attendance</h2>

              <p>
                Select a student, date, and attendance status.
              </p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCancelForm}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateAttendance}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="studentId">
                  Student
                </label>

                <select
                  id="studentId"
                  name="studentId"
                  value={
                    formData.studentId === 0
                      ? ""
                      : formData.studentId
                  }
                  onChange={handleInputChange}
                  required
                  disabled={studentsLoading}
                >
                  <option value="">
                    {studentsLoading
                      ? "Loading students..."
                      : "Select a student"}
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.firstName}{" "}
                      {student.lastName} — ID {student.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="date">
                  Attendance Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="isPresent">
                  Attendance Status
                </label>

                <select
                  id="isPresent"
                  name="isPresent"
                  value={
                    formData.isPresent
                      ? "true"
                      : "false"
                  }
                  onChange={handleInputChange}
                >
                  <option value="true">
                    Present
                  </option>

                  <option value="false">
                    Absent
                  </option>
                </select>
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
                onClick={handleCancelForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Record Attendance"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search by student name or student ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className={styles.filters}>
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
            Active Attendance
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
            All Attendance
          </button>

          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | "present"
                  | "absent"
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="present">
              Present
            </option>

            <option value="absent">
              Absent
            </option>
          </select>
        </div>
      </div>

      {loading && (
        <p className={styles.loading}>
          Loading attendance...
        </p>
      )}

      {!loading && error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        filteredAttendance.length === 0 && (
          <p className={styles.empty}>
            No attendance records found.
          </p>
        )}

      {!loading &&
        !error &&
        filteredAttendance.length > 0 && (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Student ID</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Record Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((record) => {
                    const student = record.student;

                    return (
                      <tr key={record.id}>
                        <td>{record.id}</td>

                        <td>
                          {new Date(
                            record.date
                          ).toLocaleDateString()}
                        </td>

                        <td>{record.studentId}</td>

                        <td>
                          {student
                            ? `${student.firstName} ${student.lastName}`
                            : "Not available"}
                        </td>

                        <td>
                          <span
                            className={
                              record.isPresent
                                ? styles.presentStatus
                                : styles.absentStatus
                            }
                          >
                            {record.isPresent
                              ? "Present"
                              : "Absent"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              record.isActive
                                ? styles.activeStatus
                                : styles.inactiveStatus
                            }
                          >
                            {record.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <Link
                            to={`/operations/attendance/${record.id}`}
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
    </main>
  );
}