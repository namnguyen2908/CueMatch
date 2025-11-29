import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Globe, Users, ChevronDown, Video, Trash2 } from 'lucide-react';
import postApi from '../../api/postApi';
import { useUser } from '../../contexts/UserContext';
import ErrorToast from '../ErrorToast/ErrorToast';

const PostModal = ({ isOpen, onClose, onPostCreated, editingPost = null }) => {
  const [Content, setContent] = useState('');
  const [Status, setStatus] = useState('public');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { datauser } = useUser();

  // Media states
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const statusOptions = [
    { value: 'public', icon: Globe, label: 'Public', desc: 'Everyone can see' },
    { value: 'friends', icon: Users, label: 'Friends', desc: 'Only friends can see' },
  ];

  const selectedOption = statusOptions.find(option => option.value === Status);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const selectStatus = (value) => {
    setStatus(value);
    setShowDropdown(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    
    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > MAX_IMAGE_SIZE);
    if (invalidFiles.length > 0) {
      setError(`Image file size must be less than 10MB. ${invalidFiles.length} file(s) exceeded the limit.`);
      return;
    }
    
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    
    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > MAX_VIDEO_SIZE);
    if (invalidFiles.length > 0) {
      setError(`Video file size must be less than 100MB. ${invalidFiles.length} file(s) exceeded the limit.`);
      return;
    }
    
    setVideoFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews(prev => [...prev, { url: reader.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setError(null);

    if (editingPost) {
      setContent(editingPost.Content || '');
      setStatus(editingPost.Status || 'public');
      // Handle existing images/videos from editing
      if (editingPost.Image && Array.isArray(editingPost.Image)) {
        setImagePreviews(editingPost.Image);
      }
      if (editingPost.Video && Array.isArray(editingPost.Video)) {
        setVideoPreviews(editingPost.Video.map(v => ({ url: v, file: null })));
      }
    } else {
      setContent('');
      setStatus('public');
      setImageFiles([]);
      setVideoFiles([]);
      setImagePreviews([]);
      setVideoPreviews([]);
    }
  }, [editingPost, isOpen]);

  const handleCreatePost = async () => {
    if (!Content.trim() && imageFiles.length === 0 && videoFiles.length === 0) return;
    setLoading(true);
    setError(null);

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
      console.error('❌ Failed to submit post:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPost ? 'Edit Post' : 'Create Post'}
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Avatar + Dropdown */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={datauser?.avatar}
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {datauser?.name}
                  </h3>

                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition text-gray-700 dark:text-gray-300"
                    >
                      <selectedOption.icon size={16} />
                      <span>{selectedOption.label}</span>
                      <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 w-72">
                        {statusOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => selectStatus(option.value)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition
                                ${Status === option.value
                                  ? 'bg-gray-100 dark:bg-gray-700'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                ${option.value === 'public'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                              </div>
                              {Status === option.value && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={Content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[120px] text-base placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none bg-transparent border-none rounded-xl p-0 mb-4 text-gray-900 dark:text-white"
              />

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className={`grid gap-3 ${
                    imagePreviews.length === 1 ? 'grid-cols-1' :
                    imagePreviews.length === 2 ? 'grid-cols-2' :
                    'grid-cols-3'
                  }`}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Previews */}
              {videoPreviews.length > 0 && (
                <div className="mb-4 space-y-3">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <video
                        src={preview.url}
                        controls
                        className="w-full h-auto max-h-96"
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Media Upload Buttons */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Add to your post
                </p>
                <div className="flex gap-3 items-center">
                  {/* Image Upload */}
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition font-medium text-sm"
                  >
                    <Image size={18} />
                    <span>Photo</span>
                    <input
                      ref={imageInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Video Upload */}
                  <label
                    htmlFor="video-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer transition font-medium text-sm"
                  >
                    <Video size={18} />
                    <span>Video</span>
                    <input
                      ref={videoInputRef}
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCreatePost}
                disabled={(!Content.trim() && imageFiles.length === 0 && videoFiles.length === 0) || loading}
                className={`w-full py-3 rounded-lg font-semibold transition text-sm
                  ${(Content.trim() || imageFiles.length > 0 || videoFiles.length > 0) && !loading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
              >
                {loading ? (editingPost ? 'Updating...' : 'Posting...') : (editingPost ? 'Update' : 'Post')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorToast error={error} onClose={() => setError(null)} />
    </>
  );
};

export default PostModal;
