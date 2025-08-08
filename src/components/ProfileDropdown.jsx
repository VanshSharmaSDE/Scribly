import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Camera, Mail, Edit3, Save, X, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "./Button";
import ConfirmationModal from "./ConfirmationModal";
import SettingsModal from "./SettingsModal";
import userService from "../services/userService";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const { user, logout, updateUserInContext } = useAuth();
  const navigate = useNavigate();

  // Listen for custom event to open settings
  useEffect(() => {
    const handleOpenSettings = (event) => {
      setShowSettingsModal(true);
      // Optional: focus on specific tab if provided
      if (event.detail?.tab) {
        // You can extend SettingsModal to accept initial tab if needed
        console.log('Opening settings with tab:', event.detail.tab);
      }
    };

    window.addEventListener('openSettings', handleOpenSettings);
    
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
    };
  }, []);

  // Fallback data if user is not fully loaded
  const defaultUser = {
    name: "User",
    email: "user@example.com",
    avatar: null,
  };

  const currentUser = user
    ? {
        name: user.name || user.email?.split("@")[0] || "User",
        email: user.email || "user@example.com",
        avatar: null, // Appwrite user doesn't have avatar by default
      }
    : defaultUser;

  // Initialize form data when modal opens or user changes
  const initializeFormData = () => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
    });
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setIsOpen(false);
      setShowLogoutModal(false);
      navigate("/", { replace: true });
    } catch (error) {

      toast.error("Failed to logout. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Updating profile...");

    try {
      // Update name if changed
      if (formData.name !== currentUser.name) {
        await userService.updateName(formData.name);
      }

      // Note: Email updates in Appwrite require additional verification
      // For now, we'll just update the name
      if (formData.email !== currentUser.email) {
        toast.dismiss(loadingToast);
        toast.error(
          "Email updates require verification. Contact support to change your email."
        );
        return;
      }

      // Get updated user data
      const updatedUser = await userService.getCurrentUser();
      updateUserInContext(updatedUser);

      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {

      toast.dismiss(loadingToast);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    initializeFormData(); // Reset form data
  };

  return (
    <>
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: "#4F70E2" }}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (() => {
                const initials = currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                return initials.length <= 2 ? initials : initials.slice(0, 2);
              })()
            )}
          </div>
          <span className="text-white font-medium hidden md:block">
            {currentUser.name}
          </span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-64 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-50"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: "#4F70E2" }}
                  >
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (() => {
                        const initials = currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("");
                        return initials.length <= 2 ? initials : initials.slice(0, 2);
                      })()
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{currentUser.name}</p>
                    <p className="text-gray-400 text-sm">{currentUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>View Profile</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                
                <hr className="my-2 border-white/10" />
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowProfileModal(false);
              setIsEditing(false);
              initializeFormData();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Profile Settings
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      initializeFormData();
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit Profile"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-medium"
                      style={{ backgroundColor: "#4F70E2" }}
                    >
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (() => {
                          const initials = currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("");
                          return initials.length <= 2 ? initials : initials.slice(0, 2);
                        })()
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                        {currentUser.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Enter your email"
                          disabled
                          title="Email changes require verification"
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                          {currentUser.email}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {/* Email changes require verification */}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading || !formData.name.trim()}
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowProfileModal(false);
                        setIsEditing(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your notes."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
        isLoading={logoutLoading}
      />
    </>
  );
};

export default ProfileDropdown;

