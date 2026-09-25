import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();

  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lifecycleLoading, setLifecycleLoading] =
    useState(false);

  const [formError, setFormError] = useState("");
  const [lifecycleError, setLifecycleError] =
    useState("");

  const [formData, setFormData] =
    useState<UpdateParentRequest>({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      relationship: "",
    });

  useEffect(() => {
    let cancelled = false;

    async function loadParent() {
      if (!id) {
        setError("Parent ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getParentById(Number(id));

        if (!cancelled) {
          setParent(data);

          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            relationship: data.relationship,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load parent."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadParent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEdit() {
    if (!parent) return;
    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      phoneNumber: parent.phoneNumber,
      email: parent.email,
      relationship: parent.relationship,
    });
    setFormError("");
    setLifecycleError("");
    setEditing(true);
  }

  function handleCancelEdit() {
    if (!parent) return;
    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      phoneNumber: parent.phoneNumber,
      email: parent.email,
      relationship: parent.relationship,
    });
    setFormError("");
    setLifecycleError("");
    setEditing(false);
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!parent) return;
    try {
      setSaving(true);
      setFormError("");
      const updatedParent = await updateParent(parent.id, formData);
      setParent(updatedParent);
      setEditing(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update parent."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!parent) return;
    try {
      setLifecycleLoading(true);
      setLifecycleError("");
      await deactivateParent(parent.id);
      const refreshedParent = await getParentById(parent.id);
      setParent(refreshedParent);
    } catch (err) {
      setLifecycleError(
        err instanceof Error ? err.message : "Failed to deactivate parent."
      );
    } finally {
      setLifecycleLoading(false);
    }
  }

  async function handleActivate() {
    if (!parent) return;
    try {
      setLifecycleLoading(true);
      setLifecycleError("");
      await activateParent(parent.id);
      const refreshedParent = await getParentById(parent.id);
      setParent(refreshedParent);
    } catch (err) {
      setLifecycleError(
        err instanceof Error ? err.message : "Failed to activate parent."
      );
    } finally {
      setLifecycleLoading(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Parent Details</h1>
            <p className={styles.subtitle}>Loading parent information...</p>
          </div>
        </header>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Parent Details</h1>
            <p className={styles.subtitle}>Unable to load the parent.</p>
          </div>
        </header>
        <p className={styles.error}>{error}</p>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate("/directory/parents")}
        >
          Back to Parents
        </button>
      </main>
    );
  }

  if (!parent) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Parent Details</h1>
            <p className={styles.subtitle}>The requested parent could not be found.</p>
          </div>
        </header>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => navigate("/directory/parents")}
        >
          Back to Parents
        </button>
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
            Parent details and linked student information.
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
              Edit Parent
            </button>

            {parent.isActive ? (
              <button
                type="button"
                className={styles.deactivateButton}
                onClick={handleDeactivate}
                disabled={lifecycleLoading}
              >
                {lifecycleLoading ? "Deactivating..." : "Deactivate Parent"}
              </button>
            ) : (
              <button
                type="button"
                className={styles.activateButton}
                onClick={handleActivate}
                disabled={lifecycleLoading}
              >
                {lifecycleLoading ? "Activating..." : "Activate Parent"}
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
                <span className={styles.label}>ID</span>
                <span className={styles.value}>{parent.id}</span>
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
                  {parent.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className={styles.formField}>
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" type="text"
                  value={formData.firstName} onChange={handleInputChange} required />
              </div>

              <div className={styles.formField}>
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" type="text"
                  value={formData.lastName} onChange={handleInputChange} required />
              </div>

              <div className={styles.formField}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input id="phoneNumber" name="phoneNumber" type="tel"
                  value={formData.phoneNumber} onChange={handleInputChange} required />
              </div>

              <div className={styles.formField}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email"
                  value={formData.email} onChange={handleInputChange} required />
              </div>

              <div className={styles.formField}>
                <label htmlFor="relationship">Relationship</label>
                <input id="relationship" name="relationship" type="text"
                  value={formData.relationship} onChange={handleInputChange} required />
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>Linked Student</span>
                <span className={styles.value}>
                  {parent.student
                    ? `${parent.student.firstName} ${parent.student.lastName}`
                    : "Not available"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>Student ID</span>
                <span className={styles.value}>{parent.studentId}</span>
              </div>
            </div>

            {formError && (
              <p className={styles.error}>{formError}</p>
            )}

            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryButton}
                onClick={handleCancelEdit} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.label}>ID</span>
              <span className={styles.value}>{parent.id}</span>
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
                {parent.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>First Name</span>
              <span className={styles.value}>{parent.firstName}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Last Name</span>
              <span className={styles.value}>{parent.lastName}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Phone Number</span>
              <span className={styles.value}>{parent.phoneNumber}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{parent.email}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Relationship</span>
              <span className={styles.value}>{parent.relationship}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Linked Student</span>
              <span className={styles.value}>
                {parent.student
                  ? `${parent.student.firstName} ${parent.student.lastName}`
                  : "Not available"}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Student ID</span>
              <span className={styles.value}>{parent.studentId}</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}