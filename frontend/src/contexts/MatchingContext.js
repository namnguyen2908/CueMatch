import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socket from '../socket';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';

const MatchingContext = createContext();
export const useMatching = () => useContext(MatchingContext);

export const MatchingProvider = ({ children }) => {
  const { datauser } = useUser();
  const [invitations, setInvitations] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);

  useEffect(() => {
    if (datauser?.id) {
      if (!socket.connected) {
        socket.connect();
      }
      
      const handleConnect = () => {
        socket.emit('join_matching');
        console.log('✅ Joined matching room');
      };

      if (socket.connected) {
        handleConnect();
      } else {
        socket.on('connect', handleConnect);
      }

      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [datauser]);

  useEffect(() => {
    const handleNewInvitation = (invitation) => {
      setInvitations(prev => {
        const exists = prev.some(inv => inv._id === invitation._id);
        if (exists) return prev;
        return [invitation, ...prev];
      });
      toast.info(`You have a new invitation from ${invitation.From?.Name || 'someone'}!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    socket.on('new_invitation', handleNewInvitation);
    return () => {
      socket.off('new_invitation', handleNewInvitation);
    };
  }, []);

  useEffect(() => {
    const handleInvitationSent = (invitation) => {
      setSentInvitations(prev => {
        const exists = prev.some(inv => inv._id === invitation._id);
        if (exists) return prev;
        return [invitation, ...prev];
      });
    };

    socket.on('invitation_sent', handleInvitationSent);
    return () => {
      socket.off('invitation_sent', handleInvitationSent);
    };
  }, []);

  useEffect(() => {
    const handleInvitationAccepted = (invitation) => {
      setInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      setSentInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      
      setUpcomingMatches(prev => {
        const exists = prev.some(match => match._id === invitation._id);
        if (exists) {
          return prev.map(match => match._id === invitation._id ? invitation : match);
        }
        return [invitation, ...prev];
      });

      toast.success(`Invitation accepted!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    socket.on('invitation_accepted', handleInvitationAccepted);
    return () => {
      socket.off('invitation_accepted', handleInvitationAccepted);
    };
  }, []);

  useEffect(() => {
    const handleInvitationDeclined = (invitation) => {
      setInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      setSentInvitations(prev => prev.map(inv => 
        inv._id === invitation._id ? { ...inv, Status: 'Declined' } : inv
      ));

      toast.info(`Invitation declined.`, {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    socket.on('invitation_declined', handleInvitationDeclined);
    return () => {
      socket.off('invitation_declined', handleInvitationDeclined);
    };
  }, []);

  useEffect(() => {
    const handleInvitationCancelled = (invitation) => {
      setInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      setSentInvitations(prev => prev.filter(inv => inv._id !== invitation._id));
      setUpcomingMatches(prev => prev.filter(match => match._id !== invitation._id));

      toast.info(`Invitation cancelled.`, {
        position: 'top-right',
        autoClose: 3000,
      });
    };

    socket.on('invitation_cancelled', handleInvitationCancelled);
    return () => {
      socket.off('invitation_cancelled', handleInvitationCancelled);
    };
  }, []);

  const updateInvitation = useCallback((invitationId, updates) => {
    setInvitations(prev => prev.map(inv => inv._id === invitationId ? { ...inv, ...updates } : inv));
    setSentInvitations(prev => prev.map(inv => inv._id === invitationId ? { ...inv, ...updates } : inv));
  }, []);

  const removeInvitation = useCallback((invitationId) => {
    setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    setSentInvitations(prev => prev.filter(inv => inv._id !== invitationId));
  }, []);

  const addUpcomingMatch = useCallback((match) => {
    setUpcomingMatches(prev => {
      const exists = prev.some(m => m._id === match._id);
      if (exists) return prev;
      return [match, ...prev];
    });
  }, []);

  return (
    <MatchingContext.Provider
      value={{
        invitations,
        upcomingMatches,
        sentInvitations,
        setInvitations,
        setUpcomingMatches,
        setSentInvitations,
        updateInvitation,
        removeInvitation,
        addUpcomingMatch,
      }}
    >
      {children}
    </MatchingContext.Provider>
  );
};