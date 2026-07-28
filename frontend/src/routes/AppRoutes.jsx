import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Guards
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import SubAdminRoute from "./SubAdminRoute";
import SurveyRoute from "./SurveyRoute";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import SubAdminLayout from "../layouts/SubAdminLayout";
import SurveyLayout from "../layouts/SurveyLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangePassword from "../pages/auth/ChangePassword";

// Dashboards
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import SubAdminDashboard from "../pages/dashboard/SubAdminDashboard";
import SurveyDashboard from "../pages/dashboard/SurveyDashboard";

// Users
import UserList from "../pages/users/UserList";
import AddUser from "../pages/users/AddUser";
import EditUser from "../pages/users/EditUser";
import UserProfile from "../pages/users/UserProfile";

// Survey Sites
import SiteList from "../pages/survey-sites/SiteList";
import AddSite from "../pages/survey-sites/AddSite";
import EditSite from "../pages/survey-sites/EditSite";
import AssignSite from "../pages/survey-sites/AssignSite";

// Surveys
import AssignedSites from "../pages/survey/AssignedSites";
import SiteInformation from "../pages/survey/SiteInformation";
import AssetSelection from "../pages/survey/AssetSelection";
import ChargerSurvey from "../pages/survey/ChargerSurvey";
import PanelSurvey from "../pages/survey/PanelSurvey";
import TransformerSurvey from "../pages/survey/TransformerSurvey";
import DGSurvey from "../pages/survey/DGSurvey";
import PhotoUpload from "../pages/survey/PhotoUpload";
import FinalReview from "../pages/survey/FinalReview";
import SurveyHistory from "../pages/survey/SurveyHistory";

// Masters
import ManufacturerMaster from "../pages/masters/ManufacturerMaster";
import ChargerModelMaster from "../pages/masters/ChargerModelMaster";
import ConnectorMaster from "../pages/masters/ConnectorMaster";
import EquipmentMaster from "../pages/masters/EquipmentMaster";
import PhotoCategoryMaster from "../pages/masters/PhotoCategoryMaster";
import MccbMaster from "../pages/masters/MccbMaster";

// Reports
import SurveyReport from "../pages/reports/SurveyReport";
import SiteProgress from "../pages/reports/SiteProgress";
import UserPerformance from "../pages/reports/UserPerformance";
import ExportReport from "../pages/reports/ExportReport";

// Forms Management
import FormsList from "../pages/forms/FormsList";
import FormDetails from "../pages/forms/FormDetails";

// Settings
import Profile from "../pages/settings/Profile";
import SettingsChangePassword from "../pages/settings/ChangePassword";
import AppSettings from "../pages/settings/AppSettings";

// Error Pages
import NotFound from "../pages/errors/NotFound";
import Unauthorized from "../pages/errors/Unauthorized";
import ServerError from "../pages/errors/ServerError";

// Import Auth Context Hook
import { useAuth } from "../hooks/useAuth";

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "MANAGER" || user.role === "SUB_ADMIN") return <SubAdminDashboard />;
  return <SurveyDashboard />;
};

const RoleBasedLayout = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "ADMIN") {
    return <AdminLayout>{children}</AdminLayout>;
  }
  if (user?.role === "SUB_ADMIN" || user?.role === "MANAGER") {
    return <SubAdminLayout>{children}</SubAdminLayout>;
  }
  return <SurveyLayout>{children}</SurveyLayout>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Auth routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/change-password" element={<AuthLayout><ChangePassword /></AuthLayout>} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <DashboardRedirect />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />

        {/* User Management */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <UserList />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/users/add"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <AddUser />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/users/edit/:id"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <EditUser />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/users/profile"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <UserProfile />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />

        {/* Survey Sites Management */}
        <Route
          path="/survey-sites"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <SiteList />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey-sites/add"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <AddSite />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey-sites/edit/:id"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <EditSite />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/survey-sites/assign"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <AssignSite />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />

        {/* Surveyor Actions */}
        <Route
          path="/survey/assigned"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <AssignedSites />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/site-info/:assignmentId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <SiteInformation />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/assets/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <AssetSelection />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/chargers/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <ChargerSurvey />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/panels/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <PanelSurvey />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/transformers/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <TransformerSurvey />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/dg/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <DGSurvey />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/dgs/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <DGSurvey />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/photos/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <PhotoUpload />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/review/:surveyId"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <FinalReview />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/survey/history"
          element={
            <PrivateRoute>
              <SurveyRoute>
                <SurveyLayout>
                  <SurveyHistory />
                </SurveyLayout>
              </SurveyRoute>
            </PrivateRoute>
          }
        />

        {/* Master Catalog Screens (Admin Only) */}
        <Route path="/masters" element={<Navigate to="/masters/manufacturers" replace />} />
        <Route
          path="/masters/manufacturers"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <ManufacturerMaster />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/masters/models"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <ChargerModelMaster />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/masters/connectors"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <ConnectorMaster />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/masters/equipment"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <EquipmentMaster />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/masters/photo-categories"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <PhotoCategoryMaster />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/masters/mccb"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminLayout>
                  <MccbMaster />
                </AdminLayout>
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Reports Hub */}
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <SurveyReport />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/progress"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <SiteProgress />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/performance"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <UserPerformance />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/export"
          element={
            <PrivateRoute>
              <SubAdminRoute>
                <RoleBasedLayout>
                  <ExportReport />
                </RoleBasedLayout>
              </SubAdminRoute>
            </PrivateRoute>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <Profile />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/change-password"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <SettingsChangePassword />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/app"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <AppSettings />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />

        {/* Forms Management Routes */}
        <Route
          path="/forms"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <FormsList />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/:id"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <FormDetails />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />

        {/* Error Boundaries */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
