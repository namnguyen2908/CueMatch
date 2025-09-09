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
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      console.error("Lỗi cập nhật hồ sơ:", err);
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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-black/80 via-purple-900/20 to-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900/95 via-slate-800/95 to-gray-900/95 border border-gradient-to-r from-purple-500/30 via-blue-500/30 to-teal-500/30 rounded-3xl shadow-2xl shadow-purple-900/50 overflow-hidden backdrop-blur-sm"
      >      
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-red-500/30"
        >
          <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
        </button>

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mb-4 border border-purple-500/30">
              <User className="w-8 h-8 text-purple-400" />
            </div> */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Edit Profile
            </h2>
            <p className="text-gray-400 text-sm">Update your personal information</p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div
                className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-500 to-blue-500 p-1 cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 rounded-full">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-xs font-medium">Change Photo</span>
                  </div>
                </div>
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 border-4 border-gray-900"
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
            <p className="text-gray-400 text-sm mt-4 text-center">
              Click on the avatar or upload button to change your photo
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="Name"
                  value={formFields.Name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-4 bg-gray-800/50 rounded-xl border border-gray-600/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-white placeholder-gray-400 hover:bg-gray-800/70"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="DateOfBirth"
                  value={formFields.DateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-800/50 rounded-xl border border-gray-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white hover:bg-gray-800/70"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-8 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-full font-medium transition-all duration-300 hover:scale-105 border border-gray-600/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
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