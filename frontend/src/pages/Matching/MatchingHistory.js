import React, { useEffect, useState } from 'react';
import matchingApi from '../../api/matchingApi';
import { useUser } from '../../contexts/UserContext';

const MatchingHistory = () => {
  const [history, setHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Occurred');
  const [loading, setLoading] = useState(true);
  const { datauser } = useUser();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await matchingApi.getMatchHistory(statusFilter);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const formatTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${timeStr}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'Occurred') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Occurred
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          Declined
        </span>
      );
    }
  };

  const getPlayTypeColor = (playType) => {
    const colors = {
      'Pool': 'from-blue-500 to-cyan-500',
      'Carom': 'from-purple-500 to-pink-500',
      'Snooker': 'from-orange-500 to-amber-500'
    };
    return colors[playType] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-lg">
          <button
            onClick={() => setStatusFilter('Occurred')}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              statusFilter === 'Occurred'
                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/30 scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Occurred
            {statusFilter === 'Occurred' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setStatusFilter('Declined')}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              statusFilter === 'Declined'
                ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            Declined
            {statusFilter === 'Declined' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-800 border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No history
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {statusFilter === 'Occurred' 
                ? 'You have no occurred matches' 
                : 'You have no declined invitations'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {history.map((match, index) => {
            const currentUserId = datauser?.id || datauser?._id;
            const isSentByMe = match.From?._id === currentUserId || match.From?.id === currentUserId;
            const opponent = isSentByMe ? match.To : match.From;

            return (
              <div
                key={match._id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-yellow-500/0 group-hover:from-orange-500/5 group-hover:via-amber-500/5 group-hover:to-yellow-500/5 transition-all duration-300" />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={opponent?.Avatar || '/placeholder.svg'} 
                          alt={opponent?.Name || 'Opponent'} 
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {opponent?.Name || 'Player'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isSentByMe ? 'You sent' : 'You received'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(match.Status)}
                  </div>

                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getPlayTypeColor(match.PlayType)} text-white shadow-md`}>
                      <span className="text-sm">🎱</span>
                      {match.PlayType}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-xl mt-0.5">📍</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{match.Location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-xl mt-0.5">📅</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Match Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(match.MatchDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-xl mt-0.5">🕐</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Time</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {match.TimeStart} - {match.TimeEnd}
                        </p>
                      </div>
                    </div>

                    {match.Message && (
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                        <span className="text-xl mt-0.5">💬</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">Message</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white italic">"{match.Message}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {formatTime(match.MatchDate, match.TimeStart)}
                    </p>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-bl-full opacity-50"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchingHistory;