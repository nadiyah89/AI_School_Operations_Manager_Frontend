import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getParentById,
  updateParent,
  activateParent,
  deactivateParent,
} from "../api/parentsApi";
import type {
  Parent,
  UpdateParentRequest,
} from "../types/parent";
import styles from "./ParentDetailsPage.module.css";

export default function ParentDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [parent, setParent] = useState<Parent | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] =
    useState<UpdateParentRequest>({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      relationship: "",
    });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [isTogglingStatus, setIsTogglingStatus] =
    useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    async function loadParent() {
      if (!id) {
        setError("Parent ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await getParentById(Number(id));
        setParent(data);
      } catch {
        setError("Failed to load parent.");
      } finally {
        setIsLoading(false);
      }
    }

    loadParent();
  }, [id]);

  function handleEdit() {
    if (!parent) {
      return;
    }

    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      phoneNumber: parent.phoneNumber,
      email: parent.email,
      relationship: parent.relationship,
    });

    setUpdateError("");
    setStatusError("");
    setIsEditing(true);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleUpdateParent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!parent) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");

      const updatedParent = await updateParent(
        parent.id,
        formData
      );

      setParent(updatedParent);
      setIsEditing(false);
    } catch {
      setUpdateError("Failed to update parent.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeactivate() {
    if (!parent) {
      return;
    }

    try {
      setIsTogglingStatus(true);
      setStatusError("");

      const updatedParent = await deactivateParent(
        parent.id
      );

      setParent(updatedParent);
    } catch {
      setStatusError("Failed to deactivate parent.");
    } finally {
      setIsTogglingStatus(false);
    }
  }

  async function handleActivate() {
    if (!parent) {
      return;
    }

    try {
      setIsTogglingStatus(true);
      setStatusError("");

      const updatedParent = await activateParent(
        parent.id
      );

      setParent(updatedParent);
    } catch {
      setStatusError("Failed to activate parent.");
    } finally {
      setIsTogglingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Parent Details
            </h1>

            <p className={styles.subtitle}>
              View parent information.
            </p>
          </div>
        </header>

        <p className={styles.loading}>
          Loading parent...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Parent Details
            </h1>

            <p className={styles.subtitle}>
              View parent information.
            </p>
          </div>
        </header>

        <p className={styles.error}>{error}</p>

        <Link
          to="/directory/parents"
          className={styles.backLink}
        >
          ← Back to Parents
        </Link>
      </main>
    );
  }

  if (!parent) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Parent Details
            </h1>

            <p className={styles.subtitle}>
              View parent information.
            </p>
          </div>
        </header>

        <p>Parent not found.</p>

        <Link
          to="/directory/parents"
          className={styles.backLink}
        >
          ← Back to Parents
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {parent.firstName} {parent.lastName}
          </h1>

          <p className={styles.subtitle}>
            Parent details and record management.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEdit}
            disabled={isTogglingStatus}
          >
            Edit Parent
          </button>

          {parent.isActive ? (
            <button
              type="button"
              className={styles.deactivateButton}
              onClick={handleDeactivate}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus
                ? "Deactivating..."
                : "Deactivate Parent"}
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
                : "Activate Parent"}
            </button>
          )}
        </div>
      </header>

      {isEditing ? (
        <form
          className={styles.card}
          onSubmit={handleUpdateParent}
        >
          <h2>Edit Parent</h2>

          {updateError && (
            <p className={styles.formError}>
              {updateError}
            </p>
          )}

          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>ID</span>

              <span className={styles.value}>
                {parent.id}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Status</span>

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
            </div>

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
                value={formData.relationship}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Linked Student
              </span>

              <span className={styles.value}>
                {parent.student
                  ? `${parent.student.firstName} ${parent.student.lastName}`
                  : "Not available"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Student ID
              </span>

              <span className={styles.value}>
                {parent.studentId}
              </span>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setIsEditing(false);
                setUpdateError("");
              }}
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
      ) : (
        <section className={styles.card}>
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>ID</span>

              <span className={styles.value}>
                {parent.id}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Status</span>

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
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                First Name
              </span>

              <span className={styles.value}>
                {parent.firstName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Last Name
              </span>

              <span className={styles.value}>
                {parent.lastName}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Phone Number
              </span>

              <span className={styles.value}>
                {parent.phoneNumber}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Email
              </span>

              <span className={styles.value}>
                {parent.email}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Relationship
              </span>

              <span className={styles.value}>
                {parent.relationship}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Linked Student
              </span>

              <span className={styles.value}>
                {parent.student
                  ? `${parent.student.firstName} ${parent.student.lastName}`
                  : "Not available"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>
                Student ID
              </span>

              <span className={styles.value}>
                {parent.studentId}
              </span>
            </div>
          </div>

          {statusError && (
            <p className={styles.error}>
              {statusError}
            </p>
          )}
        </section>
      )}

      <Link
        to="/directory/parents"
        className={styles.backLink}
      >
        ← Back to Parents
      </Link>
    </main>
  );
}