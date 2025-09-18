// src/components/RightBar.jsx
import React, { useEffect, useState } from "react";
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
    <aside className="fixed top-[5.7rem] bottom-0 right-0 w-60
      bg-[#F2F4F7] dark:bg-[#242424] 
      flex flex-col justify-between py-2 px-4
      text-black dark:text-orange-200 transition-colors duration-300"
    >
      <div className="flex flex-col justify-start h-full overflow-y-auto">
        {/* Friends List */}
        <div>
          <h3 className="text-yellow-400 text-xs font-semibold mt-6 mb-3 ml-1 uppercase tracking-widest">
            Friends
          </h3>

          <div className="space-y-1">
            {friends.map((friend) => (
              <button
                key={friend._id}
                onClick={() => onFriendClick(friend)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-500/10 transition-colors"
              >
                <div className="relative">
                  <img
                    src={friend.Avatar || "/default-avatar.png"}
                    alt={friend.Name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${onlineUsers.has(friend._id) ? "bg-green-400" : "bg-gray-400"}`}/>
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-gray-900 dark:text-orange-100">
                    {friend.Name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {onlineUsers.has(friend._id) ? "Online" : "Offline"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>


        {/* Upcoming Matches */}
        <div className="mt-6">
          <h3 className="text-green-500 text-sm font-semibold mb-2 ml-1">Upcoming Matches</h3>
          <div className="space-y-2">
            {upcomingMatches.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">No matches</p>
            ) : (
              upcomingMatches.map((match, index) => {
                const isUserFrom = match.From._id === datauser.id;
                const opponent = isUserFrom ? match.To : match.From;
                const dateFormatted = DateTime.fromISO(match.MatchDate).toFormat('dd/MM/yyyy');
                const timeStr = `${match.TimeStart} - ${match.TimeEnd}`;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white dark:bg-[#1f1f1f] p-2 rounded-lg shadow text-xs"
                  >
                    <img
                      src={opponent.Avatar || "/default-avatar.png"}
                      alt={opponent.Name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>

                      <p className="font-medium">{opponent.Name}</p>
                      <p className="text-[10px] italic text-gray-500 dark:text-gray-400">
                        {match.PlayType}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                        {dateFormatted} | {timeStr}
                      </p>

                    </div>
                  </div>
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