import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import siteService from "../../services/site.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../hooks/useAuth";

const SiteList = () => {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const fetchSites = async () => {
    try {
      const res = await siteService.getSites();
      const siteList = res.data?.data?.sites || res.data?.sites || [];
      const uniqueSites = Array.from(new Map(siteList.map(s => [s.id, s])).values());
      setSites(uniqueSites);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleBulkUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input to allow uploading same file again
    e.target.value = null;

    setUploading(true);
    setError("");
    setUploadResult(null);

    try {
      const res = await siteService.bulkUploadSites(file);
      const result = res.data?.result || res.result;
      setUploadResult(result);
      setShowResultModal(true);
      await fetchSites();
    } catch (err) {
      console.error("Bulk upload failed:", err);
      setError(err.response?.data?.message || err.message || "Failed to upload file. Please check Excel format.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader size="large" />;

  const isAdmin = user?.role === "ADMIN";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="responsive-header-bar">
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Survey Sites Directory</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Assign and track survey statuses for candidate EV locations</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isAdmin && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
              <Button onClick={handleBulkUploadClick} disabled={uploading} variant="secondary">
                {uploading ? "Uploading..." : "Bulk Upload Sites"}
              </Button>
            </>
          )}
          <Link to="/survey-sites/assign"><Button variant="secondary">Assign Site</Button></Link>
          {isAdmin && (
            <Link to="/survey-sites/add"><Button>+ Add Survey Site</Button></Link>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          color: "var(--danger)",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600"
        }}>
          {error}
        </div>
      )}

      <Table headers={["S.No.", "SITE ID", "NAME", "CONCESSIONAIRE", "LAND OWNING AGENCY", "ADDRESS", "ASSIGNED SURVEYOR(S)", "STATUS", "ACTIONS"]}>
        {sites.map((s, index) => {
          const displaySiteId = s.siteId || `BSC${(index + 1).toString().padStart(3, "0")}`;
          return (
            <tr key={s.id}>
              <td style={{ fontWeight: "600", width: "60px" }}>{index + 1}</td>
              <td>
                <span style={{
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "12px"
                }}>
                  {displaySiteId}
                </span>
              </td>
              <td style={{ fontWeight: "600" }}>{s.name}</td>
              <td>{s.concessionaire || "N/A"}</td>
              <td>{s.landOwningAgency || "N/A"}</td>
              <td>{s.address}</td>
              <td>
                {s.assignments && s.assignments.length > 0 ? (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {s.assignments.map((a) => (
                      <span
                        key={a.id}
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {a.surveyor?.name || "Unknown"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: "var(--text-secondary)", fontStyle: "italic", fontSize: "12px" }}>
                    Not Assigned
                  </span>
                )}
              </td>
              <td><StatusBadge status={s.status} /></td>
              <td>
                <Link to={`/survey-sites/edit/${s.id}`} style={{ color: "var(--secondary)", fontWeight: "600" }}>Edit</Link>
              </td>
            </tr>
          );
        })}
      </Table>

      <Modal
        show={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Bulk Upload Result"
      >
        {uploadResult && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ fontSize: "14px" }}>Total processed:</span>
                <strong style={{ fontSize: "14px" }}>{uploadResult.totalProcessed}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#34d399", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ fontSize: "14px" }}>✓ Successfully added:</span>
                <strong style={{ fontSize: "14px" }}>{uploadResult.successfullyAdded}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#818cf8", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ fontSize: "14px" }}>↻ Skipped duplicates:</span>
                <strong style={{ fontSize: "14px" }}>{uploadResult.skippedDuplicates}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: uploadResult.invalidRows.length > 0 ? "var(--danger)" : "var(--text-secondary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px" }}>
                <span style={{ fontSize: "14px" }}>⚠ Invalid rows:</span>
                <strong style={{ fontSize: "14px" }}>{uploadResult.invalidRows.length}</strong>
              </div>
            </div>

            {uploadResult.invalidRows.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--danger)", marginBottom: "8px" }}>Validation Details:</h4>
                <div style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "6px",
                  padding: "8px 12px"
                }}>
                  {uploadResult.invalidRows.map((err, idx) => (
                    <div key={idx} style={{ fontSize: "13px", color: "var(--danger)", marginBottom: "6px" }}>
                      <strong>Row {err.rowNumber}:</strong> {err.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SiteList;
