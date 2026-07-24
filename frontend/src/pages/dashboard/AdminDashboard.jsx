import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  SlidersHorizontal, 
  Users, 
  MapPin, 
  BarChart3, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  Activity 
} from "lucide-react";
import dashboardService from "../../services/dashboard.service";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader size="large" />;

  const counts = stats?.counts || {};
  const recentSurveys = stats?.recentSurveys || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>System Overview Dashboard</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Real-time metrics & management controls for multi-user EV Charging Station surveys
        </p>
      </div>

      {/* QUICK ACCESS ACTION CARDS FOR ADMIN */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Link to="/masters/manufacturers" style={{ textDecoration: "none" }}>
          <Card className="metric-card" blobColor="#6366f1" style={{ cursor: "pointer" }}>
            <div className="metric-icon">
              <SlidersHorizontal size={22} strokeWidth={2} />
            </div>
            <div className="metric-info">
              <h4>Masters Management</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Hardware & Photos</p>
            </div>
          </Card>
        </Link>
        <Link to="/users" style={{ textDecoration: "none" }}>
          <Card className="metric-card" blobColor="#0ea5e9" style={{ cursor: "pointer" }}>
            <div className="metric-icon">
              <Users size={22} strokeWidth={2} />
            </div>
            <div className="metric-info">
              <h4>User Management</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{counts.users || 0} Accounts</p>
            </div>
          </Card>
        </Link>
        <Link to="/survey-sites" style={{ textDecoration: "none" }}>
          <Card className="metric-card" blobColor="#10b981" style={{ cursor: "pointer" }}>
            <div className="metric-icon">
              <MapPin size={22} strokeWidth={2} />
            </div>
            <div className="metric-info">
              <h4>Survey Sites</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{counts.sites || 0} Sites</p>
            </div>
          </Card>
        </Link>
        <Link to="/reports" style={{ textDecoration: "none" }}>
          <Card className="metric-card" blobColor="#f59e0b" style={{ cursor: "pointer" }}>
            <div className="metric-icon">
              <BarChart3 size={22} strokeWidth={2} />
            </div>
            <div className="metric-info">
              <h4>Reports & Exports</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Excel & PDF</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="metrics-grid">
        <Card className="metric-card" blobColor="#8b5cf6">
          <div className="metric-icon">
            <Users size={22} strokeWidth={2} />
          </div>
          <div className="metric-info">
            <h4>Total Users</h4>
            <p>{counts.users || 0}</p>
          </div>
        </Card>

        <Card className="metric-card" blobColor="#3b82f6">
          <div className="metric-icon">
            <MapPin size={22} strokeWidth={2} />
          </div>
          <div className="metric-info">
            <h4>Survey Sites</h4>
            <p>{counts.sites || 0}</p>
          </div>
        </Card>

        <Card className="metric-card" blobColor="#f59e0b">
          <div className="metric-icon">
            <Clock size={22} strokeWidth={2} />
          </div>
          <div className="metric-info">
            <h4>In Progress Sites</h4>
            <p>{counts.inProgressSites || 0}</p>
          </div>
        </Card>

        <Card className="metric-card" blobColor="#ec4899">
          <div className="metric-icon">
            <FileCheck size={22} strokeWidth={2} />
          </div>
          <div className="metric-info">
            <h4>Under Review</h4>
            <p>{counts.submittedSurveys || 0}</p>
          </div>
        </Card>

        <Card className="metric-card" blobColor="#10b981">
          <div className="metric-icon">
            <CheckCircle2 size={22} strokeWidth={2} />
          </div>
          <div className="metric-info">
            <h4>Approved Surveys</h4>
            <p>{counts.approvedSurveys || 0}</p>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        <BarChart title="Survey Allocations & Progress" />
        <PieChart title="Survey Status Distribution" />
      </div>

      <Card blobColor="#6366f1">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Activity size={20} color="var(--primary)" />
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Recent Survey Activity</h3>
        </div>
        {recentSurveys.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No recent survey activities recorded.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentSurveys.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  justify: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--border-radius)",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600" }}>{s.surveySite?.name}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Initiated by {s.createdBySurveyor?.name} ({s.createdBySurveyor?.email})
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
