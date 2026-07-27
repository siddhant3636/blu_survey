import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import siteService from "../../services/site.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const SiteList = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await siteService.getSites();
        const siteList = res.data?.data?.sites || res.data?.sites || [];
        setSites(siteList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  if (loading) return <Loader size="large" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="responsive-header-bar">
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Survey Sites Directory</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Assign and track survey statuses for candidate EV locations</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/survey-sites/assign"><Button variant="secondary">Assign Site</Button></Link>
          <Link to="/survey-sites/add"><Button>+ Add Survey Site</Button></Link>
        </div>
      </div>

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
    </div>
  );
};

export default SiteList;
