import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  activateFeeRecord,
  deactivateFeeRecord,
  getFeeRecordById,
  updateFeeRecord,
} from "../api/feesApi";
import type {
  FeeRecord,
  UpdateFeeRecordDto,
} from "../types/fee";
import styles from "./FeeDetailsPage.module.css";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function formatDateTime(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
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

export default function FeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fee, setFee] = useState<FeeRecord | null>(null);
  const [form, setForm] =
    useState<UpdateFeeRecordDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function loadFee() {
    if (!id) {
      setError("Invalid fee record ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getFeeRecordById(Number(id));

      setFee(data);

      setForm({
        feeType: data.feeType,
        amount: data.amount,
        dueDate: data.dueDate.split("T")[0],
        paidAmount: data.paidAmount,
        paymentDate: data.paymentDate
          ? data.paymentDate.split("T")[0]
          : null,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load fee record."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFee();
  }, [id]);

  function updateForm(
    field: keyof UpdateFeeRecordDto,
    value: string | number | null
  ) {
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!fee || !form) return;

    try {
      setSaving(true);
      setActionError("");

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

      const updated = await updateFeeRecord(fee.id, {
        ...form,
        dueDate: `${form.dueDate}T00:00:00`,
        paymentDate: form.paymentDate
          ? `${form.paymentDate}T00:00:00`
          : null,
      });

      setFee(updated);

      setForm({
        feeType: updated.feeType,
        amount: updated.amount,
        dueDate: updated.dueDate.split("T")[0],
        paidAmount: updated.paidAmount,
        paymentDate: updated.paymentDate
          ? updated.paymentDate.split("T")[0]
          : null,
      });

      setEditing(false);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update fee record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!fee) return;

    try {
      setProcessing(true);
      setActionError("");

      const updated = await deactivateFeeRecord(fee.id);
      setFee(updated);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate fee record."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleActivate() {
    if (!fee) return;

    try {
      setProcessing(true);
      setActionError("");

      const updated = await activateFeeRecord(fee.id);
      setFee(updated);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to activate fee record."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.message}>
          Loading fee record...
        </p>
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() =>
            navigate("/administration/fees")
          }
        >
          ← Back to Fees
        </button>

        <p className={styles.error}>
          {error || "Fee record not found."}
        </p>
      </div>
    );
  }

  const outstanding = fee.amount - fee.paidAmount;

  return (
    <div className={styles.page}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/administration/fees")}
      >
        ← Back to Fees
      </button>

      <div className={styles.header}>
        <div>
          <h1>Fee Record #{fee.id}</h1>
          <p>
            {fee.student
              ? `${fee.student.firstName} ${fee.student.lastName}`
              : `Student #${fee.studentId}`}
          </p>
        </div>

        <span
          className={`${styles.status} ${getStatusClass(
            fee.status
          )}`}
        >
          {fee.status}
        </span>
      </div>

      {actionError && (
        <div className={styles.errorBox}>
          {actionError}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Fee Information</h2>

          {!editing && (
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
              <span>Student</span>
              <strong>
                {fee.student
                  ? `${fee.student.firstName} ${fee.student.lastName}`
                  : `Student #${fee.studentId}`}
              </strong>
            </div>

            <div>
              <span>Fee Type</span>
              <strong>{fee.feeType}</strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>{formatAmount(fee.amount)}</strong>
            </div>

            <div>
              <span>Paid Amount</span>
              <strong>
                {formatAmount(fee.paidAmount)}
              </strong>
            </div>

            <div>
              <span>Outstanding Amount</span>
              <strong
                className={
                  outstanding > 0
                    ? styles.outstanding
                    : styles.paidAmount
                }
              >
                {formatAmount(outstanding)}
              </strong>
            </div>

            <div>
              <span>Due Date</span>
              <strong>{formatDate(fee.dueDate)}</strong>
            </div>

            <div>
              <span>Payment Date</span>
              <strong>
                {formatDateTime(fee.paymentDate)}
              </strong>
            </div>

            <div>
              <span>Record Status</span>
              <strong>
                {fee.isActive ? "Active" : "Inactive"}
              </strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Fee Type</label>
                <input
                  required
                  value={form?.feeType ?? ""}
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
                  value={form?.amount ?? ""}
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
                  value={form?.dueDate ?? ""}
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
                  value={form?.paidAmount ?? ""}
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
                  value={form?.paymentDate ?? ""}
                  onChange={(event) =>
                    updateForm(
                      "paymentDate",
                      event.target.value || null
                    )
                  }
                />
              </div>
            </div>

            <p className={styles.formNote}>
              Status is automatically recalculated by the
              backend from the paid amount.
            </p>

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
        <h2>Record Actions</h2>

        <div className={styles.actionRow}>
          {fee.isActive ? (
            <button
              className={styles.deactivateButton}
              onClick={handleDeactivate}
              disabled={processing}
            >
              {processing
                ? "Processing..."
                : "Deactivate Record"}
            </button>
          ) : (
            <button
              className={styles.activateButton}
              onClick={handleActivate}
              disabled={processing}
            >
              {processing
                ? "Processing..."
                : "Activate Record"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}