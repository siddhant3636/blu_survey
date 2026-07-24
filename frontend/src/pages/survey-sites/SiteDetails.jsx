import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import siteService from "../../services/site.service";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const SiteDetails = () => {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await siteService.getSite(id);
        setSite(res.data.site);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id]);

  if (loading) return <Loader size="large" />;
  if (!site) return <p>Site not found.</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Site Details</h2>
        <Link to="/survey-sites" style={{ color: "var(--primary)" }}>Back to Sites</Link>
      </div>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px" }}>{site.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>{site.address}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <div>
              <h4 style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Concessionaire</h4>
              <p style={{ fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>{site.concessionaire || "N/A"}</p>
            </div>
            <div>
              <h4 style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Land Owning Agency</h4>
              <p style={{ fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>{site.landOwningAgency || "N/A"}</p>
            </div>
            <div>
              <h4 style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</h4>
              <div style={{ marginTop: "4px" }}><StatusBadge status={site.status} /></div>
            </div>
            <div>
              <h4 style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Coordinates</h4>
              <p style={{ fontSize: "14px", marginTop: "4px" }}>{site.latitude ? `${site.latitude.toFixed(6)}, ${site.longitude.toFixed(6)}` : "None"}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SiteDetails;
