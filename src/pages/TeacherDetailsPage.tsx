import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
  activateTeacher,
} from "../api/teachersApi";
import type { Teacher } from "../types/teacher";
import styles from "./TeacherDetailsPage.module.css";

export default function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    async function loadTeacher() {
      if (!id) {
        setError("Teacher ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await getTeacherById(Number(id));

        setTeacher(data);
      } catch {
        setError("Failed to load teacher.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTeacher();
  }, [id]);

  async function handleUpdateTeacher(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!teacher) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");

      const updatedTeacher = await updateTeacher(teacher.id, {
        firstName,
        lastName,
        phoneNumber,
        email,
      });

      setTeacher(updatedTeacher);
      setIsEditing(false);
    } catch {
      setUpdateError("Failed to update teacher.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleToggleStatus() {
    if (!teacher) {
      return;
    }

    try {
      setIsTogglingStatus(true);
      setStatusError("");

      const updatedTeacher = teacher.isActive
        ? await deactivateTeacher(teacher.id)
        : await activateTeacher(teacher.id);

      setTeacher(updatedTeacher);
    } catch {
      setStatusError(
        teacher.isActive
          ? "Failed to deactivate teacher."
          : "Failed to activate teacher."
      );
    } finally {
      setIsTogglingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Teacher Details</h1>
            <p className={styles.subtitle}>
              View teacher information.
            </p>
          </div>
        </header>

        <p>Loading teacher...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Teacher Details</h1>
            <p className={styles.subtitle}>
              View teacher information.
            </p>
          </div>
        </header>

        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  if (!teacher) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Teacher Details</h1>
            <p className={styles.subtitle}>
              View teacher information.
            </p>
          </div>
        </header>

        <p>Teacher not found.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Teacher Details</h1>
          <p className={styles.subtitle}>
            View teacher information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setFirstName(teacher.firstName);
              setLastName(teacher.lastName);
              setPhoneNumber(teacher.phoneNumber);
              setEmail(teacher.email);
              setUpdateError("");
              setIsEditing(true);
            }}
          >
            Edit Teacher
          </button>
        )}
      </header>

      {isEditing ? (
        <form
          className={styles.card}
          onSubmit={handleUpdateTeacher}
        >
          <h2>Edit Teacher</h2>

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
                htmlFor="phoneNumber"
              >
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

            <div className={styles.detail}>
              <label
                className={styles.label}
                htmlFor="email"
              >
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
                {teacher.id}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Status</span>
              <span className={styles.status}>
                {teacher.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                First Name
              </span>
              <span className={styles.value}>
                {teacher.firstName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Last Name
              </span>
              <span className={styles.value}>
                {teacher.lastName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Phone Number
              </span>
              <span className={styles.value}>
                {teacher.phoneNumber}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>
                {teacher.email}
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
                : teacher.isActive
                  ? "Deactivate Teacher"
                  : "Activate Teacher"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}