import React, { useEffect, useState } from "react";
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import savedApi from "../api/savedApi";
import { Loader2 } from "lucide-react";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    try {
      const res = await savedApi.getSavedPosts();
      setSavedPosts(res.savedPosts || []);
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f7f9fc] dark:bg-[#1a1a1a] text-black dark:text-white">
      <Sidebar />

      <div className="flex-1 ml-60">
        <Header />
        <main className="pt-[6.5rem] px-6 pb-10">
          <h2 className="text-3xl font-bold mb-6 text-orange-600 dark:text-yellow-300">Saved Posts</h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            </div>
          ) : savedPosts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">You haven’t saved any posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedPosts.map((item) => (
                <div key={item._id} className="bg-white dark:bg-[#2b2b2b] rounded-lg shadow-md p-4 transition hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={item.PostID?.UserID?.Avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{item.PostID?.UserID?.Name}</p>
                      <p className="text-sm text-gray-500">{new Date(item.PostID?.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="mb-2 text-[15px] text-gray-800 dark:text-gray-300">{item.PostID?.Content}</p>

                  {item.PostID?.Image?.length > 0 && (
                    <div className="mt-2">
                      <img
                        src={item.PostID.Image[0]}
                        alt="Post"
                        className="rounded-md w-full max-h-80 object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedPosts;