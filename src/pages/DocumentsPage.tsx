import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createDocument,
  getDocuments,
} from "../api/documentsApi";
import type {
  CreateDocumentDto,
  Document,
} from "../types/document";
import styles from "./DocumentsPage.module.css";

function formatDate(date: string): string {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString();
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(
    []
  );

  const [includeInactive, setIncludeInactive] =
    useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] =
    useState<CreateDocumentDto>({
      title: "",
      category: "",
      content: "",
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError("");

        const data = await getDocuments(includeInactive);

        setDocuments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load documents."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [includeInactive]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      documents
        .map((document) => document.category)
        .filter(Boolean)
    );

    return Array.from(uniqueCategories).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.title
          .toLowerCase()
          .includes(query) ||
        document.category
          .toLowerCase()
          .includes(query) ||
        document.content
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        !categoryFilter ||
        document.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [
    documents,
    search,
    categoryFilter,
  ]);

  function handleOpenForm() {
    setFormData({
      title: "",
      category: "",
      content: "",
    });

    setFormError("");
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setFormError("");
  }

  async function handleCreateDocument() {
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.content.trim()
    ) {
      setFormError(
        "Title, category, and content are required."
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const data: CreateDocumentDto = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        content: formData.content.trim(),
      };

      const createdDocument =
        await createDocument(data);

      setDocuments((current) => [
        createdDocument,
        ...current,
      ]);

      handleCloseForm();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create document."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Documents</h1>

          <p className={styles.subtitle}>
            Manage school policies, academic information,
            and institutional documents.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={handleOpenForm}
        >
          Add Document
        </button>
      </div>

      {showForm && (
        <section className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Add Document</h2>

              <p>
                Create a new institutional document.
              </p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCloseForm}
              disabled={saving}
            >
              Close
            </button>
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
                placeholder="Enter document title"
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
                placeholder="e.g. Policy, Academic"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    category: event.target.value,
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
                rows={10}
                value={formData.content}
                placeholder="Enter document content..."
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
              />
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
              onClick={handleCloseForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className={styles.saveButton}
              onClick={handleCreateDocument}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Document"}
            </button>
          </div>
        </section>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, category or content..."
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
            Active Documents
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
            All Documents
          </button>

          <select
            className={styles.categoryFilter}
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className={styles.loading}>
          Loading documents...
        </p>
      )}

      {!loading && error && (
        <p className={styles.error}>{error}</p>
      )}

      {!loading &&
        !error &&
        filteredDocuments.length === 0 && (
          <div className={styles.empty}>
            No documents found.
          </div>
        )}

      {!loading &&
        !error &&
        filteredDocuments.length > 0 && (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map(
                    (document) => (
                      <tr key={document.id}>
                        <td>{document.id}</td>

                        <td className={styles.titleCell}>
                          {document.title}
                        </td>

                        <td>
                          <span
                            className={
                              styles.categoryBadge
                            }
                          >
                            {document.category}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            document.createdAt
                          )}
                        </td>

                        <td>
                          {formatDate(
                            document.updatedAt
                          )}
                        </td>

                        <td>
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
                        </td>

                        <td>
                          <Link
                            to={`/operations/documents/${document.id}`}
                            className={styles.viewButton}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}