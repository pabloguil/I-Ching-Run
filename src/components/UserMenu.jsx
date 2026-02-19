import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/index.jsx';

export default function UserMenu({ onOpenProfile, onClose }) {
  const { t } = useI18n();
  const { user, displayName, logout } = useAuth();
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleOpenProfile = () => {
    onClose();
    onOpenProfile();
  };

  return (
    <div className="user-menu" ref={menuRef} role="menu" aria-label="User menu">
      <div className="user-menu-info">
        <span className="user-menu-avatar">{user?.email?.charAt(0).toUpperCase() || '?'}</span>
        <span className="user-menu-name">{displayName}</span>
      </div>
      <div className="user-menu-divider" />
      <button
        className="user-menu-item"
        role="menuitem"
        onClick={handleOpenProfile}
      >
        <span className="user-menu-icon">⚙</span>
        {t('user.menu.profile')}
      </button>
      <button
        className="user-menu-item user-menu-item--logout"
        role="menuitem"
        onClick={handleLogout}
      >
        <span className="user-menu-icon">↩</span>
        {t('user.menu.logout')}
      </button>
    </div>
  );
}
