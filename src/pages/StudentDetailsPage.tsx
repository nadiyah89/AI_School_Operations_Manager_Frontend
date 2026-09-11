import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      } catch {
        setError("Failed to load student.");
      } finally {
        setIsLoading(false);
      }
    }

    loadStudent();
  }, [id]);

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

  async function handleToggleStatus() {
    if (!student) {
      return;
    }

    try {
      setIsTogglingStatus(true);
      setStatusError("");

      const updatedStudent = student.isActive
        ? await deactivateStudent(student.id)
        : await activateStudent(student.id);

      setStudent(updatedStudent);
    } catch {
      setStatusError(
        student.isActive
          ? "Failed to deactivate student."
          : "Failed to activate student."
      );
    } finally {
      setIsTogglingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Student Details</h1>
          <p className={styles.subtitle}>
            View student information.
          </p>
        </header>

        <p>Loading student...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Student Details</h1>
          <p className={styles.subtitle}>
            View student information.
          </p>
        </header>

        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Student Details</h1>
          <p className={styles.subtitle}>
            View student information.
          </p>
        </header>

        <p>Student not found.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Details</h1>
          <p className={styles.subtitle}>
            View student information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setFirstName(student.firstName);
              setLastName(student.lastName);
              setDateOfBirth(
                student.dateOfBirth.slice(0, 10)
              );
              setUpdateError("");
              setIsEditing(true);
            }}
          >
            Edit Student
          </button>
        )}
      </header>

      {isEditing ? (
        <form
          className={styles.card}
          onSubmit={handleUpdateStudent}
        >
          <h2>Edit Student</h2>

          {updateError && (
            <p className={styles.error}>{updateError}</p>
          )}

          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <label
                className={styles.label}
                htmlFor="firstName"
              >
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

            <div className={styles.detail}>
              <label
                className={styles.label}
                htmlFor="lastName"
              >
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

            <div className={styles.detail}>
              <label
                className={styles.label}
                htmlFor="dateOfBirth"
              >
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

          <div>
            <button
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setUpdateError("");
              }}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <section className={styles.card}>
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>ID</span>
              <span className={styles.value}>
                {student.id}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Status</span>

              <span className={styles.status}>
                {student.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>First Name</span>

              <span className={styles.value}>
                {student.firstName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Last Name</span>

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

          {statusError && (
            <p className={styles.error}>{statusError}</p>
          )}

          <div>
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus
                ? "Updating..."
                : student.isActive
                  ? "Deactivate Student"
                  : "Activate Student"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}