import React, { useEffect, useState } from "react";
import surveyService from "../../services/survey.service";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const SurveyHistory = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await surveyService.getSurveys();
        setSurveys(res.data.surveys);
      } catch (err) {
        console.error(err);
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
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Survey History</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>List of your previously submitted or draft surveys</p>
      </div>

      <Table headers={["Site Name", "Date Started", "Locked", "Status"]}>
        {surveys.map((s) => (
          <tr key={s.id}>
            <td>{s.surveySite.name}</td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
            <td>{s.isLocked ? "🔒 Yes" : "🔓 No"}</td>
            <td><StatusBadge status={s.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default SurveyHistory;
