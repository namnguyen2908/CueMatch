import React, { useEffect, useState } from 'react';
import matchingApi from '../../api/matchingApi';

const MatchingHistory = () => {
    const [history, setHistory] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Occurred');
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await matchingApi.getMatchHistory(statusFilter);
            setHistory(data);
        } catch (error) {
            console.error('Lỗi khi tải lịch sử trận đấu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [statusFilter]);

    const formatTime = (dateStr, timeStr) => {
        const date = new Date(dateStr);
        return `${date.toLocaleDateString()} lúc ${timeStr}`;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Lịch sử thi đấu</h2>

            {/* Bộ lọc */}
            <div className="mb-6">
                <button
                    onClick={() => setStatusFilter('Occurred')}
                    className={`px-4 py-2 rounded-l-lg ${statusFilter === 'Occurred' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Đã diễn ra
                </button>
                <button
                    onClick={() => setStatusFilter('Declined')}
                    className={`px-4 py-2 rounded-r-lg ${statusFilter === 'Declined' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                >
                    Đã từ chối
                </button>
            </div>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : history.length === 0 ? (
                <p>Không có trận nào thuộc trạng thái này.</p>
            ) : (
                <ul className="space-y-4">
                    {history.map((match) => {
                        const isSentByMe = match.From._id === match.To._id; // giả sử id user được set đúng
                        const opponent = isSentByMe ? match.To : match.From;

                        return (
                            <li key={match._id} className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <img src={opponent.Avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                                        <span className="font-semibold">{opponent.Name}</span>
                                    </div>
                                    <span
                                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                                            match.Status === 'Occurred' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                        }`}
                                    >
                                        {match.Status === 'Occurred' ? 'Đã diễn ra' : 'Đã từ chối'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <p>🔫 Kiểu chơi: <strong>{match.PlayType}</strong></p>
                                    <p>📍 Địa điểm: {match.Location}</p>
                                    <p>🕒 Thời gian: {formatTime(match.MatchDate, match.TimeStart)} - {match.TimeEnd}</p>
                                    {match.Message && <p>📩 Lời nhắn: {match.Message}</p>}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MatchingHistory;