import React, { useEffect, useState } from "react";
import surveyService from "../../services/survey.service";
import reportService from "../../services/report.service";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const ExportReport = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await surveyService.getSurveys();
        const surveyList = res.data?.data?.surveys || res.data?.surveys || [];
        setSurveys(surveyList);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Export Data Reports</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Export EV Charging Station survey data into Excel spreadsheets and PDF audit packages
        </p>
      </div>

      <Card>
        <Table headers={["Site Name", "Initiated By", "Status", "Download Options"]}>
          {surveys.map((s) => (
            <tr key={s.id}>
              <td><strong>{s.surveySite?.name || "EV Station"}</strong></td>
              <td>{s.createdBySurveyor?.name || "Survey Person"}</td>
              <td><StatusBadge status={s.status} /></td>
              <td>
                <div style={{ display: "flex", gap: "10px" }}>
                  <a href={reportService.getExcelReportUrl(s.id)} download target="_blank" rel="noreferrer">
                    <Button variant="secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>📊 Download Excel</Button>
                  </a>
                  <a href={reportService.getPDFReportUrl(s.id)} download target="_blank" rel="noreferrer">
                    <Button style={{ padding: "6px 12px", fontSize: "12px" }}>📄 Download PDF</Button>
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default ExportReport;
