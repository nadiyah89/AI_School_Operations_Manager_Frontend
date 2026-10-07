import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdmission,
  getAdmissionSummary,
  getAdmissions,
} from "../api/admissionsApi";
import type {
  AdmissionApplication,
  AdmissionStatus,
  AdmissionSummary,
  CreateAdmissionDto,
} from "../types/admission";
import styles from "./AdmissionsPage.module.css";

type StatusFilter = "All" | AdmissionStatus;

const initialForm: CreateAdmissionDto = {
  applicantFirstName: "",
  applicantLastName: "",
  dateOfBirth: "",
  applyingForClass: "",
  parentName: "",
  parentPhoneNumber: "",
  parentEmail: "",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function getStatusClass(status: AdmissionStatus) {
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

export default function AdmissionsPage() {
  const navigate = useNavigate();

  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [summary, setSummary] = useState<AdmissionSummary | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAdmissionDto>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadAdmissions() {
    try {
      setLoading(true);
      setError("");

      const [applications, summaryData] = await Promise.all([
        getAdmissions(
          statusFilter === "All" ? undefined : statusFilter
        ),
        getAdmissionSummary(),
      ]);

      const sorted = [...applications].sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      );

      setAdmissions(sorted);
      setSummary(summaryData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load admissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmissions();
  }, [statusFilter]);

  const filteredAdmissions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return admissions;
    }

    return admissions.filter((admission) => {
      const applicantName =
        `${admission.applicantFirstName} ${admission.applicantLastName}`;

      return (
        applicantName.toLowerCase().includes(value) ||
        admission.parentName.toLowerCase().includes(value) ||
        admission.applyingForClass.toLowerCase().includes(value) ||
        admission.parentEmail.toLowerCase().includes(value) ||
        admission.parentPhoneNumber.includes(value) ||
        admission.id.toString().includes(value)
      );
    });
  }, [admissions, search]);

  function handleInputChange(
    field: keyof CreateAdmissionDto,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");

      await createAdmission({
        ...form,
        dateOfBirth: `${form.dateOfBirth}T00:00:00`,
      });

      setForm(initialForm);
      setShowForm(false);

      await loadAdmissions();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create admission application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Admissions</h1>
          <p>Manage student admission applications.</p>
        </div>

        <button
          className={styles.primaryButton}
          onClick={() => {
            setForm(initialForm);
            setFormError("");
            setShowForm(true);
          }}
        >
          New Application
        </button>
      </div>

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Total Applications</span>
            <strong>{summary.totalApplications}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Pending</span>
            <strong>{summary.pendingApplications}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Approved</span>
            <strong>{summary.approvedApplications}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Rejected</span>
            <strong>{summary.rejectedApplications}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Waitlisted</span>
            <strong>{summary.waitlistedApplications}</strong>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search applicant, parent, class, email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          className={styles.filterSelect}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading && <p className={styles.message}>Loading admissions...</p>}

      {!loading && error && (
        <p className={styles.error}>{error}</p>
      )}

      {!loading && !error && filteredAdmissions.length === 0 && (
        <p className={styles.message}>
          No admission applications found.
        </p>
      )}

      {!loading && !error && filteredAdmissions.length > 0 && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Class</th>
                  <th>Parent</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th>Student</th>
                  <th>Parent</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAdmissions.map((admission) => (
                  <tr key={admission.id}>
                    <td>#{admission.id}</td>

                    <td>
                      <strong>
                        {admission.applicantFirstName}{" "}
                        {admission.applicantLastName}
                      </strong>
                    </td>

                    <td>{admission.applyingForClass}</td>

                    <td>{admission.parentName}</td>

                    <td>
                      {formatDate(admission.applicationDate)}
                    </td>

                    <td>
                      <span
                        className={`${styles.status} ${getStatusClass(
                          admission.status
                        )}`}
                      >
                        {admission.status}
                      </span>
                    </td>

                    <td>
                      {admission.studentId ? (
                        <span className={styles.linked}>
                          #{admission.studentId}
                        </span>
                      ) : (
                        <span className={styles.notLinked}>—</span>
                      )}
                    </td>

                    <td>
                      {admission.parentId ? (
                        <span className={styles.linked}>
                          #{admission.parentId}
                        </span>
                      ) : (
                        <span className={styles.notLinked}>—</span>
                      )}
                    </td>

                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() =>
                          navigate(
                            `/administration/admissions/${admission.id}`
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>New Admission Application</h2>
                <p>Enter applicant and parent information.</p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            {formError && (
              <div className={styles.formError}>{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.sectionTitle}>
                Applicant Information
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    required
                    value={form.applicantFirstName}
                    onChange={(event) =>
                      handleInputChange(
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
                    value={form.applicantLastName}
                    onChange={(event) =>
                      handleInputChange(
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
                    value={form.dateOfBirth}
                    onChange={(event) =>
                      handleInputChange(
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
                    value={form.applyingForClass}
                    onChange={(event) =>
                      handleInputChange(
                        "applyingForClass",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className={styles.sectionTitle}>
                Parent Information
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Parent Name</label>
                  <input
                    required
                    value={form.parentName}
                    onChange={(event) =>
                      handleInputChange(
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
                    value={form.parentPhoneNumber}
                    onChange={(event) =>
                      handleInputChange(
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
                    value={form.parentEmail}
                    onChange={(event) =>
                      handleInputChange(
                        "parentEmail",
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
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}