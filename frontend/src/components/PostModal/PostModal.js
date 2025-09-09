import React, { useState, useEffect } from 'react';
import { X, Image, Globe, Users, Lock, ChevronDown, Video } from 'lucide-react';
import postApi from '../../api/postApi';
import { useUser } from '../../contexts/UserContext';

const PostModal = ({ isOpen, onClose, onPostCreated, editingPost = null }) => {
  const [Content, setContent] = useState('');
  const [Status, setStatus] = useState('public');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { datauser } = useUser();

  // File media
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([])

  const statusOptions = [
    { value: 'public', icon: Globe, label: 'Public', desc: 'Everyone can see' },
    { value: 'friends', icon: Users, label: 'Friends', desc: 'Only friends can see' },
    { value: 'group', icon: Lock, label: 'Group', desc: 'Only group members can view' }
  ];

  const selectedOption = statusOptions.find(option => option.value === Status);


  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectStatus = (value) => {
    setStatus(value);
    setShowDropdown(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  const removeVideo = (index) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.Content || '');
      setStatus(editingPost.Status || 'public');
      setImageFiles(editingPost.Image || []);
      setVideoFiles(editingPost.Video || []);
    } else {
      setContent('');
      setStatus('public');
      setImageFiles([]);
      setVideoFiles([]);
    }
  }, [editingPost, isOpen]);

  const handleCreatePost = async () => {
    if (!Content.trim()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('Content', Content);
      formData.append('Status', Status);
      imageFiles.forEach((file) => formData.append('Image', file));
      videoFiles.forEach((file) => formData.append('Video', file));

      if (editingPost) {
        await postApi.updatePost(editingPost._id, formData);
      } else {
        await postApi.createPost(formData);
      }

      onClose();
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to submit post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/30 to-orange-400/4 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl rounded-2xl bg-orange-200/20 text-gray-200 shadow-[0_0_30px_rgba(255,215,0,0.05)] border-[2px] border-[#FFB95B] backdrop-blur-xl">


        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-[#FFA200] tracking-wide">
            {editingPost ? 'Edit Post' : 'Create Post'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
            <X size={20} className="text-yellow-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar + Dropdown */}
          <div className="flex items-start space-x-3 mb-4">
            <img
              src={datauser.avatar}
              alt="User"
              className="w-12 h-12 rounded-full border border-yellow-500/20 shadow-sm"
            />
            <div className="flex flex-col">
              <h3 className="font-semibold text-[#FFFFFF]">{datauser.name}</h3>

              <div className="relative mt-1">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-900/30 hover:bg-orange-900/50 rounded-lg text-sm font-medium transition text-yellow-300"
                >
                  <selectedOption.icon size={14} className="text-yellow-400" />
                  <span>{selectedOption.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-[#AFAFAF]/50 border border-yellow-500/20 rounded-xl shadow-xl z-10 w-72 backdrop-blur-md">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => selectStatus(option.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition
                          ${Status === option.value
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                            : 'hover:bg-[#FFE5AE]/30'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${option.value === 'public' ? 'bg-green-900 text-green-400'
                            : option.value === 'friends' ? 'bg-blue-900 text-blue-400'
                              : 'bg-gray-800 text-gray-400'}`}>
                          <option.icon size={18} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-[#442B00]">{option.label}</div>
                          <div className="text-xs font-medium text-black">{option.desc}</div>
                        </div>
                        {Status === option.value && (
                          <div className="w-4 h-4 bg-[#00FF2B]/90 border-[3px] border-[#00FFD5]/40 rounded-full flex items-center justify-center">
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={Content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What’s on your mind?"
            className="w-full min-h-[100px] text-base placeholder-black resize-none focus:outline-none bg-[#FFF0C6]/30 border border-gray-800 rounded-xl p-4 mb-4"
          />

          {/* Media Upload Buttons */}
          <div className="border border-yellow-500/30 rounded-xl p-4 mb-4 bg-[#FFF0C6]/30 backdrop-blur-sm">
            <p className="text-sm font-medium text-black mb-3">Add to your post</p>
            <div className="flex space-x-3 items-center">

              {/* Image Upload */}
              <label htmlFor="image-upload" className="w-10 h-10 flex items-center justify-center bg-[#00C957] hover:bg-green-800 rounded-full cursor-pointer transition">
                <Image size={18} className="text-[#CDFFE3]" />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Show selected image file name + remove button */}
              {imageFiles.map((file, index) => (
                <div className="flex items-center space-x-2 bg-yellow-900/20 rounded px-2 py-1 text-yellow-400 text-sm">
                  <span>{file.name}</span>
                  <button onClick={() => removeImage(index)} className="text-yellow-400 font-bold">&times;</button>
                </div>
              ))}

              {/* Video Upload */}
              <label htmlFor="video-upload" className="w-10 h-10 flex items-center justify-center bg-[#DE5849] hover:bg-red-800 rounded-full cursor-pointer transition">
                <Video size={18} className="text-[#FFBAB2]" />
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>

              {/* Show selected video file name + remove button */}
              {videoFiles.map((file, index) => (
                <div className="flex items-center space-x-2 bg-yellow-900/20 rounded px-2 py-1 text-yellow-400 text-sm">
                  <span>{file.name}</span>
                  <button onClick={() => removeVideo(index)} className="text-yellow-400 font-bold">&times;</button>
                </div>
              ))}

            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreatePost}
            disabled={!Content.trim() || loading}
            className={`w-full py-3 rounded-lg font-semibold transition text-sm
    ${Content.trim() && !loading
                ? 'bg-[#89FFD0] hover:bg-[#00FF9A] text-black shadow-lg opacity-80'
                : 'bg-[#7D7D7D] text-black cursor-not-allowed opacity-50'
              }`}
          >
            {loading ? (editingPost ? 'Updating...' : 'Posting...') : (editingPost ? 'Update' : 'Post')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
