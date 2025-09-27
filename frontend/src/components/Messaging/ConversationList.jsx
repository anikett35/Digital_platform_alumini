import React from 'react';
import { MessageCircle, User, GraduationCap, Building, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ConversationList = ({ conversations, onSelectConversation, loading }) => {
  const { user } = useAuth();

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return messageDate.toLocaleDateString();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'alumni':
        return <GraduationCap className="w-4 h-4" />;
      case 'student':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500">
            Start a conversation with alumni or students to begin mentoring!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participant;
        const isUnread = conversation.lastMessage && 
          conversation.lastMessage.sender !== user?.id &&
          !conversation.lastMessage.readBy?.some(read => read.user === user?.id);

        return (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                {/* Name and role */}
                <div className="flex items-center space-x-2 mb-1">
                  <p className={`text-sm font-medium truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                    {otherParticipant?.name}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    {getRoleIcon(otherParticipant?.role)}
                    <span className="capitalize">{otherParticipant?.role}</span>
                  </div>
                </div>

                {/* Department/Company info */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                  {otherParticipant?.role === 'alumni' && otherParticipant?.currentCompany && (
                    <>
                      <Building className="w-3 h-3" />
                      <span>{otherParticipant.currentCompany}</span>
                    </>
                  )}
                  {otherParticipant?.department && (
                    <span>{otherParticipant.department}</span>
                  )}
                </div>

                {/* Last message */}
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {conversation.lastMessage 
                      ? conversation.lastMessage.content 
                      : 'No messages yet'
                    }
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    {conversation.lastMessage && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(conversation.lastMessage.createdAt)}</span>
                      </div>
                    )}
                    {isUnread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Mentorship indicator */}
                {conversation.mentorshipDetails && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Mentorship: {conversation.mentorshipDetails.topic}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;