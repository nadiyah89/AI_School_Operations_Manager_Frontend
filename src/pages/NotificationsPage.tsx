import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createNotification,
  getNotifications,
} from "../api/notificationsApi";
import { getStudents } from "../api/studentsApi";
import { getParents } from "../api/parentsApi";
import type {
  CreateNotificationDto,
  Notification,
  NotificationChannel,
  NotificationStatus,
} from "../types/notification";
import type { Student } from "../types/student";
import type { Parent } from "../types/parent";
import styles from "./NotificationsPage.module.css";

const notificationStatuses: NotificationStatus[] = [
  "Pending",
  "Sent",
  "Failed",
];

const notificationChannels: NotificationChannel[] = [
  "SMS",
  "Email",
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [includeInactive, setIncludeInactive] =
    useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] =
    useState<CreateNotificationDto>({
      studentId: 0,
      parentId: 0,
      notificationType: "",
      message: "",
      channel: "SMS",
    });

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications({
        includeInactive,
      });

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setNotifications(sorted);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [includeInactive]);

  async function loadFormData() {
    try {
      setFormLoading(true);
      setFormError("");

      const [studentData, parentData] =
        await Promise.all([
          getStudents(false, ""),
          getParents(false, ""),
        ]);

      setStudents(studentData);
      setParents(parentData);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to load students and parents."
      );
    } finally {
      setFormLoading(false);
    }
  }

  function handleShowForm() {
    setFormError("");
    setShowForm(true);
    loadFormData();
  }

  function handleStudentChange(
    studentId: number
  ) {
    const matchingParent = parents.find(
      (parent) => parent.studentId === studentId
    );

    setFormData((current) => ({
      ...current,
      studentId,
      parentId:
        matchingParent?.id ?? current.parentId,
    }));
  }

  async function handleCreate(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      !formData.studentId ||
      !formData.parentId ||
      !formData.notificationType.trim() ||
      !formData.message.trim()
    ) {
      setFormError(
        "Student, parent, notification type, and message are required."
      );
      return;
    }

    try {
      setFormError("");

      const created = await createNotification({
        ...formData,
        notificationType:
          formData.notificationType.trim(),
        message: formData.message.trim(),
      });

      setNotifications((current) =>
        [created, ...current].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      );

      setFormData({
        studentId: 0,
        parentId: 0,
        notificationType: "",
        message: "",
        channel: "SMS",
      });

      setShowForm(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create notification."
      );
    }
  }

  const notificationTypes = useMemo(() => {
    return Array.from(
      new Set(
        notifications
          .map(
            (notification) =>
              notification.notificationType
          )
          .filter(Boolean)
      )
    ).sort();
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const studentName = notification.student
        ? `${notification.student.firstName} ${notification.student.lastName}`
        : "";

      const parentName = notification.parent
        ? `${notification.parent.firstName} ${notification.parent.lastName}`
        : "";

      const matchesSearch =
        !query ||
        studentName
          .toLowerCase()
          .includes(query) ||
        parentName
          .toLowerCase()
          .includes(query) ||
        notification.message
          .toLowerCase()
          .includes(query) ||
        notification.notificationType
          .toLowerCase()
          .includes(query) ||
        String(notification.studentId).includes(
          query
        ) ||
        String(notification.parentId).includes(query);

      const matchesStatus =
        !statusFilter ||
        notification.status === statusFilter;

      const matchesType =
        !typeFilter ||
        notification.notificationType ===
          typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    notifications,
    search,
    statusFilter,
    typeFilter,
  ]);

  function formatDate(date: string) {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleString();
  }

  function getStudentName(
    notification: Notification
  ) {
    if (!notification.student) {
      return `Student #${notification.studentId}`;
    }

    return `${notification.student.firstName} ${notification.student.lastName}`;
  }

  function getParentName(
    notification: Notification
  ) {
    if (!notification.parent) {
      return `Parent #${notification.parentId}`;
    }

    return `${notification.parent.firstName} ${notification.parent.lastName}`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Notifications
          </h1>

          <p className={styles.subtitle}>
            Manage school notifications sent to
            students and parents.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleShowForm}
        >
          Send Notification
        </button>
      </div>

      {showForm && (
        <section className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Send Notification</h2>

              <p>
                Create a notification for a student
                and their parent.
              </p>
            </div>
          </div>

          {formLoading ? (
            <p className={styles.loading}>
              Loading students and parents...
            </p>
          ) : (
            <form onSubmit={handleCreate}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="student">
                    Student
                  </label>

                  <select
                    id="student"
                    value={formData.studentId}
                    onChange={(event) =>
                      handleStudentChange(
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value={0}>
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
                  <label htmlFor="parent">
                    Parent
                  </label>

                  <select
                    id="parent"
                    value={formData.parentId}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        parentId: Number(
                          event.target.value
                        ),
                      }))
                    }
                  >
                    <option value={0}>
                      Select parent
                    </option>

                    {parents
                      .filter(
                        (parent) =>
                          !formData.studentId ||
                          parent.studentId ===
                            formData.studentId
                      )
                      .map((parent) => (
                        <option
                          key={parent.id}
                          value={parent.id}
                        >
                          {parent.firstName}{" "}
                          {parent.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="notificationType">
                    Notification Type
                  </label>

                  <input
                    id="notificationType"
                    type="text"
                    placeholder="e.g. Attendance"
                    value={
                      formData.notificationType
                    }
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
                    {notificationChannels.map(
                      (channel) => (
                        <option
                          key={channel}
                          value={channel}
                        >
                          {channel}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  className={`${styles.formField} ${styles.fullWidth}`}
                >
                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Enter notification message..."
                    value={formData.message}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        message:
                          event.target.value,
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
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                >
                  Send Notification
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by student, parent, type, or message..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className={styles.filters}>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={
                !includeInactive
                  ? styles.activeToggle
                  : styles.toggleButton
              }
              onClick={() =>
                setIncludeInactive(false)
              }
            >
              Active Notifications
            </button>

            <button
              type="button"
              className={
                includeInactive
                  ? styles.activeToggle
                  : styles.toggleButton
              }
              onClick={() =>
                setIncludeInactive(true)
              }
            >
              All Notifications
            </button>
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="">
              All Statuses
            </option>

            {notificationStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="">
              All Types
            </option>

            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>
          Loading notifications...
        </p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : filteredNotifications.length === 0 ? (
        <p className={styles.empty}>
          No notifications found.
        </p>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Parent</th>
                  <th>Type</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Record Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredNotifications.map(
                  (notification) => (
                    <tr key={notification.id}>
                      <td>{notification.id}</td>

                      <td>
                        {formatDate(
                          notification.createdAt
                        )}
                      </td>

                      <td>
                        <div>
                          <strong>
                            {getStudentName(
                              notification
                            )}
                          </strong>

                          <span
                            className={
                              styles.secondaryText
                            }
                          >
                            ID:{" "}
                            {
                              notification.studentId
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>
                            {getParentName(
                              notification
                            )}
                          </strong>

                          <span
                            className={
                              styles.secondaryText
                            }
                          >
                            ID:{" "}
                            {
                              notification.parentId
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        {
                          notification.notificationType
                        }
                      </td>

                      <td>{notification.channel}</td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            notification.status ===
                            "Sent"
                              ? styles.sent
                              : notification.status ===
                                "Failed"
                              ? styles.failed
                              : styles.pending
                          }`}
                        >
                          {notification.status}
                        </span>
                      </td>

                      <td>
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
                      </td>

                      <td>
                        <Link
                          to={`/operations/notifications/${notification.id}`}
                          className={styles.viewButton}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}