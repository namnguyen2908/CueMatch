import React, { useEffect, useState } from 'react';
import matchingApi from '../../api/matchingApi';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import { useMatching } from '../../contexts/MatchingContext';
import { Calendar, MapPin, Clock, Users, MessageSquare, CheckCircle, XCircle, Trophy } from 'lucide-react';

const MatchingRequest = () => {
  const { datauser } = useUser();
  const { 
    invitations, 
    upcomingMatches,
    setInvitations,
    setUpcomingMatches 
  } = useMatching();
  
  const [loading, setLoading] = useState(false);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await matchingApi.getInvitations();
      setInvitations(data);
    } catch (err) {
      toast.error("Error loading invitations!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingMatches = async () => {
    try {
      const data = await matchingApi.getUpcomingMatches();
      setUpcomingMatches(data);
    } catch (err) {
      toast.error("Error loading upcoming matches!");
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      await matchingApi.acceptInvitation(invitationId);
      setTimeout(() => {
        fetchInvitations();
        fetchUpcomingMatches();
      }, 500);
    } catch (err) {
      toast.error("Cannot accept invitation!");
    }
  };

  const handleDecline = async (invitationId) => {
    try {
      await matchingApi.declineInvitation(invitationId);
      setTimeout(() => {
        fetchInvitations();
      }, 500);
    } catch (err) {
      toast.error("Cannot decline invitation!");
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchUpcomingMatches();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Match Invitations
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {invitations.length} pending invitations
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-800 border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin" />
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <MessageSquare className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No invitations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You will receive notifications for new invitations
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {invitations.map((invite, index) => (
              <div
                key={invite._id}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded-full">
                    Pending
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-5">
                  <div className="relative">
                    <img
                      src={invite.From.Avatar || "/default-avatar.png"}
                      alt={invite.From.Name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {invite.From.Name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      sent a match invitation
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(invite.MatchDate)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {invite.TimeStart} - {invite.TimeEnd}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{invite.Location}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{invite.PlayType}</p>
                  </div>

                  {invite.Message && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{invite.Message}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {invite.Status === 'Pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleAccept(invite._id)}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDecline(invite._id)}
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upcoming Matches
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {upcomingMatches.length} confirmed matches
              </p>
            </div>
          </div>
        </div>

        {upcomingMatches.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Trophy className="w-10 h-10 text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No upcoming matches
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Accepted matches will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMatches.map((match, index) => {
              const isUserFrom = match.From._id === datauser.id;
              const opponent = isUserFrom ? match.To : match.From;

              return (
                <div
                  key={match._id}
                  className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Confirmed
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                      <img
                        src={match.From.Avatar || "/default-avatar.png"}
                        alt={match.From.Name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 mx-auto mb-2"
                      />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {isUserFrom ? "You" : match.From.Name}
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                      <span className="text-2xl font-black text-orange-500">VS</span>
                    </div>
                    <div className="text-center">
                      <img
                        src={match.To.Avatar || "/default-avatar.png"}
                        alt={match.To.Name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 mx-auto mb-2"
                      />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {isUserFrom ? match.To.Name : "You"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(match.MatchDate)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {match.TimeStart} - {match.TimeEnd}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                        <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{match.Location}</p>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                        <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{match.PlayType}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingRequest;