import { useEffect, useState } from "react";
import matchingApi from "../../api/matchingApi";
import playerBioApi from "../../api/playerBioApi";
import { toast } from "react-toastify";

const MatchingChallenge = () => {
  const [playType, setPlayType] = useState("Pool");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [invitationData, setInvitationData] = useState({
    location: "",
    matchDate: "",
    timeStart: "",
    timeEnd: "",
    message: "",
  });
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);
  const [playerBios, setPlayerBios] = useState({});

  const fetchPlayerBio = async (userId) => {
    if (playerBios[userId]) return;

    try {
      const bio = await playerBioApi.getPlayerBioByUserId(userId);
      setPlayerBios((prev) => ({ ...prev, [userId]: bio }));
    } catch (error) {
      console.error("Lỗi khi tải player bio:", error);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await matchingApi.getPlayerList(playType);
      setPlayers(data);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách người chơi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [playType]);

  const handleSendInvitation = async () => {
    if (!selectedPlayer) return;

    const payload = {
      toUser: selectedPlayer.user.id,
      playType: playType,
      ...invitationData,
    };

    try {
      await matchingApi.sendInvitation(payload);
      toast.success("Gửi lời mời thành công!");
      setSelectedPlayer(null);
      setInvitationData({
        location: "",
        matchDate: "",
        timeStart: "",
        timeEnd: "",
        message: "",
      });
    } catch (err) {
      toast.error("Không thể gửi lời mời.");
      console.log(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Tìm đối thủ</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        {["Pool", "Carom", "Snooker"].map((type) => (
          <button
            key={type}
            onClick={() => setPlayType(type)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition duration-200 ${
              playType === type
                ? "bg-gradient-to-r from-[#FFC02C] to-[#FF482C] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-[#FFAF5E] dark:bg-white/10 dark:text-white dark:hover:bg-[#FFCE9C]/65"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Player Cards */}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-300">Đang tải danh sách người chơi...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => {
            const bio = playerBios[player.user.id];
            const playStyle = bio?.PlayStyles?.find((ps) => ps.PlayType === playType);

            return (
              <div
                key={player.user.id}
                className="relative bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow hover:shadow-lg transition p-4"
                onMouseEnter={() => {
                  setHoveredPlayerId(player.user.id);
                  fetchPlayerBio(player.user.id);
                }}
                onMouseLeave={() => setHoveredPlayerId(null)}
              >
                <img
                  src={player.user.avatar || "/placeholder.svg"}
                  alt={player.user.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />

                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{player.user.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
                  Suitability: {player.compatibility}%
                </p>

                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition font-medium text-sm"
                >
                  Send invitation
                </button>

                {hoveredPlayerId === player.user.id && bio && (
                  <div className="absolute top-2 left-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-white/10 z-50 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={bio.User.Avatar || "/placeholder.svg"}
                        alt={bio.User.Name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{bio.User.Name}</p>
                        {playStyle && (
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {playStyle.PlayType}: Hạng {playStyle.Rank}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <span className="font-medium">Address:</span>{" "}
                        {bio.Address?.Ward}, {bio.Address?.District},{" "}
                        {bio.Address?.City}
                      </div>
                      <div>
                        <span className="font-medium">Free time:</span>{" "}
                        {bio.AvailableTimes?.join(", ") || "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium">Goal of play:</span>{" "}
                        {bio.PlayGoals?.join(", ") || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Gửi lời mời đến{" "}
                <span className="text-blue-600">{selectedPlayer.user.name}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={invitationData.location}
                    onChange={(e) =>
                      setInvitationData({
                        ...invitationData,
                        location: e.target.value,
                      })
                    }
                    placeholder="Nhập địa điểm"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Ngày thi đấu
                  </label>
                  <input
                    type="date"
                    value={invitationData.matchDate}
                    onChange={(e) =>
                      setInvitationData({
                        ...invitationData,
                        matchDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Giờ bắt đầu
                    </label>
                    <input
                      type="time"
                      value={invitationData.timeStart}
                      onChange={(e) =>
                        setInvitationData({
                          ...invitationData,
                          timeStart: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Giờ kết thúc
                    </label>
                    <input
                      type="time"
                      value={invitationData.timeEnd}
                      onChange={(e) =>
                        setInvitationData({
                          ...invitationData,
                          timeEnd: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Lời nhắn (tùy chọn)
                  </label>
                  <textarea
                    value={invitationData.message}
                    onChange={(e) =>
                      setInvitationData({
                        ...invitationData,
                        message: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Nhập lời nhắn..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                  onClick={() => setSelectedPlayer(null)}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendInvitation}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                >
                  Gửi lời mời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingChallenge;
