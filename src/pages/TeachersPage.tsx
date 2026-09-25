import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeachers, createTeacher } from "../api/teachersApi";
import type { Teacher } from "../types/teacher";
import styles from "./TeachersPage.module.css";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getTeachers(
          includeInactive,
          search
        );

        if (isCurrentRequest) {
          setTeachers(data);
        }
      } catch {
        if (isCurrentRequest) {
          setError("Failed to load teachers.");
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

  function openAddTeacher() {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEmail("");
    setCreateError("");
    setIsAdding(true);
  }

  function closeAddTeacher() {
    if (isCreating) return;

    setIsAdding(false);
    setCreateError("");
  }

  async function handleCreateTeacher(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsCreating(true);
      setCreateError("");

      const newTeacher = await createTeacher({
        firstName,
        lastName,
        phoneNumber,
        email,
      });

      setTeachers((currentTeachers) => [
        newTeacher,
        ...currentTeachers,
      ]);

      setIsAdding(false);
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
    } catch {
      setCreateError("Failed to create teacher.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
  <h1 className={styles.title}>Teachers</h1>
  <p className={styles.subtitle}>
    Manage teacher records and information.
  </p>
</div>

        <button
          type="button"
          className={styles.addButton}
          onClick={openAddTeacher}
        >
          Add Teacher
        </button>
      </header>

      {isAdding && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Add Teacher</h2>
              <p>Enter the teacher's information.</p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={closeAddTeacher}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateTeacher}>
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
                <label htmlFor="phoneNumber">
                  Phone Number
                </label>

                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value)
                  }
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
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
                onClick={closeAddTeacher}
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
                  : "Create Teacher"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
    <input
      type="search"
      placeholder="Search by first or last name..."
      value={search}
      onChange={(event) =>
        setSearch(event.target.value)
      }
      className={styles.searchInput}
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
            Active Teachers
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
            All Teachers
          </button>
        </div>
      </div>

      {isLoading && (
        <p className={styles.loading}>
          Loading teachers...
        </p>
      )}

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      {!isLoading &&
        !error &&
        teachers.length === 0 && (
          <p className={styles.empty}>
            No teachers found.
          </p>
        )}

      {!isLoading &&
        !error &&
        teachers.length > 0 && (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>

                    <td>{teacher.firstName}</td>

                    <td>{teacher.lastName}</td>

                    <td>{teacher.phoneNumber}</td>

                    <td>{teacher.email}</td>

                    <td>
                      <span
                        className={
                          teacher.isActive
                            ? styles.activeStatus
                            : styles.inactiveStatus
                        }
                      >
                        {teacher.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/directory/teachers/${teacher.id}`}
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