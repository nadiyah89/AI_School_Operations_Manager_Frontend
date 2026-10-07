import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getMeetingById,
  updateMeeting,
} from "../api/meetingsApi";
import type {
  Meeting,
  MeetingStatus,
  UpdateMeetingDto,
} from "../types/meeting";
import styles from "./MeetingDetailsPage.module.css";

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

function toDateTimeLocalValue(date: string): string {
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date.slice(0, 16);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(date: string): string {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString();
}

export default function MeetingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] = useState({
    meetingDate: "",
    purpose: "",
    notes: "",
    status: "Scheduled" as MeetingStatus,
  });

  const meetingId = Number(id);

  useEffect(() => {
    async function loadMeeting() {
      if (!Number.isInteger(meetingId) || meetingId <= 0) {
        setError("Invalid meeting ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMeetingById(meetingId);

        setMeeting(data);

        setFormData({
          meetingDate: toDateTimeLocalValue(
            data.meetingDate
          ),
          purpose: data.purpose,
          notes: data.notes ?? "",
          status: data.status,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load meeting."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeeting();
  }, [meetingId]);

  function handleEdit() {
    if (!meeting) {
      return;
    }

    setFormData({
      meetingDate: toDateTimeLocalValue(
        meeting.meetingDate
      ),
      purpose: meeting.purpose,
      notes: meeting.notes ?? "",
      status: meeting.status,
    });

    setEditError("");
    setIsEditing(true);
  }

  function handleCancel() {
    if (meeting) {
      setFormData({
        meetingDate: toDateTimeLocalValue(
          meeting.meetingDate
        ),
        purpose: meeting.purpose,
        notes: meeting.notes ?? "",
        status: meeting.status,
      });
    }

    setEditError("");
    setIsEditing(false);
  }

  async function handleSave() {
    if (!meeting) {
      return;
    }

    if (
      !formData.meetingDate ||
      !formData.purpose.trim()
    ) {
      setEditError(
        "Meeting date and purpose are required."
      );
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      const data: UpdateMeetingDto = {
        meetingDate: formData.meetingDate,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim() || null,
        status: formData.status,
      };

      const updatedMeeting = await updateMeeting(
        meeting.id,
        data
      );

      setMeeting(updatedMeeting);

      setFormData({
        meetingDate: toDateTimeLocalValue(
          updatedMeeting.meetingDate
        ),
        purpose: updatedMeeting.purpose,
        notes: updatedMeeting.notes ?? "",
        status: updatedMeeting.status,
      });

      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to update meeting."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>
          Loading meeting...
        </p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className={styles.page}>
        <Link
          to="/operations/meetings"
          className={styles.backLink}
        >
          ← Back to Meetings
        </Link>

        <p className={styles.error}>
          {error || "Meeting not found."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link
            to="/operations/meetings"
            className={styles.backLink}
          >
            ← Back to Meetings
          </Link>

          <h1 className={styles.title}>
            Meeting Details
          </h1>

          <p className={styles.subtitle}>
            View and manage meeting information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEdit}
          >
            Edit Meeting
          </button>
        )}
      </div>

      {isEditing ? (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Edit Meeting</h2>
              <p>
                Update the meeting details.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
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
              <label htmlFor="meetingStatus">
                Status
              </label>

              <select
                id="meetingStatus"
                value={formData.status}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    status:
                      event.target
                        .value as MeetingStatus,
                  }))
                }
              >
                <option value="Scheduled">
                  Scheduled
                </option>
                <option value="Completed">
                  Completed
                </option>
                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="meetingPurpose">
                Purpose
              </label>

              <input
                id="meetingPurpose"
                type="text"
                value={formData.purpose}
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
                rows={5}
                value={formData.notes}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {editError && (
            <p className={styles.formError}>
              {editError}
            </p>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancel}
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
        <>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Meeting Information
            </h2>

            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span className={styles.label}>
                  Meeting ID
                </span>
                <span className={styles.value}>
                  {meeting.id}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Meeting Date & Time
                </span>
                <span className={styles.value}>
                  {formatDateTime(
                    meeting.meetingDate
                  )}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Purpose
                </span>
                <span className={styles.value}>
                  {meeting.purpose}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Status
                </span>

                <span
                  className={
                    meeting.status === "Scheduled"
                      ? styles.scheduledStatus
                      : meeting.status === "Completed"
                        ? styles.completedStatus
                        : styles.cancelledStatus
                  }
                >
                  {meeting.status}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Record Status
                </span>

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
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Notes
                </span>

                <span className={styles.value}>
                  {meeting.notes || "-"}
                </span>
              </div>
            </div>
          </section>

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
                  {meeting.studentId}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Student Name
                </span>
                <span className={styles.value}>
                  {meeting.student
                    ? `${meeting.student.firstName} ${meeting.student.lastName}`
                    : "-"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Date of Birth
                </span>
                <span className={styles.value}>
                  {meeting.student
                    ? formatDate(
                        meeting.student.dateOfBirth
                      )
                    : "-"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Student Status
                </span>

                {meeting.student ? (
                  <span
                    className={
                      meeting.student.isActive
                        ? styles.activeStatus
                        : styles.inactiveStatus
                    }
                  >
                    {meeting.student.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                ) : (
                  <span className={styles.value}>
                    -
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Teacher Information
            </h2>

            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span className={styles.label}>
                  Teacher ID
                </span>
                <span className={styles.value}>
                  {meeting.teacherId}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Teacher Name
                </span>
                <span className={styles.value}>
                  {meeting.teacher
                    ? `${meeting.teacher.firstName} ${meeting.teacher.lastName}`
                    : "-"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Phone
                </span>
                <span className={styles.value}>
                  {meeting.teacher?.phoneNumber ||
                    "-"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Email
                </span>
                <span className={styles.value}>
                  {meeting.teacher?.email || "-"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Teacher Status
                </span>

                {meeting.teacher ? (
                  <span
                    className={
                      meeting.teacher.isActive
                        ? styles.activeStatus
                        : styles.inactiveStatus
                    }
                  >
                    {meeting.teacher.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                ) : (
                  <span className={styles.value}>
                    -
                  </span>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <div className={styles.bottomActions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() =>
            navigate("/operations/meetings")
          }
        >
          Back to Meetings
        </button>
      </div>
    </div>
  );
}