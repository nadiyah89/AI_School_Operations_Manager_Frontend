import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createStudent,
  getStudents,
} from "../api/studentsApi";
import type { Student } from "../types/student";
import styles from "./StudentsPage.module.css";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getStudents(
          includeInactive,
          search
        );

        if (isCurrentRequest) {
          setStudents(data);
        }
      } catch {
        if (isCurrentRequest) {
          setError("Failed to load students.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timer);
    };
  }, [search, includeInactive]);

  async function handleCreateStudent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsCreating(true);
      setCreateError("");

      await createStudent({
        firstName,
        lastName,
        dateOfBirth,
      });

      const updatedStudents = await getStudents(
        includeInactive,
        search
      );

      setStudents(updatedStudents);

      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setShowCreateForm(false);
    } catch {
      setCreateError("Failed to create student.");
    } finally {
      setIsCreating(false);
    }
  }

  function closeCreateForm() {
    if (isCreating) return;

    setShowCreateForm(false);
    setCreateError("");
  }

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Students</h1>
            <p className={styles.subtitle}>
              Manage and view student records.
            </p>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={() => setShowCreateForm(true)}
          >
            Add Student
          </button>
        </header>

        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>
            Manage and view student records.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowCreateForm(true)}
        >
          Add Student
        </button>
      </header>

      {showCreateForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Add Student</h2>
              <p>Enter the student's information.</p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={closeCreateForm}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateStudent}>
            <div className={styles.formGrid}>
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
                />
              </div>
            </div>

            {createError && (
              <p className={styles.error}>{createError}</p>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeCreateForm}
                disabled={isCreating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={isCreating}
              >
                {isCreating
                  ? "Creating..."
                  : "Create Student"}
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
            placeholder="Search students..."
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
            onClick={() => setIncludeInactive(false)}
          >
            Active Students
          </button>

          <button
            type="button"
            className={
              includeInactive
                ? styles.activeFilter
                : styles.filterButton
            }
            onClick={() => setIncludeInactive(true)}
          >
            All Students
          </button>
        </div>
      </div>

      {isLoading && (
        <p className={styles.loading}>
          Loading students...
        </p>
      )}

      {!isLoading && students.length === 0 && (
        <p className={styles.empty}>
          No students found.
        </p>
      )}

      {!isLoading && students.length > 0 && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Date of Birth</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>

                  <td>{student.firstName}</td>

                  <td>{student.lastName}</td>

                  <td>
                    {new Date(
                      student.dateOfBirth
                    ).toLocaleDateString()}
                  </td>

                  <td>
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
                  </td>

                  <td>
                    <Link
                      to={`/directory/students/${student.id}`}
                      className={styles.viewButton}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}