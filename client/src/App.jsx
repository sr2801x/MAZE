import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PricingPage } from "./pages/PricingPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { OAuthSuccessPage } from "./pages/OAuthSuccessPage.jsx";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Route>
    </Routes>
  );
}