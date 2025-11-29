import React, { useState, useEffect, useRef } from "react";
import { X, UploadCloud, User, Calendar, Camera } from "lucide-react";
import userApi from "../api/userApi";

const ModalEditProfile = ({ isOpen, onClose, userData, onSave }) => {
  const [formFields, setFormFields] = useState({
    Name: "",
    DateOfBirth: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    if (userData) {
      setFormFields({
        Name: userData.Name || "",
        DateOfBirth: userData.DateOfBirth?.slice(0, 10) || "",
      });
      setPreviewImage(userData.Avatar);
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    
    // Check file size (5MB max for avatar)
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_AVATAR_SIZE) {
      alert("Image file size must be less than 5MB");
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      if (formFields.Name) formData.append("Name", formFields.Name);
      if (formFields.DateOfBirth) formData.append("DateOfBirth", formFields.DateOfBirth);
      if (selectedFile) formData.append("Avatar", selectedFile);

      const updatedUser = await userApi.updateUser(formData);
      onSave(updatedUser);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Đóng khi click bên ngoài modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl"
      >      
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Edit Profile
            </h2>
            <p className="text-gray-500 text-sm">Update your personal information</p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-300 cursor-pointer bg-gray-50"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white"
              >
                <UploadCloud className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-gray-500 text-sm mt-4 text-center">
              Click on the avatar or upload button to change your photo
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Full Name
              </label>
              <input
                type="text"
                name="Name"
                value={formFields.Name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-600 text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Date of Birth
              </label>
              <input
                type="date"
                name="DateOfBirth"
                value={formFields.DateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-600 text-gray-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditProfile;