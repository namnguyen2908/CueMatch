import React, { useState } from 'react';
import { X, Image, Globe, Users, Lock, ChevronDown, Video } from 'lucide-react';
import postApi from '../../api/postApi';

const PostModal = ({ isOpen, onClose }) => {
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

  const selectStatus = (value) => {
    setStatus(value);
    setShowDropdown(false);
  };

  const handleCreatePost = async () => {
    if (!Content.trim()) return;
    setLoading(true);

    try {
      const postData = {
        Content,
        Status
        // Image: '', // thêm sau nếu bạn có upload ảnh
        // GroupID: '', // nếu status là "group", cần truyền thêm GroupID
      };

      await postApi.createPost(postData);
      setContent('');
      setStatus('public');
      onClose(); // đóng modal
    } catch (error) {
      console.log('Failed to create post');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">New Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
              alt="User"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">Nguyễn Văn A</h3>

              {/* Custom Dropdown */}
              <div className="relative mt-2">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <selectedOption.icon size={16} className="text-gray-600" />
                  <span className="text-gray-700">{selectedOption.label}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[280px]">
                    <div className="p-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => selectStatus(option.value)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${Status === option.value ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${option.value === 'public' ? 'bg-green-100' :
                            option.value === 'friends' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                            <option.icon size={18} className={`${option.value === 'public' ? 'text-green-600' :
                              option.value === 'friends' ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.desc}</div>
                          </div>
                          {Status === option.value && (
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            value={Content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you thinking?"
            className="w-full min-h-[120px] text-lg placeholder-gray-500 resize-none focus:outline-none mb-4"
          />

          {/* Add Photo Button */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Add to post</p>

            {/* Container flex để xếp các nút nằm ngang */}
            <div className="flex space-x-3">
              <button className="flex items-center justify-center w-10 h-10 bg-green-100 hover:bg-green-200 rounded-full">
                <Image size={20} className="text-green-600" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-200">
                <Video size={20} className="text-red-600" />
              </button>
            </div>
          </div>


          {/* Post Button */}
          <button
            onClick={handleCreatePost}
            disabled={!Content.trim() || loading}
            className={`w-full py-3 rounded-lg font-medium ${Content.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;