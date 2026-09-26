import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createParent,
  getParents,
} from "../api/parentsApi";
import { getStudents } from "../api/studentsApi";
import type { Student } from "../types/student";
import type {
  Parent,
  CreateParentRequest,
} from "../types/parent";
import styles from "./ParentsPage.module.css";

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] =
    useState<CreateParentRequest>({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      relationship: "",
      studentId: 0,
    });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadParents() {
      try {
        setLoading(true);
        setError("");

        const data = await getParents(
          includeInactive,
          debouncedSearch
        );

        if (!cancelled) {
          setParents(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load parents."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadParents();

    return () => {
      cancelled = true;
    };
  }, [includeInactive, debouncedSearch]);

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
          : value,
    }));
  }

  function resetForm() {
    setFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      relationship: "",
      studentId: 0,
    });

    setFormError("");
  }

  function handleCancelForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleCreateParent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      const createdParent =
        await createParent(formData);

      setParents((current) => [
        createdParent,
        ...current,
      ]);

      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create parent."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Parents</h1>

          <p className={styles.subtitle}>
            Manage parent records and their linked
            students.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          Add Parent
        </button>
      </header>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Add Parent</h2>

              <p>
                Enter the parent information and link
                them to a student.
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

          <form onSubmit={handleCreateParent}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="phoneNumber">
                  Phone Number
                </label>

                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="relationship">
                  Relationship
                </label>

                <input
                  id="relationship"
                  name="relationship"
                  type="text"
                  placeholder="e.g. Mother, Father, Guardian"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="studentId">
                  Linked Student
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
                      {student.lastName} — ID{" "}
                      {student.id}
                    </option>
                  ))}
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
                  ? "Creating..."
                  : "Create Parent"}
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
            placeholder="Search by first or last name..."
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
            Active Parents
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
            All Parents
          </button>
        </div>
      </div>

      {loading && (
        <p className={styles.loading}>
          Loading parents...
        </p>
      )}

      {!loading && error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

     {!loading &&
  !error &&
  parents.length === 0 && (
    <p className={styles.empty}>
      No parents found.
    </p>
  )}

      {!loading &&
        !error &&
        parents.length > 0 && (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Parent</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Relationship</th>
                    <th>Linked Student</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {parents.map((parent) => (
                    <tr key={parent.id}>
                      <td>{parent.id}</td>

                      <td>
                        {parent.firstName}{" "}
                        {parent.lastName}
                      </td>

                      <td>
                        {parent.phoneNumber}
                      </td>

                      <td>
                        {parent.email}
                      </td>

                      <td>
                        {parent.relationship}
                      </td>

                      <td>
                        {parent.student
                          ? `${parent.student.firstName} ${parent.student.lastName}`
                          : "Not available"}
                      </td>

                      <td>
                        <span
                          className={
                            parent.isActive
                              ? styles.activeStatus
                              : styles.inactiveStatus
                          }
                        >
                          {parent.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/directory/parents/${parent.id}`}
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
          </div>
        )}
    </main>
  );
}