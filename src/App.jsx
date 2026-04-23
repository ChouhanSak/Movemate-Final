import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header1";
import DriverUpload from "./pages/ADashboard/DriverUpload";
import HomePage from "./pages/HomePage";
import UserTypeSelector from "./pages/UserTypeSelector";
import Signupc from "./pages/Signupc";
import Signupa from "./pages/Signupa";
import LoginForm from "./pages/LoginForm";
import ForgotPassword from "./pages/ForgotPassword";
import CustomerDashboard from "./pages/CustomerDashboard/Dashboard";
import AgencyDashboard from "./pages/ADashboard/AgencyDashboard";
import Trackshipment from "./pages/CustomerDashboard/Trackshipment";
import SiteManagerLogin from "./pages/Sitemanagerlogin";
import SiteManager from "./pages/SitemanagerDashboard/SiteManager";
import ContactSupport from "./pages/ContactSupport";
import TermsAndConditions from "./pages/Terms";
import PrivacyPolicy from "./pages/Privacy";
export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/select-user" element={<UserTypeSelector />} />

        <Route path="/login/customer" element={<LoginForm userType="customer" />} />
        <Route path="/login/agency" element={<LoginForm userType="agency" />} />
        <Route path="/forgot-password/:userType" element={<ForgotPassword />} />
        <Route path="/signup/customer" element={<Signupc />} />
        <Route path="/signup/agency" element={<Signupa />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/agency-dashboard" element={<AgencyDashboard />} />
          <Route path="/track" element={<Trackshipment />} />
          
          <Route path="/driver-upload/:token" element={<DriverUpload />} />
        <Route path="/sitemanager" element={<SiteManagerLogin />} />
        <Route path="/site-manager-dashboard" element={<SiteManager />} />
        <Route path="/contact" element={<ContactSupport />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
        
    </>
  );
}