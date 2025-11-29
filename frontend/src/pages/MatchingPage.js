import React from "react";
import { UserPlus, Handshake, Swords } from "lucide-react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

const dummyPlayers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=11",
    level: "Trung cấp",
    playStyle: "Cơ bản, thư giãn",
    district: "Quận 1",
    matchScore: 87,
    favoriteClub: "Quán Bi-a Galaxy",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=22",
    level: "Chuyên nghiệp",
    playStyle: "Thi đấu, cạnh tranh",
    district: "Quận 3",
    matchScore: 72,
    favoriteClub: "Bi-a King Club",
  },
];

const MatchingPage = () => {
  return (
    <>
      <Header />
      <Sidebar />

      {/* Main content on the right */}
      <div className="pt-24 pl-64 pr-8 min-h-screen bg-[#0c0c0c]">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">Suggested Players</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dummyPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-6 shadow-lg hover:shadow-yellow-400/10 transition"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-20 h-20 rounded-full border-2 border-yellow-400 shadow"
                />
                <div>
                  <h2 className="text-xl font-semibold text-yellow-300">{player.name}</h2>
                  <p className="text-gray-400">
                    Level: <span className="text-white">{player.level}</span>
                  </p>
                  <p className="text-gray-400">
                    Play Style: <span className="text-white">{player.playStyle}</span>
                  </p>
                  <p className="text-gray-400">
                    Address: <span className="text-white">{player.district}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-300">
                    Match Score:
                  <span className="ml-2 font-bold text-yellow-400">{player.matchScore}%</span>
                </div>

                <div className="flex space-x-2">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-3 py-1 rounded-lg flex items-center gap-1 shadow">
                    Challenge
                  </button>
                  <button className="bg-gray-800 hover:bg-yellow-500 hover:text-black text-yellow-400 px-3 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
                    Add Friend
                  </button>
                  <button className="bg-yellow-300 hover:bg-yellow-400 text-black px-3 py-1 rounded-lg flex items-center gap-1 shadow">
                    Meet at
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MatchingPage;