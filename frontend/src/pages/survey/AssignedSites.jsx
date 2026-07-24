import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import siteService from "../../services/site.service";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";

const AssignedSites = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await siteService.getAssignments();
        setAssignments(res.data.assignments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) return <Loader size="large" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>My Assignments</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>List of target site survey allocations</p>
      </div>

      <Table headers={["Site Code", "Site Name", "Address", "Date Assigned", "Status", "Action"]}>
        {assignments.map((a) => {
          const site = a.surveySite || {};
          const siteCode = site.siteId || (site.id ? `BSC-${site.id.slice(0, 4).toUpperCase()}` : "N/A");

          return (
            <tr key={a.id}>
              <td>
                <span
                  style={{
                    backgroundColor: "rgba(99, 102, 241, 0.12)",
                    color: "#818cf8",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  {siteCode}
                </span>
              </td>
              <td><strong>{site.name || "EV Station"}</strong></td>
              <td>{site.address || "N/A"}</td>
              <td>{a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : "N/A"}</td>
              <td><StatusBadge status={a.status} /></td>
              <td>
                <Link to={`/survey/site-info/${a.id}`}>
                  <Button style={{ padding: "6px 12px", fontSize: "12px" }}>Start Survey</Button>
                </Link>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
};

export default AssignedSites;
