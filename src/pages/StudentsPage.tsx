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

      const data = await getStudents(includeInactive, search);

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

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>
            Manage and view student records.
          </p>
        </header>

        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
  <h1 className={styles.title}>Students</h1>
  <p className={styles.subtitle}>
    Manage and view student records.
  </p>
</header>

<div className={styles.toolbar}>
  <div className={styles.searchContainer}>
    <input
      className={styles.searchInput}
      type="search"
      placeholder="Search students..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />
  </div>

  <div className={styles.filterGroup}>
    <button
      type="button"
      className={
        !includeInactive
          ? styles.filterButtonActive
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
          ? styles.filterButtonActive
          : styles.filterButton
      }
      onClick={() => setIncludeInactive(true)}
    >
      All Students
    </button>
  </div>

<button
  type="button"
  onClick={() => setShowCreateForm(!showCreateForm)}
>
  {showCreateForm ? "Cancel" : "Add Student"}
</button>

</div>

{showCreateForm && (
  
    <form
  className={styles.formCard}
  onSubmit={handleCreateStudent}
>
    <h2 className={styles.formTitle}>Add Student</h2>

    {createError && <p>{createError}</p>}

    <div className={styles.formGrid}>
      <div className={styles.formField}>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
        />
      </div>
    </div>

    <button type="submit" disabled={isCreating}>
  {isCreating ? "Creating..." : "Create Student"}
</button>

  </form>
)}

{isLoading && <p>Loading students...</p>}

      {students.length === 0 ? (
        <div className={styles.emptyState}>
          No students found.
        </div>
      ) : (
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
    {new Date(student.dateOfBirth).toLocaleDateString()}
  </td>

  <td>
    <span className={styles.status}>
      {student.isActive ? "Active" : "Inactive"}
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