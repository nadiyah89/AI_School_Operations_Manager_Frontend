import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  approveAdmission,
  createParentFromAdmission,
  createStudentFromAdmission,
  getAdmissionById,
  rejectAdmission,
  updateAdmission,
  waitlistAdmission,
} from "../api/admissionsApi";
import type {
  AdmissionApplication,
  CreateAdmissionDto,
  CreateParentFromAdmissionDto,
} from "../types/admission";
import styles from "./AdmissionDetailsPage.module.css";

const emptyParentForm: CreateParentFromAdmissionDto = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  relationship: "",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString();
}

function getStatusClass(status: AdmissionApplication["status"]) {
  switch (status) {
    case "Approved":
      return styles.statusApproved;
    case "Rejected":
      return styles.statusRejected;
    case "Waitlisted":
      return styles.statusWaitlisted;
    default:
      return styles.statusPending;
  }
}

export default function AdmissionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [admission, setAdmission] =
    useState<AdmissionApplication | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processing, setProcessing] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] =
    useState<CreateAdmissionDto | null>(null);
  const [saving, setSaving] = useState(false);

  const [showParentForm, setShowParentForm] = useState(false);
  const [parentForm, setParentForm] =
    useState<CreateParentFromAdmissionDto>(emptyParentForm);
  const [creatingParent, setCreatingParent] = useState(false);
  const [parentError, setParentError] = useState("");

  async function loadAdmission() {
    if (!id) {
      setError("Invalid admission ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAdmissionById(Number(id));
      setAdmission(data);

      setEditForm({
        applicantFirstName: data.applicantFirstName,
        applicantLastName: data.applicantLastName,
        dateOfBirth: data.dateOfBirth.split("T")[0],
        applyingForClass: data.applyingForClass,
        parentName: data.parentName,
        parentPhoneNumber: data.parentPhoneNumber,
        parentEmail: data.parentEmail,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load admission application."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmission();
  }, [id]);

  async function handleStatusAction(
    action: "approve" | "reject" | "waitlist"
  ) {
    if (!admission) return;

    try {
      setProcessing(true);
      setActionError("");

      let updated: AdmissionApplication;

      if (action === "approve") {
        updated = await approveAdmission(admission.id);
      } else if (action === "reject") {
        updated = await rejectAdmission(admission.id);
      } else {
        updated = await waitlistAdmission(admission.id);
      }

      setAdmission(updated);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update admission status."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!admission || !editForm) return;

    try {
      setSaving(true);
      setActionError("");

      const updated = await updateAdmission(admission.id, {
        ...editForm,
        dateOfBirth: `${editForm.dateOfBirth}T00:00:00`,
      });

      setAdmission(updated);
      setEditing(false);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update admission application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateStudent() {
    if (!admission) return;

    try {
      setProcessing(true);
      setActionError("");

      await createStudentFromAdmission(admission.id);
      await loadAdmission();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to create student."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleCreateParent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!admission) return;

    try {
      setCreatingParent(true);
      setParentError("");

      await createParentFromAdmission(admission.id, parentForm);

      setParentForm(emptyParentForm);
      setShowParentForm(false);

      await loadAdmission();
    } catch (err) {
      setParentError(
        err instanceof Error
          ? err.message
          : "Failed to create parent."
      );
    } finally {
      setCreatingParent(false);
    }
  }

  function updateEditField(
    field: keyof CreateAdmissionDto,
    value: string
  ) {
    setEditForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>Loading admission...</p>
      </div>
    );
  }

  if (error || !admission) {
    return (
      <div className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/administration/admissions")}
        >
          ← Back to Admissions
        </button>

        <p className={styles.error}>
          {error || "Admission application not found."}
        </p>
      </div>
    );
  }

  const canEdit = admission.status === "Pending";

  const canCreateStudent =
    admission.status === "Approved" &&
    admission.studentId === null;

  const canCreateParent =
    admission.status === "Approved" &&
    admission.studentId !== null &&
    admission.parentId === null;

  return (
    <div className={styles.page}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/administration/admissions")}
      >
        ← Back to Admissions
      </button>

      <div className={styles.header}>
        <div>
          <h1>
            {admission.applicantFirstName}{" "}
            {admission.applicantLastName}
          </h1>
          <p>Admission application #{admission.id}</p>
        </div>

        <span
          className={`${styles.status} ${getStatusClass(
            admission.status
          )}`}
        >
          {admission.status}
        </span>
      </div>

      {actionError && (
        <div className={styles.errorBox}>{actionError}</div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Application Information</h2>

          {canEdit && !editing && (
            <button
              className={styles.secondaryButton}
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <div className={styles.infoGrid}>
            <div>
              <span>Applicant Name</span>
              <strong>
                {admission.applicantFirstName}{" "}
                {admission.applicantLastName}
              </strong>
            </div>

            <div>
              <span>Date of Birth</span>
              <strong>{formatDate(admission.dateOfBirth)}</strong>
            </div>

            <div>
              <span>Applying for Class</span>
              <strong>{admission.applyingForClass}</strong>
            </div>

            <div>
              <span>Application Date</span>
              <strong>
                {formatDateTime(admission.applicationDate)}
              </strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name</label>
                <input
                  required
                  value={editForm?.applicantFirstName ?? ""}
                  onChange={(event) =>
                    updateEditField(
                      "applicantFirstName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input
                  required
                  value={editForm?.applicantLastName ?? ""}
                  onChange={(event) =>
                    updateEditField(
                      "applicantLastName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  required
                  type="date"
                  value={editForm?.dateOfBirth ?? ""}
                  onChange={(event) =>
                    updateEditField(
                      "dateOfBirth",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Applying for Class</label>
                <input
                  required
                  value={editForm?.applyingForClass ?? ""}
                  onChange={(event) =>
                    updateEditField(
                      "applyingForClass",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className={styles.card}>
        <h2>Parent Information</h2>

        {!editing ? (
          <div className={styles.infoGrid}>
            <div>
              <span>Parent Name</span>
              <strong>{admission.parentName}</strong>
            </div>

            <div>
              <span>Phone Number</span>
              <strong>{admission.parentPhoneNumber}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{admission.parentEmail}</strong>
            </div>
          </div>
        ) : (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Parent Name</label>
              <input
                required
                value={editForm?.parentName ?? ""}
                onChange={(event) =>
                  updateEditField(
                    "parentName",
                    event.target.value
                  )
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input
                required
                value={editForm?.parentPhoneNumber ?? ""}
                onChange={(event) =>
                  updateEditField(
                    "parentPhoneNumber",
                    event.target.value
                  )
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                required
                type="email"
                value={editForm?.parentEmail ?? ""}
                onChange={(event) =>
                  updateEditField(
                    "parentEmail",
                    event.target.value
                  )
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2>Application Actions</h2>

        {admission.status === "Pending" && (
          <div className={styles.actionRow}>
            <button
              className={styles.approveButton}
              disabled={processing}
              onClick={() => handleStatusAction("approve")}
            >
              Approve
            </button>

            <button
              className={styles.waitlistButton}
              disabled={processing}
              onClick={() => handleStatusAction("waitlist")}
            >
              Waitlist
            </button>

            <button
              className={styles.rejectButton}
              disabled={processing}
              onClick={() => handleStatusAction("reject")}
            >
              Reject
            </button>
          </div>
        )}

        {admission.status === "Waitlisted" && (
          <div className={styles.actionRow}>
            <button
              className={styles.approveButton}
              disabled={processing}
              onClick={() => handleStatusAction("approve")}
            >
              Approve
            </button>

            <button
              className={styles.rejectButton}
              disabled={processing}
              onClick={() => handleStatusAction("reject")}
            >
              Reject
            </button>
          </div>
        )}

        {admission.status === "Approved" && (
          <div className={styles.provisionGrid}>
            <div className={styles.provisionCard}>
              <div>
                <h3>Student Record</h3>

                {admission.studentId ? (
                  <p>
                    Student created: #{admission.studentId}
                  </p>
                ) : (
                  <p>
                    No student record has been created yet.
                  </p>
                )}
              </div>

              {canCreateStudent && (
                <button
                  className={styles.primaryButton}
                  disabled={processing}
                  onClick={handleCreateStudent}
                >
                  Create Student
                </button>
              )}
            </div>

            <div className={styles.provisionCard}>
              <div>
                <h3>Parent Record</h3>

                {admission.parentId ? (
                  <p>
                    Parent created: #{admission.parentId}
                  </p>
                ) : admission.studentId ? (
                  <p>
                    Student exists. Parent can now be created.
                  </p>
                ) : (
                  <p>
                    Create the student before creating the parent.
                  </p>
                )}
              </div>

              {canCreateParent && (
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    setParentForm(emptyParentForm);
                    setParentError("");
                    setShowParentForm(true);
                  }}
                >
                  Create Parent
                </button>
              )}
            </div>
          </div>
        )}

        {admission.status === "Rejected" && (
          <p className={styles.message}>
            This application has been rejected. No further
            workflow actions are available.
          </p>
        )}
      </div>

      {showParentForm && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowParentForm(false);
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Create Parent</h2>
                <p>
                  Create the parent record for this approved
                  admission.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setShowParentForm(false)}
              >
                ×
              </button>
            </div>

            {parentError && (
              <div className={styles.errorBox}>
                {parentError}
              </div>
            )}

            <form onSubmit={handleCreateParent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    required
                    value={parentForm.firstName}
                    onChange={(event) =>
                      setParentForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    required
                    value={parentForm.lastName}
                    onChange={(event) =>
                      setParentForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    required
                    value={parentForm.phoneNumber}
                    onChange={(event) =>
                      setParentForm((current) => ({
                        ...current,
                        phoneNumber: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    required
                    type="email"
                    value={parentForm.email}
                    onChange={(event) =>
                      setParentForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Relationship</label>
                  <input
                    required
                    value={parentForm.relationship}
                    onChange={(event) =>
                      setParentForm((current) => ({
                        ...current,
                        relationship: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowParentForm(false)}
                  disabled={creatingParent}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={creatingParent}
                >
                  {creatingParent
                    ? "Creating..."
                    : "Create Parent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}