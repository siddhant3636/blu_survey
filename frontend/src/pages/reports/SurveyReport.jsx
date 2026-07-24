import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import surveyService from "../../services/survey.service";
import reportService from "../../services/report.service";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";

const SurveyReport = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await surveyService.getSurveys();
        const surveyList = res.data?.data?.surveys || res.data?.surveys || [];
        setSurveys(surveyList);
      } catch (err) {
        console.error("Error loading survey report:", err);
        setError(err.response?.data?.message || "Failed to load survey report");
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  if (loading) return <Loader size="large" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Survey Report Hub</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Generate, download Excel / PDF, and audit EV site checklists</p>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {surveys.length === 0 ? (
        <Card>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>No Surveys Recorded Yet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Once a Survey Person completes Step 1 for an assigned station, survey reports will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table headers={["Site Name", "Surveyor", "Date Started", "Status", "Actions"]}>
            {surveys.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.surveySite?.name || "EV Charging Station"}</strong></td>
                <td>{s.createdBySurveyor?.name || s.surveyor?.name || "Field Surveyor"}</td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td><StatusBadge status={s.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Link to={`/survey/review/${s.id}`}>
                      <Button style={{ padding: "4px 10px", fontSize: "12px", backgroundColor: "var(--primary)" }}>
                        🔍 Review / Audit
                      </Button>
                    </Link>
                    <a href={reportService.getExcelReportUrl(s.id)} download target="_blank" rel="noreferrer">
                      <Button variant="secondary" style={{ padding: "4px 10px", fontSize: "12px" }}>📊 Excel</Button>
                    </a>
                    <a href={reportService.getPDFReportUrl(s.id)} download target="_blank" rel="noreferrer">
                      <Button style={{ padding: "4px 10px", fontSize: "12px" }}>📄 PDF</Button>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
};

export default SurveyReport;
