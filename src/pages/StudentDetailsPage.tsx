import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getStudentById,
  updateStudent,
  deactivateStudent,
  activateStudent,
} from "../api/studentsApi";
import type { Student } from "../types/student";
import styles from "./StudentDetailsPage.module.css";

export default function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    async function loadStudent() {
      if (!id) {
        setError("Student ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await getStudentById(Number(id));

        setStudent(data);

        setFirstName(data.firstName);
        setLastName(data.lastName);

        setDateOfBirth(
          new Date(data.dateOfBirth).toISOString().split("T")[0]
        );
      } catch {
        setError("Failed to load student.");
      } finally {
        setIsLoading(false);
      }
    }

    loadStudent();
  }, [id]);

  function handleEdit() {
    if (!student) {
      return;
    }

    setFirstName(student.firstName);
    setLastName(student.lastName);
    setDateOfBirth(
      new Date(student.dateOfBirth).toISOString().split("T")[0]
    );

    setUpdateError("");
    setStatusError("");
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setDateOfBirth(
        new Date(student.dateOfBirth).toISOString().split("T")[0]
      );
    }

    setUpdateError("");
    setIsEditing(false);
  }

  async function handleUpdateStudent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!student) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");

      const updatedStudent = await updateStudent(student.id, {
        firstName,
        lastName,
        dateOfBirth,
      });

      setStudent(updatedStudent);
      setIsEditing(false);
    } catch {
      setUpdateError("Failed to update student.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeactivate() {
    if (!student) {
      return;
    }

    try {
      setIsTogglingStatus(true);
      setStatusError("");

      const updatedStudent = await deactivateStudent(student.id);

      setStudent(updatedStudent);
    } catch {
      setStatusError("Failed to deactivate student.");
    } finally {
      setIsTogglingStatus(false);
    }
  }

  async function handleActivate() {
    if (!student) {
      return;
    }

    try {
      setIsTogglingStatus(true);
      setStatusError("");

      const updatedStudent = await activateStudent(student.id);

      setStudent(updatedStudent);
    } catch {
      setStatusError("Failed to activate student.");
    } finally {
      setIsTogglingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Student Details</h1>
            <p className={styles.subtitle}>
              View student information.
            </p>
          </div>
        </header>

        <p className={styles.loading}>Loading student details...</p>
      </main>
    );
  }

  if (error || !student) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Student Details</h1>
            <p className={styles.subtitle}>
              View student information.
            </p>
          </div>
        </header>

        <p className={styles.error}>
          {error || "Student not found."}
        </p>

        <Link
          to="/directory/students"
          className={styles.backLink}
        >
          ← Back to Students
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {student.firstName} {student.lastName}
          </h1>

          <p className={styles.subtitle}>
            Student details and record management.
          </p>
        </div>

        {!isEditing && (
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.editButton}
              onClick={handleEdit}
              disabled={isTogglingStatus}
            >
              Edit Student
            </button>

            {student.isActive ? (
              <button
                type="button"
                className={styles.deactivateButton}
                onClick={handleDeactivate}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus
                  ? "Deactivating..."
                  : "Deactivate Student"}
              </button>
            ) : (
              <button
                type="button"
                className={styles.activateButton}
                onClick={handleActivate}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus
                  ? "Activating..."
                  : "Activate Student"}
              </button>
            )}
          </div>
        )}
      </header>

      {statusError && (
        <p className={styles.error}>{statusError}</p>
      )}

      {isEditing ? (
        <section className={styles.card}>
          <h2>Edit Student</h2>

          <form onSubmit={handleUpdateStudent}>
            <div className={styles.detailsGrid}>
              <div className={styles.formField}>
                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="dateOfBirth">
                  Date of Birth
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            {updateError && (
              <p className={styles.formError}>
                {updateError}
              </p>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={isUpdating}
              >
                {isUpdating
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className={styles.card}>
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>
                ID
              </span>

              <span className={styles.value}>
                {student.id}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Status
              </span>

              <span
                className={
                  student.isActive
                    ? styles.activeStatus
                    : styles.inactiveStatus
                }
              >
                {student.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                First Name
              </span>

              <span className={styles.value}>
                {student.firstName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Last Name
              </span>

              <span className={styles.value}>
                {student.lastName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Date of Birth
              </span>

              <span className={styles.value}>
                {new Date(
                  student.dateOfBirth
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>
      )}

      <Link
        to="/directory/students"
        className={styles.backLink}
      >
        ← Back to Students
      </Link>
    </main>
  );
}