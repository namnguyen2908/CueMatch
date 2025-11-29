import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ErrorToast from "../components/ErrorToast/ErrorToast";
import {
  Users,
  MapPin,
  Phone,
  Clock,
  Bookmark,
} from "lucide-react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import RightBar from "../components/Sidebar/RightBar";
import PostDetailModal from "../components/postDetail/PostDetailModal";
import PostCard from "../components/Post/PostCard";
import searchApi from "../api/searchApi";
import { createConversation } from "../api/messageApi";
import { useChat } from "../contexts/ChatContext";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitWithHighlights = (text, query) => {
  if (!text) return [{ text: "", highlight: false }];
  if (!query) return [{ text, highlight: false }];

  const regex = new RegExp(escapeRegExp(query), "ig");
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        highlight: false,
      });
    }
    segments.push({ text: match[0], highlight: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  return segments.length ? segments : [{ text, highlight: false }];
};

const HighlightedText = ({ text, query }) => (
  <>
    {splitWithHighlights(text, query).map((segment, idx) => (
      <span
        key={`${segment.text}-${idx}`}
        className={
          segment.highlight
            ? "bg-sport-100 dark:bg-sport-900/40 text-sport-600 dark:text-sport-300 px-0.5 rounded"
            : undefined
        }
      >
        {segment.text}
      </span>
    ))}
  </>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-10 rounded-2xl border border-dashed border-luxury-200 dark:border-luxury-700 bg-white/70 dark:bg-luxury-900/40">
    <p className="text-sm font-medium text-luxury-500 dark:text-luxury-300">
      {message}
    </p>
  </div>
);

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openChatWith } = useChat();

  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [chattingUserId, setChattingUserId] = useState(null);

  const query = searchParams.get("q") || "";
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  useEffect(() => {
    const fetchResults = async () => {
      if (!trimmedQuery) {
        setUsers([]);
        setClubs([]);
        setPosts([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await searchApi.globalSearch({
          q: trimmedQuery,
          limitUsers: 8,
          limitClubs: 6,
          limitPosts: 12,
        });

        setUsers(res?.users || []);
        setClubs(res?.clubs || []);
        setPosts(res?.posts || []);
      } catch (err) {
        console.error("Failed to search:", err);
        const message =
          err?.response?.data?.message || "Unable to fetch results. Please try again later.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [trimmedQuery, normalizedQuery]);

  const handleViewProfile = (userId) => navigate(`/profile/${userId}`);

  const handleStartChat = async (user) => {
    try {
      setChattingUserId(user._id);
      const res = await createConversation({
        MemberIds: [user._id],
        Type: "single",
      });
      const conversation = res.data;
      openChatWith(user, conversation._id);
    } catch (err) {
      console.error("Unable to open conversation:", err);
      alert("Unable to start a chat right now, please try again.");
    } finally {
      setChattingUserId(null);
    }
  };

  const heroSubtitle = useMemo(() => {
    if (!trimmedQuery) return "Type a keyword to explore players, clubs, and trending posts.";
    if (loading) return `Searching for "${trimmedQuery}"...`;
    if (error) return "Something went wrong, please try searching again.";
    if (users.length === 0 && clubs.length === 0 && posts.length === 0) {
      return `No results for "${trimmedQuery}". Try another keyword.`;
    }
    return `${users.length + clubs.length + posts.length} results for "${trimmedQuery}".`;
  }, [trimmedQuery, loading, error, users.length, clubs.length, posts.length]);

  const renderUserCard = (user) => (
    <motion.div
      key={user._id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-luxury-100 dark:border-luxury-800 bg-white/70 dark:bg-luxury-900/40 hover:border-sport-300 dark:hover:border-sport-600 transition-all"
    >
      <img
        src={user.Avatar || "/default-avatar.png"}
        alt={user.Name}
        className="w-14 h-14 rounded-2xl object-cover border border-luxury-100 dark:border-luxury-700"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-luxury-900 dark:text-luxury-50 text-sm">
          {user.Name}
        </p>
        <p className="text-xs text-luxury-500 dark:text-luxury-400 truncate">
          {user.Email}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleViewProfile(user._id)}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-sport-200 text-sport-600 hover:bg-sport-50 transition"
        >
          View profile
        </button>
        <button
          onClick={() => handleStartChat(user)}
          disabled={chattingUserId === user._id}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-sport-600 to-sport-500 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {chattingUserId === user._id ? "Opening..." : "Message"}
        </button>
      </div>
    </motion.div>
  );

  const renderClubCard = (club) => (
    <motion.div
      key={club._id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-3 p-4 rounded-2xl border border-luxury-100 dark:border-luxury-800 bg-white/80 dark:bg-luxury-900/40 hover:border-sport-300 dark:hover:border-sport-600 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-luxury-900 dark:text-luxury-50">
            {club.Name}
          </p>
          {club.Description && (
        <p className="text-xs text-luxury-500 dark:text-luxury-400 mt-1 line-clamp-2">
          <HighlightedText text={club.Description} query={query} />
        </p>
          )}
        </div>
      </div>
      <div className="text-xs text-luxury-600 dark:text-luxury-400 space-y-1">
        {club.Address && (
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sport-500" />
            <span>
              <HighlightedText text={club.Address} query={query} />
            </span>
          </p>
        )}
        {club.Phone && (
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-sport-500" /> {club.Phone}
          </p>
        )}
        {club.OpenTime && club.CloseTime && (
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sport-500" /> {club.OpenTime} - {club.CloseTime}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/book-table/${club._id}`)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-sport-600 to-sport-500 text-white shadow-sm"
        >
          Book a table
        </button>
      </div>
    </motion.div>
  );

  const ResultSection = ({ title, icon: Icon, count, children }) => (
    <section className="sport-card rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sport-50 dark:bg-sport-900/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-sport-600 dark:text-sport-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-luxury-900 dark:text-luxury-50">
              {title}
            </p>
            <p className="text-xs text-luxury-500 dark:text-luxury-400">
              {count} results
            </p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );

  const handleFriendShortcut = (friend) => {
    handleStartChat(friend);
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-sport-50/30 via-white to-sport-100/30
        dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800 text-luxury-900 dark:text-luxury-100"
    >
      <div className="fixed inset-0 bg-mesh-light/70 dark:bg-mesh-dark/50 pointer-events-none"></div>
      <Header />

      <div className="flex pt-24 relative z-10">
        <div className="hidden lg:block w-[250px]">
          <Sidebar />
        </div>

        <main className="flex-1 mx-auto max-w-4xl px-4 pb-16 space-y-6">
          <section className="sport-card rounded-3xl p-6 max-w-2xl mx-auto">
            <div>
              <p className="text-xs uppercase tracking-wide text-sport-500 font-semibold mb-2">
                Quick search
              </p>
              <h2 className="text-2xl font-bold text-luxury-900 dark:text-white">
                Connect the cue sports community
              </h2>
              <p className="text-sm text-luxury-500 dark:text-luxury-400 mt-1">
                {heroSubtitle}
              </p>
              {!trimmedQuery && (
                <div className="mt-6 rounded-2xl border border-dashed border-sport-200/60 bg-sport-50/60 px-4 py-3 text-sm text-luxury-600 dark:text-luxury-200">
                  Use the search bar at the top of the page to enter a keyword and we will show the results here.
                </div>
              )}
            </div>
          </section>

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-12 h-12 border-4 border-sport-200 border-t-sport-500 rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && trimmedQuery && (
            <div className="max-w-2xl mx-auto space-y-6">
              <ResultSection title="Users" icon={Users} count={users.length}>
                {users.length ? users.map(renderUserCard) : <EmptyState message="No matching users found." />}
              </ResultSection>

              <ResultSection title="Billiards clubs" icon={MapPin} count={clubs.length}>
                {clubs.length ? clubs.map(renderClubCard) : <EmptyState message="No clubs matched your filters." />}
              </ResultSection>

              <section className="space-y-4">
                
                {posts.length ? (
                  <PostCard posts={posts} onPostClick={setSelectedPost} />
                ) : (
                  <EmptyState message="No posts matched this keyword." />
                )}
              </section>
            </div>
          )}

          {!trimmedQuery && !loading && (
            <div className="text-center py-16 space-y-3">
              <h3 className="text-xl font-semibold">Start exploring</h3>
              <p className="text-sm text-luxury-500">
                Use the global search field to discover new players, clubs, and posts.
              </p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 text-sm">{error}</div>
          )}
        </main>

        <div className="hidden xl:block w-[250px]">
          <RightBar onFriendClick={handleFriendShortcut} />
        </div>
      </div>

      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
      {error && <ErrorToast error={error} onClose={() => setError("")} />}
    </div>
  );
};

export default SearchPage;

