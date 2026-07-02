/**
 * context/RoleContext.jsx
 *
 * Manages granular access grants and revocations.
 * Grant/revoke operations persist to the user store via authService
 * so that the granted faculty sees their new access after login.
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateUserRecord } from '../api/authApi';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { users, setUsers, currentUser, setCurrentUser } = useAuth();

  /**
   * Grants a faculty member temporary assessor access with specified permissions.
   * Persists the change to localStorage so it survives page reload.
   *
   * @param {string} userId - The faculty user's ID
   * @param {{ pages: string[], features: string[] }} permissions - Selected pages and features
   */
  const grantTemporaryAdmin = async (userId, permissions) => {
    const targetUser = users[userId];
    if (!targetUser) return;

    const updatedUser = {
      ...targetUser,
      isTemporaryAdmin: true,
      granularPermissions: permissions,
      isAccessRevoked: false,
      grantCount: (targetUser.grantCount || 0) + 1,
    };

    // Persist to storage so faculty sees the grant after login/reload
    await updateUserRecord(userId, updatedUser);

    setUsers(prev => ({ ...prev, [userId]: updatedUser }));

    // If this faculty is currently logged in, update their live session too
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }
  };

  /**
   * Revokes a faculty member's temporary assessor access.
   * Persists the change to localStorage.
   *
   * @param {string} userId
   */
  const revokeTemporaryAdmin = async (userId) => {
    const targetUser = users[userId];
    if (!targetUser) return;

    const updatedUser = {
      ...targetUser,
      isTemporaryAdmin: false,
      granularPermissions: null,
      isAccessRevoked: true,
    };

    // Persist to storage
    await updateUserRecord(userId, updatedUser);

    setUsers(prev => ({ ...prev, [userId]: updatedUser }));

    // If this faculty is currently logged in, update their live session too
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }
  };

  return (
    <RoleContext.Provider value={{ grantTemporaryAdmin, revokeTemporaryAdmin }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => useContext(RoleContext);
