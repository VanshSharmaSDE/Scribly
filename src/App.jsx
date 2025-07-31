import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Beta from "./pages/Beta";
import FutureUpdates from "./pages/FutureUpdates";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NoteView from "./pages/NoteView";
import NoteEdit from "./pages/NoteEdit";
import SharedNoteView from "./pages/SharedNoteView";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Routes where navbar and footer should be hidden
  const hideNavbarFooter =
    [
      "/login",
      "/signup",
      "/dashboard",
      "/forgot-password", 
      "/reset-password",
      "/verify-email",
    ].includes(location.pathname) || 
    location.pathname.startsWith("/notes/") ||
    location.pathname.startsWith("/shared/");

  return (
    <div className="min-h-screen bg-scribly-black">
      <ScrollToTop />
      {!hideNavbarFooter && (
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={logout} 
        />
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/features" element={<Features />} />
        <Route path="/beta" element={<Beta />} />
        <Route path="/future-updates" element={<FutureUpdates />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Public Shared Note Route */}
        <Route path="/shared/:shareToken" element={<SharedNoteView />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/view/:id"
          element={
            <ProtectedRoute>
            <NoteView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/edit/:id"
          element={
            <ProtectedRoute>
            <NoteEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/new"
          element={
            <ProtectedRoute>
            <NoteEdit />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes for backward compatibility */}
        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
            <NoteView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:id/edit"
          element={
            <ProtectedRoute>
            <NoteEdit />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideNavbarFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <AppContent />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#f3f4f6",
              border: "1px solid #374151",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
            success: {
              style: {
                border: "1px solid #10b981",
                background: "#064e3b",
                color: "#d1fae5",
              },
              iconTheme: {
                primary: "#10b981",
                secondary: "#d1fae5",
              },
            },
            error: {
              style: {
                border: "1px solid #ef4444",
                background: "#7f1d1d",
                color: "#fee2e2",
              },
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fee2e2",
              },
            },
          }}
        />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

