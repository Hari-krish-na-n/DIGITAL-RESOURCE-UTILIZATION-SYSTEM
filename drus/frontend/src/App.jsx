import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./components/Auth";
import { Layout } from "./components/Layout";
import { UserProvider, useUser } from "./context/UserContext";
import { PlatformProvider } from "./context/PlatformContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DashboardProvider } from "./context/DashboardContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";

import { Dashboard } from "./components/Dashboard";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { PlatformGrid } from "./components/platforms/PlatformGrid";
import { Repositories } from "./components/Repositories";
import { Courses } from "./components/Courses";

function AppContent() {
  const { user, loading, login, logout } = useUser();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={user ? (
          <PlatformProvider>
            <DashboardProvider>
              <AnalyticsProvider>
                <Layout user={user} onLogout={logout} />
              </AnalyticsProvider>
            </DashboardProvider>
          </PlatformProvider>
        ) : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="repositories" element={<Repositories />} />
        <Route path="courses" element={<Courses />} />
        <Route path="platforms" element={<PlatformGrid />} />
      </Route>
      <Route
        path="/login"
        element={!user ? <Auth onLogin={login} /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <UserProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </UserProvider>
    </Router>
  );
}
