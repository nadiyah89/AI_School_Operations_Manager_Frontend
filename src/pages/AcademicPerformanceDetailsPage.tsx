import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  activateAcademicPerformance,
  deactivateAcademicPerformance,
  getAcademicPerformanceById,
  updateAcademicPerformance,
} from "../api/academicPerformanceApi";
import type {
  AcademicPerformance,
  UpdateAcademicPerformanceRequest,
} from "../types/academicPerformance";
import styles from "./AcademicPerformanceDetailsPage.module.css";

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString();
}

function toDateInputValue(date: string) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AcademicPerformanceDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const recordId = Number(id);

  const [record, setRecord] =
    useState<AcademicPerformance | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  const [formError, setFormError] = useState("");
  const [lifecycleError, setLifecycleError] = useState("");

  const [formData, setFormData] =
    useState<UpdateAcademicPerformanceRequest>({
      subject: "",
      examName: "",
      marksObtained: 0,
      maximumMarks: 0,
      examDate: "",
    });

  useEffect(() => {
    let cancelled = false;

    async function loadRecord() {
      if (!Number.isInteger(recordId) || recordId <= 0) {
        setError("Invalid academic performance record ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getAcademicPerformanceById(recordId);

        if (!cancelled) {
          setRecord(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load academic performance record."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecord();

    return () => {
      cancelled = true;
    };
  }, [recordId]);

  const studentName = useMemo(() => {
    if (!record?.student) {
      return `Student #${record?.studentId ?? "-"}`;
    }

    return `${record.student.firstName} ${record.student.lastName}`.trim();
  }, [record]);

  const percentage = useMemo(() => {
    if (!record || record.maximumMarks <= 0) {
      return 0;
    }

    return (record.marksObtained / record.maximumMarks) * 100;
  }, [record]);

  function handleEdit() {
    if (!record) {
      return;
    }

    setFormData({
      subject: record.subject,
      examName: record.examName,
      marksObtained: record.marksObtained,
      maximumMarks: record.maximumMarks,
      examDate: toDateInputValue(record.examDate),
    });

    setFormError("");
    setLifecycleError("");
    setEditing(true);
  }

  function handleCancelEdit() {
    setFormError("");
    setEditing(false);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        name === "marksObtained" || name === "maximumMarks"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!record) {
      return;
    }

    setFormError("");

    const subject = formData.subject.trim();
    const examName = formData.examName.trim();

    if (!subject) {
      setFormError("Subject is required.");
      return;
    }

    if (!examName) {
      setFormError("Exam name is required.");
      return;
    }

    if (!formData.examDate) {
      setFormError("Exam date is required.");
      return;
    }

    if (formData.maximumMarks <= 0) {
      setFormError("Maximum marks must be greater than 0.");
      return;
    }

    if (formData.marksObtained < 0) {
      setFormError("Marks obtained cannot be negative.");
      return;
    }

    if (formData.marksObtained > formData.maximumMarks) {
      setFormError(
        "Marks obtained cannot be greater than maximum marks."
      );
      return;
    }

    try {
      setSaving(true);

      const updated = await updateAcademicPerformance(record.id, {
        subject,
        examName,
        marksObtained: formData.marksObtained,
        maximumMarks: formData.maximumMarks,
        examDate: formData.examDate,
      });

      setRecord(updated);
      setEditing(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to update academic performance record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!record) {
      return;
    }

    try {
      setLifecycleLoading(true);
      setLifecycleError("");

      const updated = await deactivateAcademicPerformance(record.id);

      setRecord(updated);
    } catch (err) {
      setLifecycleError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate academic performance record."
      );
    } finally {
      setLifecycleLoading(false);
    }
  }

  async function handleActivate() {
    if (!record) {
      return;
    }

    try {
      setLifecycleLoading(true);
      setLifecycleError("");

      const updated = await activateAcademicPerformance(record.id);

      setRecord(updated);
    } catch (err) {
      setLifecycleError(
        err instanceof Error
          ? err.message
          : "Failed to activate academic performance record."
      );
    } finally {
      setLifecycleLoading(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>
          Loading academic performance record...
        </p>
      </main>
    );
  }

  if (error || !record) {
    return (
      <main className={styles.page}>
        <Link
          to="/academics/performance"
          className={styles.backButton}
        >
          ← Back to Academic Performance
        </Link>

        <p className={styles.error}>
          {error || "Academic performance record not found."}
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {studentName} — {record.subject}
          </h1>

          <p className={styles.subtitle}>
            Academic performance details and record management.
          </p>
        </div>

        {!editing && (
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.editButton}
              onClick={handleEdit}
              disabled={lifecycleLoading}
            >
              Edit Record
            </button>

            {record.isActive ? (
              <button
                type="button"
                className={styles.deactivateButton}
                onClick={handleDeactivate}
                disabled={lifecycleLoading}
              >
                {lifecycleLoading
                  ? "Deactivating..."
                  : "Deactivate Record"}
              </button>
            ) : (
              <button
                type="button"
                className={styles.activateButton}
                onClick={handleActivate}
                disabled={lifecycleLoading}
              >
                {lifecycleLoading
                  ? "Activating..."
                  : "Activate Record"}
              </button>
            )}
          </div>
        )}
      </header>

      {lifecycleError && (
        <p className={styles.error}>{lifecycleError}</p>
      )}

      <section className={styles.card}>
        {editing ? (
          <form onSubmit={handleSave}>
            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span className={styles.label}>Record ID</span>
                <span className={styles.value}>{record.id}</span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>Status</span>
                <span
                  className={
                    record.isActive
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {record.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>Student</span>
                <span className={styles.value}>{studentName}</span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>Student ID</span>
                <span className={styles.value}>
                  {record.studentId}
                </span>
              </div>

              <div className={styles.formField}>
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="examName">Exam Name</label>
                <input
                  id="examName"
                  name="examName"
                  type="text"
                  value={formData.examName}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="marksObtained">
                  Marks Obtained
                </label>
                <input
                  id="marksObtained"
                  name="marksObtained"
                  type="number"
                  min="0"
                  max={formData.maximumMarks}
                  step="0.01"
                  value={formData.marksObtained}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="maximumMarks">
                  Maximum Marks
                </label>
                <input
                  id="maximumMarks"
                  name="maximumMarks"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.maximumMarks}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="examDate">Exam Date</label>
                <input
                  id="examDate"
                  name="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                />
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Current Percentage
                </span>
                <span className={styles.value}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {formError && (
              <p className={styles.formError}>{formError}</p>
            )}

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
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>Record ID</span>
              <span className={styles.value}>{record.id}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Status</span>
              <span
                className={
                  record.isActive
                    ? styles.activeStatus
                    : styles.inactiveStatus
                }
              >
                {record.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Student</span>
              <span className={styles.value}>{studentName}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Student ID</span>
              <span className={styles.value}>
                {record.studentId}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Subject</span>
              <span className={styles.value}>{record.subject}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Exam Name</span>
              <span className={styles.value}>{record.examName}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Exam Date</span>
              <span className={styles.value}>
                {formatDate(record.examDate)}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Marks Obtained</span>
              <span className={styles.value}>
                {record.marksObtained} / {record.maximumMarks}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Percentage</span>
              <span className={styles.value}>
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </section>

      <Link
        to="/academics/performance"
        className={styles.backLink}
      >
        ← Back to Academic Performance
      </Link>
    </main>
  );
}