import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  activateAttendance,
  deactivateAttendance,
  getAttendanceById,
  updateAttendance,
} from "../api/attendanceApi";
import type {
  Attendance,
  UpdateAttendanceDto,
} from "../types/attendance";
import styles from "./AttendanceDetailsPage.module.css";

function formatDate(date: string): string {
  if (!date) {
    return "-";
  }

  const datePart = date.slice(0, 10);
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getDateInputValue(date: string): string {
  return date ? date.slice(0, 10) : "";
}

export default function AttendanceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    isPresent: true,
  });

  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const attendanceId = Number(id);

  const isAdmin = user?.role === "Admin";
  const canEdit =
    user?.role === "Admin" || user?.role === "Teacher";

  useEffect(() => {
    async function loadAttendance() {
      if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
        setError("Invalid attendance record ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getAttendanceById(attendanceId);

        setAttendance(data);
        setFormData({
          date: getDateInputValue(data.date),
          isPresent: data.isPresent,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load attendance record."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, [attendanceId]);

  function handleEdit() {
    if (!attendance) {
      return;
    }

    setActionError("");

    setFormData({
      date: getDateInputValue(attendance.date),
      isPresent: attendance.isPresent,
    });

    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (attendance) {
      setFormData({
        date: getDateInputValue(attendance.date),
        isPresent: attendance.isPresent,
      });
    }

    setActionError("");
    setIsEditing(false);
  }

  async function handleSave() {
    if (!attendance) {
      return;
    }

    if (!formData.date) {
      setActionError("Please select a date.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");

      const data: UpdateAttendanceDto = {
        date: `${formData.date}T00:00:00`,
        isPresent: formData.isPresent,
      };

      const updatedAttendance = await updateAttendance(
        attendance.id,
        data
      );

      setAttendance(updatedAttendance);
      setFormData({
        date: getDateInputValue(updatedAttendance.date),
        isPresent: updatedAttendance.isPresent,
      });

      setIsEditing(false);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update attendance record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!attendance) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to deactivate this attendance record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const updatedAttendance = await deactivateAttendance(
        attendance.id
      );

      setAttendance(updatedAttendance);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate attendance record."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate() {
    if (!attendance) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const updatedAttendance = await activateAttendance(
        attendance.id
      );

      setAttendance(updatedAttendance);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to activate attendance record."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>
          Loading attendance record...
        </p>
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className={styles.page}>
        <Link
          to="/operations/attendance"
          className={styles.backLink}
        >
          ← Back to Attendance
        </Link>

        <p className={styles.error}>
          {error || "Attendance record not found."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link
            to="/operations/attendance"
            className={styles.backLink}
          >
            ← Back to Attendance
          </Link>

          <h1 className={styles.title}>
            Attendance Record
          </h1>

          <p className={styles.subtitle}>
            View and manage attendance record details.
          </p>
        </div>

        <div className={styles.headerActions}>
          {canEdit && !isEditing && (
            <button
              type="button"
              className={styles.editButton}
              onClick={handleEdit}
              disabled={actionLoading}
            >
              Edit Record
            </button>
          )}

          {isAdmin && !isEditing && attendance.isActive && (
            <button
              type="button"
              className={styles.deactivateButton}
              onClick={handleDeactivate}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Processing..."
                : "Deactivate"}
            </button>
          )}

          {isAdmin && !isEditing && !attendance.isActive && (
            <button
              type="button"
              className={styles.activateButton}
              onClick={handleActivate}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Processing..."
                : "Activate"}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <p className={styles.actionError}>{actionError}</p>
      )}

      {isEditing ? (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Edit Attendance</h2>
              <p>
                Update the attendance date or attendance status.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="attendanceDate">
                Date
              </label>

              <input
                id="attendanceDate"
                type="date"
                value={formData.date}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="attendanceStatus">
                Status
              </label>

              <select
                id="attendanceStatus"
                value={formData.isPresent ? "present" : "absent"}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    isPresent:
                      event.target.value === "present",
                  }))
                }
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>
      ) : (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>
            Attendance Information
          </h2>

          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>
                Attendance ID
              </span>
              <span className={styles.value}>
                {attendance.id}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Student ID
              </span>
              <span className={styles.value}>
                {attendance.studentId}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Student
              </span>
              <span className={styles.value}>
                {attendance.student
                  ? `${attendance.student.firstName} ${attendance.student.lastName}`
                  : "-"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Date
              </span>
              <span className={styles.value}>
                {formatDate(attendance.date)}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Attendance Status
              </span>

              <span
                className={
                  attendance.isPresent
                    ? styles.presentStatus
                    : styles.absentStatus
                }
              >
                {attendance.isPresent
                  ? "Present"
                  : "Absent"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Record Status
              </span>

              <span
                className={
                  attendance.isActive
                    ? styles.activeStatus
                    : styles.inactiveStatus
                }
              >
                {attendance.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          Student Information
        </h2>

        <div className={styles.detailsGrid}>
          <div className={styles.detail}>
            <span className={styles.label}>
              Student ID
            </span>
            <span className={styles.value}>
              {attendance.studentId}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.label}>
              Student Name
            </span>
            <span className={styles.value}>
              {attendance.student
                ? `${attendance.student.firstName} ${attendance.student.lastName}`
                : "-"}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.label}>
              Date of Birth
            </span>
            <span className={styles.value}>
              {attendance.student
                ? formatDate(attendance.student.dateOfBirth)
                : "-"}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.label}>
              Student Status
            </span>

            {attendance.student ? (
              <span
                className={
                  attendance.student.isActive
                    ? styles.activeStatus
                    : styles.inactiveStatus
                }
              >
                {attendance.student.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            ) : (
              <span className={styles.value}>-</span>
            )}
          </div>
        </div>
      </section>

      <div className={styles.bottomActions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/operations/attendance")}
        >
          Back to Attendance
        </button>
      </div>
    </div>
  );
}