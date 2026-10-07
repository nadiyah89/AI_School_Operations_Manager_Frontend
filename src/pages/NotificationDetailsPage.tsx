import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getNotificationById,
  updateNotification,
} from "../api/notificationsApi";
import type {
  Notification,
  NotificationChannel,
  NotificationStatus,
  UpdateNotificationDto,
} from "../types/notification";
import styles from "./NotificationDetailsPage.module.css";

const statuses: NotificationStatus[] = [
  "Pending",
  "Sent",
  "Failed",
];

const channels: NotificationChannel[] = [
  "SMS",
  "Email",
];

function formatDateTime(date: string | null) {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleString();
}

export default function NotificationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const notificationId = Number(id);

  const [notification, setNotification] =
    useState<Notification | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] =
    useState<UpdateNotificationDto>({
      notificationType: "",
      message: "",
      channel: "SMS",
      status: "Pending",
      sentAt: null,
    });

  useEffect(() => {
    async function loadNotification() {
      if (
        !Number.isInteger(notificationId) ||
        notificationId <= 0
      ) {
        setError("Invalid notification ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getNotificationById(notificationId);

        setNotification(data);

        setFormData({
          notificationType:
            data.notificationType,
          message: data.message,
          channel: data.channel,
          status: data.status,
          sentAt: data.sentAt,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load notification."
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotification();
  }, [notificationId]);

  function handleEdit() {
    if (!notification) {
      return;
    }

    setFormData({
      notificationType:
        notification.notificationType,
      message: notification.message,
      channel: notification.channel,
      status: notification.status,
      sentAt: notification.sentAt,
    });

    setEditError("");
    setIsEditing(true);
  }

  function handleCancel() {
    if (notification) {
      setFormData({
        notificationType:
          notification.notificationType,
        message: notification.message,
        channel: notification.channel,
        status: notification.status,
        sentAt: notification.sentAt,
      });
    }

    setEditError("");
    setIsEditing(false);
  }

  function handleStatusChange(
    status: NotificationStatus
  ) {
    setFormData((current) => ({
      ...current,
      status,
      sentAt:
        status === "Sent"
          ? current.sentAt
          : null,
    }));
  }

  async function handleSave() {
    if (
      !formData.notificationType.trim() ||
      !formData.message.trim()
    ) {
      setEditError(
        "Notification type and message are required."
      );
      return;
    }

    if (
      formData.status === "Sent" &&
      !formData.sentAt
    ) {
      setEditError(
        "Sent date and time are required when status is Sent."
      );
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      const data: UpdateNotificationDto = {
        notificationType:
          formData.notificationType.trim(),
        message: formData.message.trim(),
        channel: formData.channel,
        status: formData.status,
        sentAt:
          formData.status === "Sent"
            ? formData.sentAt
            : null,
      };

      const updated =
        await updateNotification(
          notificationId,
          data
        );

      setNotification(updated);

      setFormData({
        notificationType:
          updated.notificationType,
        message: updated.message,
        channel: updated.channel,
        status: updated.status,
        sentAt: updated.sentAt,
      });

      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to update notification."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>
          Loading notification...
        </p>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className={styles.page}>
        <Link
          to="/operations/notifications"
          className={styles.backLink}
        >
          ← Back to Notifications
        </Link>

        <p className={styles.error}>
          {error || "Notification not found."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link
            to="/operations/notifications"
            className={styles.backLink}
          >
            ← Back to Notifications
          </Link>

          <h1 className={styles.title}>
            Notification Details
          </h1>

          <p className={styles.subtitle}>
            View and manage notification information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleEdit}
          >
            Edit Notification
          </button>
        )}
      </div>

      {isEditing ? (
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>
            Edit Notification
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="notificationType">
                Notification Type
              </label>

              <input
                id="notificationType"
                type="text"
                value={formData.notificationType}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    notificationType:
                      event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="channel">
                Channel
              </label>

              <select
                id="channel"
                value={formData.channel}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    channel:
                      event.target
                        .value as NotificationChannel,
                  }))
                }
              >
                {channels.map((channel) => (
                  <option
                    key={channel}
                    value={channel}
                  >
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                value={formData.status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target
                      .value as NotificationStatus
                  )
                }
              >
                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {formData.status === "Sent" && (
              <div className={styles.formField}>
                <label htmlFor="sentAt">
                  Sent At
                </label>

                <input
                  id="sentAt"
                  type="datetime-local"
                  value={
                    formData.sentAt
                      ? formData.sentAt.slice(0, 16)
                      : ""
                  }
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      sentAt: event.target.value
                        ? new Date(
                            event.target.value
                          ).toISOString()
                        : null,
                    }))
                  }
                />
              </div>
            )}

            <div
              className={`${styles.formField} ${styles.fullWidth}`}
            >
              <label htmlFor="message">
                Message
              </label>

              <textarea
                id="message"
                rows={7}
                value={formData.message}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    message: event.target.value,
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
              className={styles.primaryButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Notification Information
            </h2>

            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span className={styles.label}>
                  Notification ID
                </span>
                <span className={styles.value}>
                  {notification.id}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Notification Type
                </span>
                <span className={styles.value}>
                  {notification.notificationType}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Channel
                </span>
                <span className={styles.value}>
                  {notification.channel}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Status
                </span>

                <span
                  className={`${styles.statusBadge} ${
                    notification.status === "Sent"
                      ? styles.sent
                      : notification.status ===
                        "Failed"
                      ? styles.failed
                      : styles.pending
                  }`}
                >
                  {notification.status}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Record Status
                </span>

                <span
                  className={
                    notification.isActive
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {notification.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Created At
                </span>
                <span className={styles.value}>
                  {formatDateTime(
                    notification.createdAt
                  )}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Sent At
                </span>
                <span className={styles.value}>
                  {formatDateTime(
                    notification.sentAt
                  )}
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
                  {notification.studentId}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Student
                </span>
                <span className={styles.value}>
                  {notification.student
                    ? `${notification.student.firstName} ${notification.student.lastName}`
                    : `Student #${notification.studentId}`}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Parent Information
            </h2>

            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span className={styles.label}>
                  Parent ID
                </span>
                <span className={styles.value}>
                  {notification.parentId}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Parent
                </span>
                <span className={styles.value}>
                  {notification.parent
                    ? `${notification.parent.firstName} ${notification.parent.lastName}`
                    : `Parent #${notification.parentId}`}
                </span>
              </div>

              {notification.parent && (
                <>
                  <div className={styles.detail}>
                    <span className={styles.label}>
                      Relationship
                    </span>
                    <span className={styles.value}>
                      {notification.parent.relationship}
                    </span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>
                      Email
                    </span>
                    <span className={styles.value}>
                      {notification.parent.email}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Message
            </h2>

            <div className={styles.messageBox}>
              {notification.message}
            </div>
          </section>
        </>
      )}

      <div className={styles.bottomActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() =>
            navigate("/operations/notifications")
          }
        >
          Back to Notifications
        </button>
      </div>
    </div>
  );
}