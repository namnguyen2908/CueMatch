import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import matchingApi from "../../api/matchingApi";
import playerBioApi from "../../api/playerBioApi";
import { toast } from "react-toastify";
import SelectClubOnMap from "../Matching/SelectClubOnMap";
import ErrorToast from "../../components/ErrorToast/ErrorToast";

const MatchingChallenge = () => {
  const [playType, setPlayType] = useState("Pool");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [invitationData, setInvitationData] = useState({
    location: "",
    matchDate: "",
    timeStart: "",
    timeEnd: "",
    message: "",
  });
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);
  const [playerBios, setPlayerBios] = useState({});
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchPlayerBio = async (userId) => {
    if (playerBios[userId]) return;
    try {
      const bio = await playerBioApi.getPlayerBioByUserId(userId);
      setPlayerBios((prev) => ({ ...prev, [userId]: bio }));
    } catch (err) {
      console.error("Error loading player bio:", err);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await matchingApi.getPlayerList(playType);
      setPlayers(data);
    } catch (err) {
      toast.error("Error loading player list!");
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
      playType,
      ...invitationData,
    };

    try {
      await matchingApi.sendInvitation(payload);
      toast.success("Invitation sent successfully!");
      setSelectedPlayer(null);
      setSelectedClub(null);
      setInvitationData({
        location: "",
        matchDate: "",
        timeStart: "",
        timeEnd: "",
        message: "",
      });
    } catch (err) {
      console.log('MatchingChallenge: Error caught', err);
      setError(err);
    }
  };

  return (
    <>
      <ErrorToast error={error} onClose={() => setError(null)} duration={3000} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-lg">
            {["Pool", "Carom", "Snooker"].map((type) => (
              <button
                key={type}
                onClick={() => setPlayType(type)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  playType === type
                    ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                {type}
                {playType === type && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-800 border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading player list...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
              <span className="text-4xl">🎱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upgrade Your Account</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Access more players by upgrading your account.
            </p>
            <a
              href="/pricing"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Upgrade Now
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player, index) => {
              const bio = playerBios[player.user.id];
              const playStyle = bio?.PlayStyles?.find((ps) => ps.PlayType === playType);

              return (
                <div
                  key={player.user.id}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => {
                    setHoveredPlayerId(player.user.id);
                    fetchPlayerBio(player.user.id);
                  }}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:via-amber-500/5 group-hover:to-yellow-500/5 transition-all duration-300" />
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={player.user.avatar || "/placeholder.svg"}
                      alt={player.user.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                      {player.compatibility}% Match
                    </div>
                    {player.user.isOnline && (
                      <div className="absolute top-3 left-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg animate-pulse" title="Online" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  <div className="p-5 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {player.user.name}
                      </h4>
                      {player.user.isOnline && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">● Online</span>
                      )}
                    </div>

                    {playStyle && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded-lg">
                          {playStyle.PlayType} • {playStyle.Rank}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>Send Invitation</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>

                  {hoveredPlayerId === player.user.id && bio && (
                    <div className="absolute top-2 left-2 right-2 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <img
                          src={bio.User.Avatar || "/placeholder.svg"}
                          alt={bio.User.Name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{bio.User.Name}</p>
                          {playStyle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {playStyle.PlayType} • Rank {playStyle.Rank}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">📍</span>
                          <p className="text-gray-700 dark:text-gray-300">
                            {bio.Address?.Ward}, {bio.Address?.District}, {bio.Address?.City}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">🕐</span>
                          <p className="text-gray-700 dark:text-gray-300">
                            {bio.AvailableTimes?.join(", ") || "Not updated"}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">🎯</span>
                          <p className="text-gray-700 dark:text-gray-300">
                            {bio.PlayGoals?.join(", ") || "Not updated"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedPlayer && isMounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setSelectedPlayer(null);
                setSelectedClub(null);
                setInvitationData({
                  location: "",
                  matchDate: "",
                  timeStart: "",
                  timeEnd: "",
                  message: "",
                });
              }}
            />
            <div className="relative z-[10000] bg-white dark:bg-gray-900 rounded-3xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-8 py-6">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/20">
                      <img
                        src={selectedPlayer.user.avatar || "/placeholder.svg"}
                        alt={selectedPlayer.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        Send Challenge Invitation
                      </h3>
                      <p className="text-white/90 font-medium">
                        To {selectedPlayer.user.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlayer(null);
                      setSelectedClub(null);
                      setInvitationData({
                        location: "",
                        matchDate: "",
                        timeStart: "",
                        timeEnd: "",
                        message: "",
                      });
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-200 hover:rotate-90 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden flex-1">
                <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 flex flex-col">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      Select Match Location
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click a marker on the map to select a club
                    </p>
                  </div>
                  <div className="flex-1 min-h-[300px] max-h-[400px] overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-white/10">
                    <SelectClubOnMap
                      onSelect={(club) => {
                        setSelectedClub(club);
                        setInvitationData({ ...invitationData, location: club.Name });
                        toast.success(`Selected club: ${club.Name}`);
                      }}
                    />
                  </div>
                  {invitationData.location && !selectedClub && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        ✅ Selected: {invitationData.location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 lg:p-8 space-y-6 overflow-y-auto">
                  {selectedClub && (
                    <div className="p-5 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-700 shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                          <span className="text-white text-xl">📍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                              Selected Club
                            </span>
                            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </div>
                          <h6 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                            {selectedClub.Name}
                          </h6>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            {selectedClub.Address}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs">
                            {selectedClub.Phone && (
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <span>📞</span>
                                <a href={`tel:${selectedClub.Phone}`} className="hover:text-orange-600 dark:hover:text-orange-400 font-medium">
                                  {selectedClub.Phone}
                                </a>
                              </div>
                            )}
                            {(selectedClub.OpenTime || selectedClub.CloseTime) && (
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <span>🕐</span>
                                <span className="font-medium">
                                  {selectedClub.OpenTime && selectedClub.CloseTime 
                                    ? `${selectedClub.OpenTime} - ${selectedClub.CloseTime}`
                                    : selectedClub.OpenTime || selectedClub.CloseTime}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                        📅 Match Date
                      </label>
                      <input
                        type="date"
                        value={invitationData.matchDate}
                        onChange={(e) =>
                          setInvitationData({ ...invitationData, matchDate: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                          ⏰ Start Time
                        </label>
                        <input
                          type="time"
                          value={invitationData.timeStart}
                          onChange={(e) =>
                            setInvitationData({ ...invitationData, timeStart: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                          ⏰ End Time
                        </label>
                        <input
                          type="time"
                          value={invitationData.timeEnd}
                          onChange={(e) =>
                            setInvitationData({ ...invitationData, timeEnd: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                        💬 Message (optional)
                      </label>
                      <textarea
                        value={invitationData.message}
                        onChange={(e) =>
                          setInvitationData({ ...invitationData, message: e.target.value })
                        }
                        rows={4}
                        placeholder="Type a message for the opponent..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 px-8 py-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => {
                    setSelectedPlayer(null);
                    setSelectedClub(null);
                    setInvitationData({
                      location: "",
                      matchDate: "",
                      timeStart: "",
                      timeEnd: "",
                      message: "",
                    });
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Send Invitation</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};

export default MatchingChallenge;