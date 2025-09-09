import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import PostList from "../../components/Post/PostList";
import PostDetailModal from "../../components/postDetail/PostDetailModal";
import userApi from "../../api/userApi";
import logoImage from "../../assets/cover-profile.jpg";
import { useUser } from "../../contexts/UserContext";
import friendApi from "../../api/friendApi";
import { useChat } from "../../contexts/ChatContext";
import { createConversation } from "../../api/messageApi";

const ProfileOther = () => {
    const { userId } = useParams(); // URL có dạng: /profile/:userId
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [selectedPost, setSelectedPost] = useState(null);
    const { datauser } = useUser();
    const { openChatWith } = useChat();
    const [relationshipStatus, setRelationshipStatus] = useState("none");

    const postListRef = useRef();

    useEffect(() => {
        const fetchRelationshipStatus = async () => {
            try {
                const [sentRes, receivedRes] = await Promise.all([
                    friendApi.getSentRequests(),
                    friendApi.getReceivedRequests(),
                ]);

                const isFriend = user?.Friends?.includes(datauser.id);
                if (isFriend) {
                    setRelationshipStatus("friends");
                    return;
                }

                const sentRequest = sentRes.data.find(r => r.To._id === userId);
                if (sentRequest) {
                    setRelationshipStatus("sent");
                    return;
                }

                const receivedRequest = receivedRes.data.find(r => r.From._id === userId);
                if (receivedRequest) {
                    setRelationshipStatus("received");
                    return;
                }

                setRelationshipStatus("none");
            } catch (error) {
                console.error("Failed to fetch relationship status:", error);
            }
        };

        if (userId && datauser?.id) {
            fetchRelationshipStatus();
        }
    }, [userId, user, datauser]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userApi.getUserDetail(userId); // pass userId
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        fetchUser();
    }, [userId]);

    const handleMessageClick = async () => {
        try {
            const res = await createConversation({ MemberIds: [user._id], Type: 'single' });
            const conversation = res.data;
            openChatWith(user, conversation._id); // mở chatbox
        } catch (err) {
            console.error("Lỗi khi tạo/lấy conversation:", err);
        }
    };

    const handleSendFriendRequest = async () => {
        try {
            await friendApi.sendFriendRequest(userId);
            setRelationshipStatus("sent");
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancelFriendRequest = async () => {
        try {
            await friendApi.cancelFriendRequest(userId);
            setRelationshipStatus("none");
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptFriendRequest = async () => {
        try {
            await friendApi.acceptFriendRequest(userId);
            setRelationshipStatus("friends");
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectFriendRequest = async () => {
        try {
            await friendApi.rejectFriendRequest(userId);
            setRelationshipStatus("none");
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnfriend = async () => {
        try {
            await friendApi.unfriend(userId);
            setRelationshipStatus("none");
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#18191a] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-900 dark:text-[#e4e6ea] text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#18191a]">
            <Header />

            {/* Cover Photo */}
            <div className="bg-gray-200 dark:bg-[#242526] border-b border-gray-300 dark:border-[#3a3b3c] pb-[1rem]">
                <div className="max-w-5xl mx-auto">
                    <div className="relative">
                        <div className="h-96 w-full overflow-hidden rounded-b-lg relative">
                            <img
                                src={logoImage}
                                alt="Cover"
                                className="w-full h-full object-cover brightness-[0.75]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#00000099] to-transparent" />
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 sm:px-6 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-end flex-wrap sm:justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 sm:-mt-[5.5rem] sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
                                <div className="relative">
                                    <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-gray-100 dark:border-[#18191a] overflow-hidden bg-gray-400 dark:bg-[#3a3b3c] shadow-[0_0_0_4px_#242526]">
                                        <img src={user.Avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="sm:pb-4 min-w-0">
                                    <h1
                                        className="text-gray-900 dark:text-[#e4e6ea] text-2xl sm:text-3xl font-bold mb-2 w-fit"
                                    >
                                        {user.Name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-[#b0b3b8] text-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span>{user?.Friends?.length} Follows</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action: Message / Follow */}
                            <div className="flex gap-3 sm:pb-4">
                                <button
                                    onClick={handleMessageClick}
                                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
                                >
                                    Message
                                </button>
                                {relationshipStatus === "friends" && (
                                    <button
                                        onClick={handleUnfriend}
                                        className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold border border-gray-300 dark:border-[#4e4f50] transition"
                                    >
                                        Unfriend
                                    </button>
                                )}

                                {relationshipStatus === "sent" && (
                                    <button
                                        onClick={handleCancelFriendRequest}
                                        className="px-5 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold border border-gray-300 dark:border-[#4e4f50] transition"
                                    >
                                        Cancel Request
                                    </button>
                                )}

                                {relationshipStatus === "received" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAcceptFriendRequest}
                                            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold border border-gray-300 dark:border-[#4e4f50] transition"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={handleRejectFriendRequest}
                                            className="px-5 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold border border-gray-300 dark:border-[#4e4f50] transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {relationshipStatus === "none" && (
                                    <button
                                        onClick={handleSendFriendRequest}
                                        className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold border border-gray-300 dark:border-[#4e4f50] transition"
                                    >
                                        Add Friend
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-2 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column: user info */}
                <div className="md:col-span-1 bg-gray-100 dark:bg-[#242526] rounded-xl p-6 shadow-lg h-fit sticky top-24">
                    <h2 className="text-gray-900 dark:text-[#e4e6ea] text-2xl font-bold mb-6">About</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-gray-900 dark:text-[#e4e6ea] font-semibold mb-2">📧 Email</h3>
                            <p className="text-gray-700 dark:text-[#b0b3b8]">{user.Email}</p>
                        </div>

                        {user.DateOfBirth && (
                            <div>
                                <h3 className="text-gray-900 dark:text-[#e4e6ea] font-semibold mb-2">🎂 Date of Birth</h3>
                                <p className="text-gray-700 dark:text-[#b0b3b8]">
                                    {new Date(user.DateOfBirth).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        )}

                        {user.Bio && (
                            <div>
                                <h3 className="text-gray-900 dark:text-[#e4e6ea] font-semibold mb-2">📝 Bio</h3>
                                <p className="text-gray-700 dark:text-[#b0b3b8]">{user.Bio}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: post list */}
                <div className="md:col-span-2 space-y-6">
                    <PostList
                        isProfile
                        ref={postListRef}
                        userId={userId}
                        onPostClick={setSelectedPost}
                    />
                </div>
            </div>

            {/* Modal post detail */}
            <PostDetailModal
                post={selectedPost}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
            />
        </div>
    );
};

export default ProfileOther;
