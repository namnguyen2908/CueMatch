// src/pages/Matching/MatchingRequests.jsx

import React, { useEffect, useState } from 'react';
import matchingApi from '../../api/matchingApi';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';

const MatchingRequest = () => {
    const [invitations, setInvitations] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const { datauser } = useUser();

    const fetchInvitations = async () => {
        setLoading(true);
        try {
            const data = await matchingApi.getInvitations();
            setInvitations(data);
        } catch (err) {
            toast.error("Lỗi khi tải lời mời!");
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingMatches = async () => {
        try {
            const data = await matchingApi.getUpcomingMatches();
            setUpcomingMatches(data);
        } catch (err) {
            toast.error("Lỗi khi tải trận đấu sắp tới!");
        }
    };

    const handleAccept = async (invitationId) => {
        try {
            await matchingApi.acceptInvitation(invitationId);
            toast.success("Chấp nhận lời mời thành công!");
            fetchInvitations(); // Làm mới danh sách
        } catch (err) {
            toast.error("Không thể chấp nhận lời mời!");
        }
    };

    const handleDecline = async (invitationId) => {
        try {
            await matchingApi.declineInvitation(invitationId);
            toast.success("Đã từ chối lời mời.");
            fetchInvitations(); // Làm mới danh sách
        } catch (err) {
            toast.error("Không thể từ chối lời mời!");
        }
    };

    useEffect(() => {
        fetchInvitations();
        fetchUpcomingMatches();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Invitation to challenge</h2>

            {loading ? (
                <p>Loading...</p>
            ) : invitations.length === 0 ? (
                <p className="text-gray-500">You haven’t got any invitations yet</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {invitations.map(invite => (
                        <div
                            key={invite._id}
                            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={invite.From.Avatar}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold">{invite.From.Name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        <span className="font-medium">Time:</span> {invite.MatchDate?.slice(0, 10)} ({invite.TimeStart} - {invite.TimeEnd})
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        <span className="font-medium">Address:</span> {invite.Location}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        <span className="font-medium">Play Type:</span> {invite.PlayType}
                                    </p>
                                    {invite.Message && (
                                        <p className="text-sm text-gray-600 mt-1 italic">"{invite.Message}"</p>
                                    )}
                                    <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                                        Status: {invite.Status}
                                    </p>
                                </div>
                            </div>

                            {invite.Status === 'Pending' && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleAccept(invite._id)}
                                        className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDecline(invite._id)}
                                        className="px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Declined
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <h2 className="text-2xl font-bold my-4">The upcoming match</h2>
            {upcomingMatches.length === 0 ? (
                <p className="text-gray-500">You have no upcoming matches</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {upcomingMatches.map(match => {
    const isUserFrom = match.From._id === datauser.id;
    const opponent = isUserFrom ? match.To : match.From;

    return (
        <div
            key={match._id}
            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center shadow-md"
        >
            <div className="flex items-center gap-4">
                <img
                    src={match.From.Avatar || "/default-avatar.png"}
                    alt="From"
                    className="w-10 h-10 rounded-full border"
                />
                <span className="font-medium text-sm">vs</span>
                <img
                    src={match.To.Avatar || "/default-avatar.png"}
                    alt="To"
                    className="w-10 h-10 rounded-full border"
                />
                <div className="ml-4">
                    <p className="font-semibold text-sm">
                        {isUserFrom ? "You" : match.From.Name} vs {isUserFrom ? match.To.Name : "You"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        <span className="font-medium">Time:</span> {match.MatchDate?.slice(0, 10)} ({match.TimeStart} - {match.TimeEnd})
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        <span className="font-medium">Address:</span> {match.Location}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        <span className="font-medium">Play Type:</span> {match.PlayType}
                    </p>
                    <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-300">
                        Status: {match.Status}
                    </p>
                </div>
            </div>
        </div>
    );
})}

                </div>
            )}
        </div>
    );
};

export default MatchingRequest;