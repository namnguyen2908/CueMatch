// src/components/RightBar.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Clock } from "lucide-react";
import friendApi from "../../api/friendApi";
import matchingApi from "../../api/matchingApi";
import { useUser } from "../../contexts/UserContext"; // 👈 Thêm dòng này để lấy user login
import { DateTime } from 'luxon';
import { useOnlineStatus } from "../../contexts/StatusContext";

const RightBar = ({ onFriendClick }) => {
  const [friends, setFriends] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  const { datauser } = useUser(); // 👈 Lấy user đang đăng nhập
  const { onlineUsers } = useOnlineStatus();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };

    const fetchUpcomingMatches = async () => {
      try {
        const res = await matchingApi.getUpcomingMatches();
        setUpcomingMatches(res);
      } catch (err) {
        console.error("Failed to fetch upcoming matches:", err);
      }
    };

    fetchFriends();
    fetchUpcomingMatches();
  }, []);

  return (
    <aside className="hidden xl:flex xl:fixed top-[4.5rem] bottom-0 right-0 w-[250px]
      bg-white/90 dark:bg-luxury-800/90
      backdrop-blur-xl
      border-l border-sport-200/30 dark:border-sport-800/30
      flex flex-col py-6 px-4
      text-luxury-900 dark:text-luxury-200 transition-colors duration-300 overflow-y-auto
      shadow-luxury z-10"
    >
      <div className="flex flex-col gap-8 h-full">
        {/* Friends List */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sport-400 to-sport-500 flex items-center justify-center shadow-sport">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-luxury-800 dark:text-luxury-200 font-display">
              Friends
            </h3>
            <span className="ml-auto badge-sport">
              {friends.length}
            </span>
          </div>

          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-8 px-4 bg-luxury-50/50 dark:bg-luxury-900/50 rounded-xl border border-luxury-200/50 dark:border-luxury-700/50">
                <Users className="w-12 h-12 text-luxury-300 dark:text-luxury-600 mx-auto mb-2" />
                <p className="text-xs text-luxury-500 dark:text-luxury-400">No friends yet</p>
              </div>
            ) : (
              friends.map((friend, index) => (
                <motion.button
                  key={friend._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFriendClick(friend)}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl 
                    hover:bg-sport-50/50 dark:hover:bg-sport-900/10 
                    border border-transparent hover:border-sport-200/50 dark:hover:border-sport-800/50
                    transition-all duration-200 group
                    bg-luxury-50/30 dark:bg-luxury-900/30"
                >
                  <div className="relative">
                    <img
                      src={friend.Avatar || "/default-avatar.png"}
                      alt={friend.Name}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-luxury-200 dark:border-luxury-700 group-hover:border-sport-300 dark:group-hover:border-sport-600 transition-colors shadow-sm group-hover:shadow-md ring-2 ring-transparent group-hover:ring-sport-200/50 dark:group-hover:ring-sport-800/50"
                    />
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-luxury-900 ${
                      onlineUsers.has(friend._id) 
                        ? "bg-green-500 shadow-lg shadow-green-500/50 ring-2 ring-green-400/50" 
                        : "bg-gray-400"
                    }`}/>
                  </div>

                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-semibold text-luxury-900 dark:text-luxury-100 truncate w-full font-display">
                      {friend.Name}
                    </span>
                    <span className={`text-xs ${
                      onlineUsers.has(friend._id)
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-luxury-500 dark:text-luxury-400"
                    }`}>
                      {onlineUsers.has(friend._id) ? "● Online" : "○ Offline"}
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-md">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-luxury-800 dark:text-luxury-200 font-display">
              Upcoming Matches
            </h3>
            <span className="ml-auto text-xs text-white bg-gradient-to-r from-green-500 to-green-600 px-2.5 py-1 rounded-full font-semibold shadow-sm">
              {upcomingMatches.length}
            </span>
          </div>
          <div className="space-y-3">
            {upcomingMatches.length === 0 ? (
              <div className="text-center py-8 px-4 bg-luxury-50/50 dark:bg-luxury-900/50 rounded-xl border border-luxury-200/50 dark:border-luxury-700/50">
                <Calendar className="w-12 h-12 text-luxury-300 dark:text-luxury-600 mx-auto mb-2" />
                <p className="text-xs text-luxury-500 dark:text-luxury-400">No upcoming matches</p>
              </div>
            ) : (
              upcomingMatches.map((match, index) => {
                const isUserFrom = match.From._id === datauser.id;
                const opponent = isUserFrom ? match.To : match.From;
                const dateFormatted = DateTime.fromISO(match.MatchDate).toFormat('dd/MM/yyyy');
                const timeStr = `${match.TimeStart} - ${match.TimeEnd}`;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="sport-card
                      rounded-xl p-4
                      hover:border-sport-300 dark:hover:border-sport-700 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={opponent.Avatar || "/default-avatar.png"}
                        alt={opponent.Name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-green-300 dark:border-green-700 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-luxury-900 dark:text-luxury-100 truncate font-display">
                          {opponent.Name}
                        </p>
                        <p className="text-xs text-sport-600 dark:text-sport-400 font-medium mt-0.5">
                          {match.PlayType}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-luxury-500 dark:text-luxury-400">
                          <Clock className="w-3 h-3" />
                          <span>{dateFormatted}</span>
                          <span>•</span>
                          <span>{timeStr}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightBar;