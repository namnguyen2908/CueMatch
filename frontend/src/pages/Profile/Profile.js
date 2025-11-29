import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Mail, Calendar, Eye, Users, MapPin, Award, Target, Clock, Activity } from "lucide-react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import ModalEditProfile from "../../components/ModalEditProfile";
import userApi from "../../api/userApi";
import postApi from "../../api/postApi";
import PostList from "../../components/Post/PostList";
import PostModal from "../../components/PostModal/PostModal";
import PostDetailModal from "../../components/postDetail/PostDetailModal";
import logoImage from '../../assets/cover-profile.jpg';
import BioModal from '../../components/BioModal';
import playerBioApi from "../../api/playerBioApi";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const postListRef = useRef();
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [playerBio, setPlayerBio] = useState(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handlePostClick = (post) => setSelectedPost(post);
  const handleCloseDetailModal = () => setSelectedPost(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getUserDetail();
        setUser(userData);
        console.log(userData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPlayerBio = async () => {
      try {
        const bio = await playerBioApi.getPlayerBioByUserId(user._id);
        setPlayerBio(bio);
      } catch {
        setPlayerBio(null);
      }
    };

    const fetchPostCount = async () => {
      try {
        const posts = await postApi.getMyPosts(0, 1000);
        setPostCount(posts.length);
      } catch (err) {
        console.error("Error counting posts:", err);
        setPostCount(0);
      }
    };

    if (user) {
      fetchPlayerBio();
      fetchPostCount();
    }
  }, [user]);

  const handleSave = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sport-50/30 via-white to-sport-100/20 dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-500 mx-auto mb-4"></div>
          <p className="text-luxury-900 dark:text-luxury-100 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-sport-50/30 via-white to-sport-100/20
      dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800
      text-luxury-900 dark:text-luxury-100
      transition-colors duration-300
      pattern-sport dark:pattern-luxury">
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-50"></div>
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        variant="overlay"
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="pt-20 relative z-0 flex flex-col lg:flex-row">
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 w-full">
        <div className="relative">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="h-80 sm:h-[22rem] w-full overflow-hidden rounded-b-3xl shadow-luxury-lg">
                <img
                  src={logoImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-sport-500/10 to-transparent"></div>
              </div>
            </motion.div>

            <div className="px-4 sm:px-6 pb-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
              >

                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-[6rem]">

                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="relative group"
                  >
                    <div className="relative">

                      <div className="absolute -inset-2 bg-gradient-sport rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-300"></div>

                      <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-3xl border-4 border-white dark:border-luxury-800 overflow-hidden bg-gradient-to-br from-sport-100 to-sport-200 dark:from-luxury-800 dark:to-luxury-900 shadow-luxury-lg ring-4 ring-sport-300/50 dark:ring-sport-700/50">
                        <img
                          src={user.Avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-sport-500/20 to-transparent"></div>
                      </div>

                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white dark:border-luxury-800 shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="sm:pb-4">
                    <h1 className="text-luxury-900 dark:text-luxury-100 text-3xl sm:text-5xl font-bold font-display mb-2">
                      {user.Name}
                    </h1>
                    <div className="flex items-center gap-4 text-luxury-600 dark:text-luxury-400 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-sport-500" />
                        <span className="font-medium">{user?.Friends?.length || 0} friends</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 sm:pb-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-gradient-sport text-white rounded-xl flex items-center gap-2 transition-all font-semibold shadow-sport hover:shadow-sport-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit profile
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="sticky top-[4.5rem] z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="relative overflow-x-auto">
              <div className="flex gap-2 p-2 bg-gray-100 dark:bg-white/5 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl min-w-max">
                {[
                  { id: 'posts', label: 'Posts', icon: Activity },
                  { id: 'about', label: 'About', icon: Target }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-sport text-white shadow-lg shadow-sport-500/25"
                          : "text-luxury-700 dark:text-luxury-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-luxury-900 dark:hover:text-white"
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 ${
                        isActive ? "text-white" : "text-sport-500 dark:text-sport-400"
                      }`} />
                      <span>{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:order-1 space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="sport-card p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sport-500/5 to-transparent"></div>
                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-sport-50 to-sport-100/50 dark:from-sport-900/30 dark:to-sport-800/20 border border-sport-200/50 dark:border-sport-800/50">
                      <p className="text-3xl font-bold text-gradient-sport mb-1">{postCount}</p>
                      <p className="text-xs text-luxury-600 dark:text-luxury-400 uppercase tracking-wider font-semibold">Posts</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-sport-50 to-sport-100/50 dark:from-sport-900/30 dark:to-sport-800/20 border border-sport-200/50 dark:border-sport-800/50">
                      <p className="text-3xl font-bold text-gradient-sport mb-1">{user?.Friends?.length || 0}</p>
                      <p className="text-xs text-luxury-600 dark:text-luxury-400 uppercase tracking-wider font-semibold">Friends</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="sport-card p-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sport-50/0 to-sport-100/0 group-hover:from-sport-50/50 group-hover:to-sport-100/30 dark:group-hover:from-sport-900/20 dark:group-hover:to-sport-800/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-luxury-900 dark:text-luxury-100 text-xl font-bold mb-4 font-display flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-sport rounded-full"></div>
                    Intro
                  </h3>

                  {user.Bio && (
                    <div className="mb-4 p-3 rounded-lg bg-sport-50/50 dark:bg-sport-900/20 border border-sport-200/50 dark:border-sport-800/50">
                      <p className="text-luxury-700 dark:text-luxury-300 text-sm leading-relaxed">{user.Bio}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-luxury-700 dark:text-luxury-300 p-2 rounded-lg hover:bg-sport-50/50 dark:hover:bg-sport-900/20 transition-colors">
                      <div className="p-2 rounded-lg bg-sport-100 dark:bg-sport-900/30">
                        <Mail className="w-4 h-4 text-sport-600 dark:text-sport-400" />
                      </div>
                      <span className="text-sm">{user.Email}</span>
                    </div>

                    {user.DateOfBirth && (
                      <div className="flex items-center gap-3 text-luxury-700 dark:text-luxury-300 p-2 rounded-lg hover:bg-sport-50/50 dark:hover:bg-sport-900/20 transition-colors">
                        <div className="p-2 rounded-lg bg-sport-100 dark:bg-sport-900/30">
                          <Calendar className="w-4 h-4 text-sport-600 dark:text-sport-400" />
                        </div>
                        <span className="text-sm">Born {new Date(user.DateOfBirth).toLocaleDateString("en-US", {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2 lg:order-2 space-y-4">
              <AnimatePresence mode="wait">
                {activeTab === 'posts' && (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostList
                      isProfile
                      ref={postListRef}
                      onEdit={setEditingPost}
                      onDelete={() => {
                        postListRef.current?.reloadPosts();
                        setTimeout(async () => {
                          try {
                            const posts = await postApi.getMyPosts(0, 1000);
                            setPostCount(posts.length);
                          } catch (err) {
                            console.error("Error updating post count:", err);
                          }
                        }, 500);
                      }}
                      onPostClick={handlePostClick}
                    />
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="sport-card p-6 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-sport-50/0 to-sport-100/0 group-hover:from-sport-50/50 group-hover:to-sport-100/30 dark:group-hover:from-sport-900/20 dark:group-hover:to-sport-800/10 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <h2 className="text-luxury-900 dark:text-luxury-100 text-2xl font-bold mb-6 font-display flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-sport rounded-full"></div>
                        About
                      </h2>
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-sport-50/50 dark:bg-sport-900/20 border border-sport-200/50 dark:border-sport-800/50">
                          <h3 className="text-luxury-900 dark:text-luxury-100 font-semibold mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-sport-500" />
                            Contact Info
                          </h3>
                          <div className="space-y-3 text-luxury-700 dark:text-luxury-300">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white dark:bg-luxury-800">
                                <Mail className="w-4 h-4 text-sport-500" />
                              </div>
                              <span className="text-sm">{user.Email}</span>
                            </div>
                            {user.DateOfBirth && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white dark:bg-luxury-800">
                                  <Calendar className="w-4 h-4 text-sport-500" />
                                </div>
                                <span className="text-sm">Born {new Date(user.DateOfBirth).toLocaleDateString("en-US", {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {playerBio && (
                          <div className="p-4 rounded-xl bg-sport-50/50 dark:bg-sport-900/20 border border-sport-200/50 dark:border-sport-800/50">
                            <h3 className="text-luxury-900 dark:text-luxury-100 font-semibold mb-4 flex items-center gap-2">
                              <Target className="w-5 h-5 text-sport-500" />
                              Player Bio
                            </h3>
                            <div className="text-luxury-700 dark:text-luxury-300 space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Award className="w-4 h-4 text-sport-500" />
                                  <strong className="text-luxury-900 dark:text-luxury-100">Play Styles:</strong>
                                </div>
                                <div className="flex flex-wrap gap-2 ml-6">
                                  {playerBio.PlayStyles.map((ps) => (
                                    <span key={ps.PlayType} className="px-3 py-1 bg-gradient-sport text-white text-xs font-semibold rounded-full shadow-glow-orange">
                                      {ps.PlayType} — Level {ps.Rank}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-sport-500 mt-1" />
                                <div>
                                  <strong className="text-luxury-900 dark:text-luxury-100">Available:</strong>
                                  <p className="text-sm">{playerBio.AvailableTimes.join(', ')}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Target className="w-4 h-4 text-sport-500 mt-1" />
                                <div>
                                  <strong className="text-luxury-900 dark:text-luxury-100">Goals:</strong>
                                  <p className="text-sm">{playerBio.PlayGoals.join(', ')}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-sport-500 mt-1" />
                                <div>
                                  <strong className="text-luxury-900 dark:text-luxury-100">Address:</strong>
                                  <p className="text-sm">
                                    {playerBio.Address.Ward && `Ward ${playerBio.Address.Ward}, `}
                                    {playerBio.Address.District && `District ${playerBio.Address.District}, `}
                                    {playerBio.Address.City && playerBio.Address.City}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsBioModalOpen(true)}
                          className="w-full px-4 py-3 bg-gradient-sport text-white rounded-xl transition-all font-semibold shadow-sport hover:shadow-sport-lg flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          {playerBio ? 'Edit Bio' : 'Create Bio'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        </div>
      </div>

      <ModalEditProfile
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={user}
        onSave={handleSave}
      />
      <PostModal
        isOpen={!!editingPost}
        editingPost={editingPost}
        onClose={() => setEditingPost(null)}
        onPostCreated={async () => {
          postListRef.current?.reloadPosts();
          setEditingPost(null);
          try {
            const posts = await postApi.getMyPosts(0, 1000);
            setPostCount(posts.length);
          } catch (err) {
            console.error("Error updating post count:", err);
          }
        }}
      />
      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={handleCloseDetailModal}
      />
      <BioModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        initialData={playerBio}
        onSubmit={async (formData) => {
          try {
            if (playerBio) {
              await playerBioApi.updatePlayerBio(formData);
            } else {
              await playerBioApi.createPlayerBio(formData);
            }
            const newBio = await playerBioApi.getPlayerBioByUserId(user._id);
            setPlayerBio(newBio);
          } catch (err) {
            console.error("Error updating player bio:", err);
          }
        }}
      />
    </div>
  );
};

export default Profile;