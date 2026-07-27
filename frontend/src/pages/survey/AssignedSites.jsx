import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import siteService from "../../services/site.service";
import surveyService from "../../services/survey.service";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const AssignedSites = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, surveysRes] = await Promise.all([
        siteService.getAssignments(),
        surveyService.getSurveys(),
      ]);
      setAssignments(assignRes.data.assignments || []);
      setSurveys(surveysRes.data.surveys || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader size="large" />;

  // Categorize
  // 1. ACTIVE / ASSIGNED SURVEYS: assignments with no active (non-approved) survey
  const activeAssignments = assignments.filter((a) => {
    return !surveys.some(
      (s) => s.surveySiteId === a.surveySiteId && s.status !== "APPROVED" && s.createdById === a.surveyorId
    );
  });

  // 2. DRAFT SURVEYS: status === "DRAFT"
  const draftSurveys = surveys.filter((s) => s.status === "DRAFT");

  // 3. RETURNED / NEEDS CORRECTION: status === "RETURNED"
  const returnedSurveys = surveys.filter((s) => s.status === "RETURNED");

  // 4. SUBMITTED SURVEYS: status === "SUBMITTED" or "UNDER_REVIEW"
  const submittedSurveys = surveys.filter(
    (s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW"
  );

  // 5. SURVEY HISTORY: status === "APPROVED"
  const approvedSurveys = surveys.filter((s) => s.status === "APPROVED");

  const tabItems = [
    { id: "assigned", label: "Active / Assigned", count: activeAssignments.length },
    { id: "drafts", label: "Drafts", count: draftSurveys.length },
    { id: "returned", label: "Returned / Needs Correction", count: returnedSurveys.length },
    { id: "submitted", label: "Submitted", count: submittedSurveys.length },
    { id: "history", label: "Survey History", count: approvedSurveys.length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Survey Workspace</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Track and complete your EV station site allocations</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "8px",
        overflowX: "auto"
      }}>
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: activeTab === tab.id ? "rgba(99, 102, 241, 0.15)" : "transparent",
              color: activeTab === tab.id ? "#818cf8" : "var(--text-secondary)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap"
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              backgroundColor: activeTab === tab.id ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.08)",
              color: activeTab === tab.id ? "#818cf8" : "var(--text-secondary)",
              padding: "2px 6px",
              borderRadius: "10px",
              fontSize: "11px"
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        {activeTab === "assigned" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>New Assignments / Surveys Not Started</h3>
            {activeAssignments.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "20px 0" }}>No pending site assignments.</p>
            ) : (
              <Table headers={["Site Code", "Site Name", "Address", "Date Assigned", "Action"]}>
                {activeAssignments.map((a) => {
                  const site = a.surveySite || {};
                  const siteCode = site.siteId || `BSC-${site.id?.slice(0, 4).toUpperCase()}`;
                  return (
                    <tr key={a.id}>
                      <td>
                        <span style={{
                          backgroundColor: "rgba(99, 102, 241, 0.12)",
                          color: "#818cf8",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>{siteCode}</span>
                      </td>
                      <td><strong>{site.name}</strong></td>
                      <td>{site.address}</td>
                      <td>{new Date(a.assignedDate).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/survey/site-info/${a.id}`}>
                          <Button style={{ padding: "6px 12px", fontSize: "12px" }}>Start Survey</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        )}

        {activeTab === "drafts" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Active Draft Surveys</h3>
            {draftSurveys.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "20px 0" }}>No draft surveys in progress.</p>
            ) : (
              <Table headers={["Site Code", "Site Name", "Date Started", "Action"]}>
                {draftSurveys.map((s) => {
                  const site = s.surveySite || {};
                  const siteCode = site.siteId || `BSC-${site.id?.slice(0, 4).toUpperCase()}`;
                  return (
                    <tr key={s.id}>
                      <td>
                        <span style={{
                          backgroundColor: "rgba(245, 158, 11, 0.12)",
                          color: "#fbbf24",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>{siteCode}</span>
                      </td>
                      <td><strong>{site.name}</strong></td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/survey/assets/${s.id}`}>
                          <Button style={{ padding: "6px 12px", fontSize: "12px" }}>Resume Survey</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        )}

        {activeTab === "returned" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Surveys Returned for Corrections</h3>
            {returnedSurveys.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "20px 0" }}>No surveys returned for corrections.</p>
            ) : (
              <Table headers={["Site Code", "Site Name", "Returned Date", "Auditor Remarks", "Action"]}>
                {returnedSurveys.map((s) => {
                  const site = s.surveySite || {};
                  const siteCode = site.siteId || `BSC-${site.id?.slice(0, 4).toUpperCase()}`;
                  return (
                    <tr key={s.id}>
                      <td>
                        <span style={{
                          backgroundColor: "rgba(239, 68, 68, 0.12)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>{siteCode}</span>
                      </td>
                      <td><strong>{site.name}</strong></td>
                      <td>{s.reviewedAt ? new Date(s.reviewedAt).toLocaleDateString() : "N/A"}</td>
                      <td style={{ color: "#f87171", fontSize: "13px", maxWidth: "250px" }}>{s.reviewRemarks || "No remarks provided."}</td>
                      <td>
                        <Link to={`/survey/assets/${s.id}`}>
                          <Button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "var(--danger)" }}>Edit / Correct & Resubmit</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        )}

        {activeTab === "submitted" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Submitted Surveys / Pending Review</h3>
            {submittedSurveys.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "20px 0" }}>No submitted surveys.</p>
            ) : (
              <Table headers={["Site Code", "Site Name", "Submission Date", "Status", "Action"]}>
                {submittedSurveys.map((s) => {
                  const site = s.surveySite || {};
                  const siteCode = site.siteId || `BSC-${site.id?.slice(0, 4).toUpperCase()}`;
                  return (
                    <tr key={s.id}>
                      <td>
                        <span style={{
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>{siteCode}</span>
                      </td>
                      <td><strong>{site.name}</strong></td>
                      <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "N/A"}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td>
                        <Link to={`/survey/review/${s.id}`}>
                          <Button style={{ padding: "6px 12px", fontSize: "12px" }} variant="secondary">View Survey</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>APPROVED SURVEYS</h3>
            {approvedSurveys.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "20px 0" }}>No approved surveys.</p>
            ) : (
              <Table headers={["Site Code", "Site Name", "Approval Date", "Auditor Remarks", "Action"]}>
                {approvedSurveys.map((s) => {
                  const site = s.surveySite || {};
                  const siteCode = site.siteId || `BSC-${site.id?.slice(0, 4).toUpperCase()}`;
                  return (
                    <tr key={s.id}>
                      <td>
                        <span style={{
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>{siteCode}</span>
                      </td>
                      <td><strong>{site.name}</strong></td>
                      <td>{s.reviewedAt ? new Date(s.reviewedAt).toLocaleDateString() : "N/A"}</td>
                      <td style={{ fontSize: "13px", maxWidth: "250px" }}>{s.reviewRemarks || "Approved successfully."}</td>
                      <td>
                        <Link to={`/survey/review/${s.id}`}>
                          <Button style={{ padding: "6px 12px", fontSize: "12px" }} variant="secondary">View Details</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssignedSites;
