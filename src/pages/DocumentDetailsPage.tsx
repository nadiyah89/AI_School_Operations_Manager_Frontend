import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getDocumentById,
  updateDocument,
} from "../api/documentsApi";
import type {
  Document,
  UpdateDocumentDto,
} from "../types/document";
import styles from "./DocumentDetailsPage.module.css";

function formatDateTime(date: string): string {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleString();
}

export default function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] =
    useState<Document | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [formData, setFormData] =
    useState<UpdateDocumentDto>({
      title: "",
      category: "",
      content: "",
    });

  const documentId = Number(id);

  useEffect(() => {
    async function loadDocument() {
      if (
        !Number.isInteger(documentId) ||
        documentId <= 0
      ) {
        setError("Invalid document ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getDocumentById(documentId);

        setDocument(data);

        setFormData({
          title: data.title,
          category: data.category,
          content: data.content,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load document."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [documentId]);

  function handleEdit() {
    if (!document) {
      return;
    }

    setFormData({
      title: document.title,
      category: document.category,
      content: document.content,
    });

    setEditError("");
    setIsEditing(true);
  }

  function handleCancel() {
    if (document) {
      setFormData({
        title: document.title,
        category: document.category,
        content: document.content,
      });
    }

    setEditError("");
    setIsEditing(false);
  }

  async function handleSave() {
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.content.trim()
    ) {
      setEditError(
        "Title, category, and content are required."
      );
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      const data: UpdateDocumentDto = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        content: formData.content.trim(),
      };

      const updatedDocument =
        await updateDocument(
          documentId,
          data
        );

      setDocument(updatedDocument);

      setFormData({
        title: updatedDocument.title,
        category: updatedDocument.category,
        content: updatedDocument.content,
      });

      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to update document."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>
          Loading document...
        </p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className={styles.page}>
        <Link
          to="/operations/documents"
          className={styles.backLink}
        >
          ← Back to Documents
        </Link>

        <p className={styles.error}>
          {error || "Document not found."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link
            to="/operations/documents"
            className={styles.backLink}
          >
            ← Back to Documents
          </Link>

          <h1 className={styles.title}>
            Document Details
          </h1>

          <p className={styles.subtitle}>
            View and manage institutional document
            information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className={styles.editButton}
            onClick={handleEdit}
          >
            Edit Document
          </button>
        )}
      </div>

      {isEditing ? (
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Edit Document</h2>

              <p>
                Update the document information and
                content.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="documentTitle">
                Title
              </label>

              <input
                id="documentTitle"
                type="text"
                value={formData.title}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="documentCategory">
                Category
              </label>

              <input
                id="documentCategory"
                type="text"
                value={formData.category}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    category:
                      event.target.value,
                  }))
                }
              />
            </div>

            <div
              className={`${styles.formField} ${styles.fullWidth}`}
            >
              <label htmlFor="documentContent">
                Content
              </label>

              <textarea
                id="documentContent"
                rows={16}
                value={formData.content}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    content:
                      event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {editError && (
            <p className={styles.formError}>
              {editError}
            </p>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Document Information
            </h2>

            <div className={styles.detailsGrid}>
              <div className={styles.detail}>
                <span className={styles.label}>
                  Document ID
                </span>

                <span className={styles.value}>
                  {document.id}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Title
                </span>

                <span className={styles.value}>
                  {document.title}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Category
                </span>

                <span
                  className={styles.categoryBadge}
                >
                  {document.category}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Record Status
                </span>

                <span
                  className={
                    document.isActive
                      ? styles.activeStatus
                      : styles.inactiveStatus
                  }
                >
                  {document.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Created At
                </span>

                <span className={styles.value}>
                  {formatDateTime(
                    document.createdAt
                  )}
                </span>
              </div>

              <div className={styles.detail}>
                <span className={styles.label}>
                  Last Updated
                </span>

                <span className={styles.value}>
                  {formatDateTime(
                    document.updatedAt
                  )}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              Document Content
            </h2>

            <div className={styles.contentBox}>
              {document.content}
            </div>
          </section>
        </>
      )}

      <div className={styles.bottomActions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() =>
            navigate("/operations/documents")
          }
        >
          Back to Documents
        </button>
      </div>
    </div>
  );
}