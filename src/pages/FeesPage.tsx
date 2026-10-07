import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createFeeRecord,
  getFeeRecords,
  getFeeSummary,
} from "../api/feesApi";
import type {
  CreateFeeRecordDto,
  FeeRecord,
  FeeSummary,
} from "../types/fee";
import styles from "./FeesPage.module.css";

type StatusFilter = "All" | "Pending" | "Partially Paid" | "Paid";
type RecordFilter = "Active" | "All";

const initialForm: CreateFeeRecordDto = {
  studentId: 0,
  feeType: "",
  amount: 0,
  dueDate: "",
  paidAmount: 0,
  paymentDate: null,
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusClass(status: FeeRecord["status"]) {
  switch (status) {
    case "Paid":
      return styles.statusPaid;
    case "Partially Paid":
      return styles.statusPartial;
    default:
      return styles.statusPending;
  }
}

function isOverdue(fee: FeeRecord) {
  return (
    fee.isActive &&
    fee.paidAmount < fee.amount &&
    new Date(fee.dueDate).getTime() < Date.now()
  );
}

export default function FeesPage() {
  const navigate = useNavigate();

  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);

  const [recordFilter, setRecordFilter] =
    useState<RecordFilter>("Active");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] =
    useState<CreateFeeRecordDto>(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadFees() {
    try {
      setLoading(true);
      setError("");

      const [records, summaryData] = await Promise.all([
        getFeeRecords(recordFilter === "All"),
        getFeeSummary(),
      ]);

      const sorted = [...records].sort(
        (a, b) =>
          new Date(b.dueDate).getTime() -
          new Date(a.dueDate).getTime()
      );

      setFees(sorted);
      setSummary(summaryData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load fee records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFees();
  }, [recordFilter]);

  const filteredFees = useMemo(() => {
    const value = search.trim().toLowerCase();

    return fees.filter((fee) => {
      const studentName = fee.student
        ? `${fee.student.firstName} ${fee.student.lastName}`
        : "";

      const matchesSearch =
        !value ||
        fee.id.toString().includes(value) ||
        fee.studentId.toString().includes(value) ||
        studentName.toLowerCase().includes(value) ||
        fee.feeType.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        fee.status === statusFilter;

      const matchesOverdue =
        !overdueOnly || isOverdue(fee);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesOverdue
      );
    });
  }, [fees, search, statusFilter, overdueOnly]);

  function updateForm(
    field: keyof CreateFeeRecordDto,
    value: string | number | null
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");

      if (form.studentId <= 0) {
        throw new Error("Please enter a valid student ID.");
      }

      if (form.amount <= 0) {
        throw new Error(
          "Fee amount must be greater than zero."
        );
      }

      if (form.paidAmount < 0) {
        throw new Error(
          "Paid amount cannot be negative."
        );
      }

      if (form.paidAmount > form.amount) {
        throw new Error(
          "Paid amount cannot be greater than the fee amount."
        );
      }

      await createFeeRecord({
        ...form,
        dueDate: `${form.dueDate}T00:00:00`,
        paymentDate: form.paymentDate
          ? `${form.paymentDate}T00:00:00`
          : null,
      });

      setForm(initialForm);
      setShowForm(false);

      await loadFees();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create fee record."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Fees</h1>
          <p>Manage student fee records and payments.</p>
        </div>

        <button
          className={styles.primaryButton}
          onClick={() => {
            setForm(initialForm);
            setFormError("");
            setShowForm(true);
          }}
        >
          Record Fee
        </button>
      </div>

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Total Records</span>
            <strong>{summary.totalFeeRecords}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Total Amount</span>
            <strong>
              {formatAmount(summary.totalFeeAmount)}
            </strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Total Paid</span>
            <strong>
              {formatAmount(summary.totalPaidAmount)}
            </strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Outstanding</span>
            <strong>
              {formatAmount(summary.totalOutstandingAmount)}
            </strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Overdue</span>
            <strong>{summary.overdueFeeRecords}</strong>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search student, fee type, ID..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={recordFilter}
            onChange={(event) =>
              setRecordFilter(
                event.target.value as RecordFilter
              )
            }
          >
            <option value="Active">Active Fees</option>
            <option value="All">All Fees</option>
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as StatusFilter
              )
            }
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">
              Partially Paid
            </option>
            <option value="Paid">Paid</option>
          </select>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(event) =>
                setOverdueOnly(event.target.checked)
              }
            />
            Overdue only
          </label>
        </div>
      </div>

      {loading && (
        <p className={styles.message}>
          Loading fee records...
        </p>
      )}

      {!loading && error && (
        <p className={styles.error}>{error}</p>
      )}

      {!loading &&
        !error &&
        filteredFees.length === 0 && (
          <p className={styles.message}>
            No fee records found.
          </p>
        )}

      {!loading &&
        !error &&
        filteredFees.length > 0 && (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Fee Type</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Record Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFees.map((fee) => {
                    const outstanding =
                      fee.amount - fee.paidAmount;

                    return (
                      <tr key={fee.id}>
                        <td>#{fee.id}</td>

                        <td>
                          <strong>
                            {fee.student
                              ? `${fee.student.firstName} ${fee.student.lastName}`
                              : `Student #${fee.studentId}`}
                          </strong>
                        </td>

                        <td>{fee.feeType}</td>

                        <td>{formatAmount(fee.amount)}</td>

                        <td>
                          {formatAmount(fee.paidAmount)}
                        </td>

                        <td>
                          <strong>
                            {formatAmount(outstanding)}
                          </strong>
                        </td>

                        <td>
                          {formatDate(fee.dueDate)}
                          {isOverdue(fee) && (
                            <span
                              className={styles.overdueLabel}
                            >
                              Overdue
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`${styles.status} ${getStatusClass(
                              fee.status
                            )}`}
                          >
                            {fee.status}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              fee.isActive
                                ? styles.active
                                : styles.inactive
                            }
                          >
                            {fee.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <button
                            className={styles.viewButton}
                            onClick={() =>
                              navigate(
                                `/administration/fees/${fee.id}`
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                <h2>Record Fee</h2>
                <p>
                  Add a fee record for a student.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            {formError && (
              <div className={styles.formError}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Student ID</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={
                      form.studentId === 0
                        ? ""
                        : form.studentId
                    }
                    onChange={(event) =>
                      updateForm(
                        "studentId",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fee Type</label>
                  <input
                    required
                    placeholder="e.g. Tuition"
                    value={form.feeType}
                    onChange={(event) =>
                      updateForm(
                        "feeType",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Amount</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      form.amount === 0
                        ? ""
                        : form.amount
                    }
                    onChange={(event) =>
                      updateForm(
                        "amount",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm(
                        "dueDate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Paid Amount</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.paidAmount === 0
                        ? 0
                        : form.paidAmount
                    }
                    onChange={(event) =>
                      updateForm(
                        "paidAmount",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={form.paymentDate ?? ""}
                    onChange={(event) =>
                      updateForm(
                        "paymentDate",
                        event.target.value || null
                      )
                    }
                  />
                </div>
              </div>

              <div className={styles.formNote}>
                Status is calculated automatically from the
                amount paid.
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
                  {submitting
                    ? "Saving..."
                    : "Record Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}