import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";

const ModalEditProfile = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState(userData);
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    setFormData(userData);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalContentRef}
        className="relative w-full max-w-xl bg-[#1a1a1a] border border-yellow-500/30 rounded-2xl p-8 shadow-2xl text-gray-100 animate-fade-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-300"
        >
          <X />
        </button>

        <h2 className="text-2xl font-extrabold text-yellow-300 mb-6 text-center">
          🛠️ Edit Your Profile
        </h2>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-md mb-3 cursor-pointer group"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={formData.Avatar}
              alt="Avatar Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <UploadCloud className="text-yellow-300 w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-400">Click avatar to upload a new image</p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.Name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#111] rounded-md border border-yellow-500/20 focus:outline-none focus:ring focus:ring-yellow-400/30"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.DateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#111] rounded-md border border-yellow-500/20 focus:outline-none focus:ring focus:ring-yellow-400/30"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Rank</label>
            <select
              name="rank"
              value={formData.rank || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#111] rounded-md border border-yellow-500/20 focus:outline-none focus:ring focus:ring-yellow-400/30"
            >
              <option value="">-- Select Rank --</option>
              <option value="Amateur">Amateur</option>
              <option value="Semi-Pro">Semi-Pro</option>
              <option value="Pro">Pro</option>
              <option value="World Class">World Class</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 text-sm rounded-full hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-yellow-400/10 text-yellow-200 border border-yellow-400 rounded-full hover:bg-yellow-500/20 transition shadow hover:shadow-yellow-400/40 text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditProfile;
