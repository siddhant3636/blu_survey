import React, { useEffect, useState } from "react";
import siteService from "../../services/site.service";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const SiteProgress = () => {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Site Survey Progress</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Real-time status of all EV station survey sites
        </p>
      </div>

      <Card>
        <Table headers={["S.No.", "Name", "Concessionaire", "Land Owning Agency", "Status"]}>
          {sites.map((site, index) => (
            <tr key={site.id}>
              <td>{index + 1}</td>
              <td><strong>{site.name}</strong></td>
              <td>{site.concessionaire || "N/A"}</td>
              <td>{site.landOwningAgency || "N/A"}</td>
              <td><StatusBadge status={site.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default SiteProgress;
