import React, { useState } from 'react';
import { X, Image, Globe, Users, Lock, ChevronDown, Video } from 'lucide-react';
import postApi from '../../api/postApi';

const PostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [Content, setContent] = useState('');
  const [Status, setStatus] = useState('public');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'public', icon: Globe, label: 'Public', desc: 'Everyone can see' },
    { value: 'friends', icon: Users, label: 'Friends', desc: 'Only friends can see' },
    { value: 'group', icon: Lock, label: 'Group', desc: 'Only group members can view' }
  ];

  const selectedOption = statusOptions.find(option => option.value === Status);
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectStatus = (value) => {
    setStatus(value);
    setShowDropdown(false);
  };

  const handleCreatePost = async () => {
    if (!Content.trim()) return;
    setLoading(true);

    try {
      const postData = { Content, Status };
      await postApi.createPost(postData);

      setContent('');
      setStatus('public');
      onClose();
      onPostCreated?.();
    } catch (error) {
      console.log('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={handleBackdropClick}>
      <div className="w-full max-w-xl rounded-2xl bg-[#111] text-gray-200 shadow-[0_0_30px_rgba(255,215,0,0.05)] border border-yellow-500/10 backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-yellow-400 tracking-wide">Create Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar + Dropdown */}
          <div className="flex items-start space-x-3 mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
              alt="User"
              className="w-12 h-12 rounded-full border border-yellow-500/20 shadow-sm"
            />
            <div className="flex flex-col">
              <h3 className="font-semibold">Nguyễn Văn A</h3>

              <div className="relative mt-1">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#2a2a2a] rounded-lg text-sm font-medium transition text-gray-300"
                >
                  <selectedOption.icon size={14} className="text-yellow-400" />
                  <span>{selectedOption.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl z-10 w-72">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => selectStatus(option.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition
                          ${Status === option.value
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                            : 'hover:bg-[#2a2a2a]'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${option.value === 'public' ? 'bg-green-900 text-green-400'
                            : option.value === 'friends' ? 'bg-blue-900 text-blue-400'
                              : 'bg-gray-800 text-gray-400'}`}>
                          <option.icon size={18} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-400">{option.desc}</div>
                        </div>
                        {Status === option.value && (
                          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#111] rounded-full"></div>
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
            className="w-full min-h-[100px] text-base placeholder-gray-500 resize-none focus:outline-none bg-transparent border border-gray-800 rounded-xl p-4 mb-4"
          />

          {/* Media Buttons */}
          <div className="border border-gray-700 rounded-xl p-4 mb-4 bg-[#1a1a1a]">
            <p className="text-sm font-medium text-gray-400 mb-3">Add to your post</p>
            <div className="flex space-x-3">
              <button className="w-10 h-10 flex items-center justify-center bg-green-900 hover:bg-green-800 rounded-full transition">
                <Image size={18} className="text-green-400" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-red-900 hover:bg-red-800 rounded-full transition">
                <Video size={18} className="text-red-400" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreatePost}
            disabled={!Content.trim() || loading}
            className={`w-full py-3 rounded-lg font-semibold transition text-sm
              ${Content.trim() && !loading
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
