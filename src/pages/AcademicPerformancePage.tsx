import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type {
  AcademicPerformance,
  PoorPerformanceSummary,
  DecliningPerformanceSummary,
  CreateAcademicPerformanceRequest,
} from "../types/academicPerformance";
import type { Student } from "../types/student";
import {
  getAcademicPerformance,
  getPoorPerformance,
  getDecliningPerformance,
  createAcademicPerformance,
} from "../api/academicPerformanceApi";
import { getStudents } from "../api/studentsApi";
import styles from "./AcademicPerformancePage.module.css";

export default function AcademicPerformancePage() {
  const [records, setRecords] = useState<AcademicPerformance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [includeInactive, setIncludeInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    subject: "",
    examName: "",
    marksObtained: "",
    maximumMarks: "",
    examDate: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [poorThreshold, setPoorThreshold] = useState("50");
  const [poorSubject, setPoorSubject] = useState("");
  const [poorResults, setPoorResults] = useState<PoorPerformanceSummary[]>([]);
  const [poorLoading, setPoorLoading] = useState(false);
  const [poorError, setPoorError] = useState("");

  const [decliningSubject, setDecliningSubject] = useState("");
  const [decliningResults, setDecliningResults] = useState<
    DecliningPerformanceSummary[]
  >([]);
  const [decliningLoading, setDecliningLoading] = useState(false);
  const [decliningError, setDecliningError] = useState("");

  async function loadRecords() {
    try {
      setLoading(true);
      setError("");

      const data = await getAcademicPerformance(includeInactive);
      setRecords(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load academic performance records."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    try {
      setStudentsLoading(true);
      const data = await getStudents(false, "");
      setStudents(data);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [includeInactive]);

  useEffect(() => {
    if (showForm && students.length === 0) {
      loadStudents();
    }
  }, [showForm]);

  function resetForm() {
    setFormData({
      studentId: "",
      subject: "",
      examName: "",
      marksObtained: "",
      maximumMarks: "",
      examDate: "",
    });

    setFormError("");
  }

  function handleAddClick() {
    resetForm();
    setShowForm(true);
  }

  function handleCancelForm() {
    resetForm();
    setShowForm(false);
  }

  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");

    const subject = formData.subject.trim();
    const examName = formData.examName.trim();

    if (!formData.studentId) {
      setFormError("Student is required.");
      return;
    }

    if (!subject) {
      setFormError("Subject is required.");
      return;
    }

    if (!examName) {
      setFormError("Exam name is required.");
      return;
    }

    if (!formData.marksObtained || !formData.maximumMarks) {
      setFormError("Marks obtained and maximum marks are required.");
      return;
    }

    if (!formData.examDate) {
      setFormError("Exam date is required.");
      return;
    }

    const marksObtained = Number(formData.marksObtained);
    const maximumMarks = Number(formData.maximumMarks);

    if (Number.isNaN(marksObtained) || Number.isNaN(maximumMarks)) {
      setFormError("Marks must be valid numbers.");
      return;
    }

    if (maximumMarks <= 0) {
      setFormError("Maximum marks must be greater than 0.");
      return;
    }

    if (marksObtained < 0) {
      setFormError("Marks obtained cannot be negative.");
      return;
    }

    if (marksObtained > maximumMarks) {
      setFormError("Marks obtained cannot exceed maximum marks.");
      return;
    }

    try {
      setSaving(true);

      const requestData: CreateAcademicPerformanceRequest = {
        studentId: Number(formData.studentId),
        subject,
        examName,
        marksObtained,
        maximumMarks,
        examDate: formData.examDate,
      };

      const newRecord = await createAcademicPerformance(requestData);

      setRecords((current) => [newRecord, ...current]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to save academic performance record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePoorPerformanceReport() {
    const threshold = Number(poorThreshold);

    if (Number.isNaN(threshold) || threshold < 0 || threshold > 100) {
      setPoorError("Threshold must be between 0 and 100.");
      return;
    }

    try {
      setPoorLoading(true);
      setPoorError("");

      const data = await getPoorPerformance(
        threshold,
        poorSubject.trim()
      );

      setPoorResults(data);
    } catch (err) {
      setPoorError(
        err instanceof Error
          ? err.message
          : "Failed to load poor performance report."
      );
    } finally {
      setPoorLoading(false);
    }
  }

  async function handleDecliningPerformanceReport() {
    try {
      setDecliningLoading(true);
      setDecliningError("");

      const data = await getDecliningPerformance(
        decliningSubject.trim()
      );

      setDecliningResults(data);
    } catch (err) {
      setDecliningError(
        err instanceof Error
          ? err.message
          : "Failed to load declining performance report."
      );
    } finally {
      setDecliningLoading(false);
    }
  }

  function getPercentage(
    marksObtained: number,
    maximumMarks: number
  ): string {
    if (maximumMarks <= 0) {
      return "0.0";
    }

    return ((marksObtained / maximumMarks) * 100).toFixed(1);
  }

  function getStudentName(record: AcademicPerformance): string {
    if (record.student) {
      return `${record.student.firstName} ${record.student.lastName}`;
    }

    const student = students.find(
      (item) => item.id === record.studentId
    );

    if (student) {
      return `${student.firstName} ${student.lastName}`;
    }

    return `Student #${record.studentId}`;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Academic Performance</h1>
          <p className={styles.subtitle}>
            Manage and monitor student academic performance.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddClick}
        >
          Add Academic Performance
        </button>
      </header>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2>Add Academic Performance</h2>
              <p>Enter the student's academic performance details.</p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCancelForm}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="studentId">Student</label>

                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleFormChange}
                  disabled={studentsLoading}
                  required
                >
                  <option value="">
                    {studentsLoading ? "Loading students..." : "Select student"}
                  </option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="subject">Subject</label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="examName">Exam Name</label>

                <input
                  id="examName"
                  name="examName"
                  type="text"
                  value={formData.examName}
                  onChange={handleFormChange}
                  placeholder="Enter exam name"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="marksObtained">Marks Obtained</label>

                <input
                  id="marksObtained"
                  name="marksObtained"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.marksObtained}
                  onChange={handleFormChange}
                  placeholder="Enter marks"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="maximumMarks">Maximum Marks</label>

                <input
                  id="maximumMarks"
                  name="maximumMarks"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.maximumMarks}
                  onChange={handleFormChange}
                  placeholder="Enter maximum marks"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="examDate">Exam Date</label>

                <input
                  id="examDate"
                  name="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleCancelForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Record"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <button
            type="button"
            className={
              !includeInactive ? styles.activeFilter : styles.filterButton
            }
            onClick={() => setIncludeInactive(false)}
          >
            Active Records
          </button>

          <button
            type="button"
            className={
              includeInactive ? styles.activeFilter : styles.filterButton
            }
            onClick={() => setIncludeInactive(true)}
          >
            All Records
          </button>
        </div>
      </div>

      {loading && (
        <p className={styles.loading}>
          Loading academic performance records...
        </p>
      )}

      {!loading && error && <p className={styles.error}>{error}</p>}

      {!loading && !error && records.length === 0 && (
  <p className={styles.empty}>
    No academic performance records found.
  </p>
)}

      {!loading && !error && records.length > 0 && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Exam Date</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => {
                  const percentage = getPercentage(
                    record.marksObtained,
                    record.maximumMarks
                  );

                  return (
                    <tr key={record.id}>
                      <td>{getStudentName(record)}</td>

                      <td>{record.subject}</td>

                      <td>{record.examName}</td>

                      <td>
                        {new Date(record.examDate).toLocaleDateString()}
                      </td>

                      <td>
                        {record.marksObtained} / {record.maximumMarks}
                      </td>

                      <td>{percentage}%</td>

                      <td>
                        <span
                          className={
                            record.isActive
                              ? styles.activeStatus
                              : styles.inactiveStatus
                          }
                        >
                          {record.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/academics/performance/${record.id}`}
                          className={styles.viewButton}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section className={styles.analyticsSection}>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsHeader}>
            <div>
              <h2>Poor Performance</h2>
              <p>
                Find students whose latest performance is below a
                selected threshold.
              </p>
            </div>
          </div>

          <div className={styles.analyticsForm}>
            <div className={styles.formField}>
              <label htmlFor="poorThreshold">Threshold (%)</label>

              <input
                id="poorThreshold"
                type="number"
                min="0"
                max="100"
                value={poorThreshold}
                onChange={(event) =>
                  setPoorThreshold(event.target.value)
                }
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="poorSubject">Subject (optional)</label>

              <input
                id="poorSubject"
                type="text"
                value={poorSubject}
                onChange={(event) =>
                  setPoorSubject(event.target.value)
                }
                placeholder="All subjects"
              />
            </div>

            <button
              type="button"
              className={styles.reportButton}
              onClick={handlePoorPerformanceReport}
              disabled={poorLoading}
            >
              {poorLoading ? "Loading..." : "Run Report"}
            </button>
          </div>

          {poorError && <p className={styles.error}>{poorError}</p>}

          {poorResults.length > 0 && (
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Latest Exam</th>
                      <th>Latest %</th>
                    </tr>
                  </thead>

                  <tbody>
                    {poorResults.map((result) => (
                      <tr
                        key={`${result.studentId}-${result.subject}`}
                      >
                        <td>{result.studentName}</td>
                        <td>{result.subject}</td>
                        <td>{result.latestExamName}</td>
                        <td>{result.latestPercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!poorLoading &&
            !poorError &&
            poorResults.length === 0 && (
              <p className={styles.analyticsEmpty}>
                Run the report to see results.
              </p>
            )}
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsHeader}>
            <div>
              <h2>Declining Performance</h2>
              <p>
                Find students whose performance has declined between
                exams.
              </p>
            </div>
          </div>

          <div className={styles.analyticsForm}>
            <div className={styles.formField}>
              <label htmlFor="decliningSubject">
                Subject (optional)
              </label>

              <input
                id="decliningSubject"
                type="text"
                value={decliningSubject}
                onChange={(event) =>
                  setDecliningSubject(event.target.value)
                }
                placeholder="All subjects"
              />
            </div>

            <button
              type="button"
              className={styles.reportButton}
              onClick={handleDecliningPerformanceReport}
              disabled={decliningLoading}
            >
              {decliningLoading ? "Loading..." : "Run Report"}
            </button>
          </div>

          {decliningError && (
            <p className={styles.error}>{decliningError}</p>
          )}

          {decliningResults.length > 0 && (
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Previous</th>
                      <th>Latest</th>
                      <th>Change</th>
                    </tr>
                  </thead>

                  <tbody>
                    {decliningResults.map((result) => (
                      <tr
                        key={`${result.studentId}-${result.subject}`}
                      >
                        <td>{result.studentName}</td>

                        <td>{result.subject}</td>

                        <td>
                          {result.previousExamName}
                          <br />
                          {result.previousPercentage.toFixed(1)}%
                        </td>

                        <td>
                          {result.latestExamName}
                          <br />
                          {result.latestPercentage.toFixed(1)}%
                        </td>

                        <td>
                          {result.percentageChange.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!decliningLoading &&
            !decliningError &&
            decliningResults.length === 0 && (
              <p className={styles.analyticsEmpty}>
                Run the report to see results.
              </p>
            )}
        </div>
      </section>
    </main>
  );
}
