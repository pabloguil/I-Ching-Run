import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/index.jsx';

const TABS = ['profile', 'security', 'danger'];

export default function UserProfileModal({ onClose }) {
  const { t } = useI18n();
  const { user, displayName, updateProfile, updatePassword, deleteAccount } = useAuth();
  const [tab, setTab] = useState('profile');

  // Profile tab state
  const [name, setName] = useState(user?.user_metadata?.display_name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security tab state
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // Danger tab state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const DELETE_WORD = t('user.danger.confirmWord');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);
    try {
      await updateProfile({ display_name: name.trim() });
      setProfileMsg(t('user.profile.saved'));
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg('');
    if (newPwd !== confirmPwd) {
      setSecurityMsg(t('user.security.mismatch'));
      return;
    }
    if (newPwd.length < 6) {
      setSecurityMsg(t('user.security.tooShort'));
      return;
    }
    setSecurityLoading(true);
    try {
      await updatePassword(newPwd);
      setSecurityMsg(t('user.security.changed'));
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setSecurityMsg(err.message);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirm !== DELETE_WORD) return;
    setDeleteMsg('');
    setDeleteLoading(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      setDeleteMsg(err.message);
      setDeleteLoading(false);
    }
  };

  const tabLabel = (key) => ({
    profile: t('user.tabs.profile'),
    security: t('user.tabs.security'),
    danger: t('user.tabs.danger'),
  })[key];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal-title">{t('user.profile.title')}</h2>

        {/* Tabs */}
        <div className="profile-tabs" role="tablist">
          {TABS.map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`profile-tab ${tab === key ? 'active' : ''} ${key === 'danger' ? 'profile-tab--danger' : ''}`}
              onClick={() => setTab(key)}
            >
              {tabLabel(key)}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <form className="profile-section" onSubmit={handleSaveProfile}>
            <div className="profile-avatar-row">
              <span className="profile-avatar-big">{user?.email?.charAt(0).toUpperCase() || '?'}</span>
              <div>
                <p className="profile-email">{user?.email}</p>
                <p className="profile-since">{t('user.profile.memberId')}: {user?.id?.slice(0, 8)}…</p>
              </div>
            </div>

            <label className="profile-label" htmlFor="display-name">
              {t('user.profile.displayName')}
            </label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('user.profile.namePlaceholder')}
              className="auth-input"
              maxLength={50}
            />

            {profileMsg && (
              <p className={profileMsg === t('user.profile.saved') ? 'auth-success-inline' : 'auth-error'}>
                {profileMsg}
              </p>
            )}

            <button type="submit" className="btn btn-consultar" disabled={profileLoading}>
              {profileLoading ? '...' : t('user.profile.save')}
            </button>
          </form>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <form className="profile-section" onSubmit={handleChangePassword}>
            <p className="profile-section-desc">{t('user.security.desc')}</p>

            <label className="profile-label" htmlFor="new-pwd">
              {t('user.security.newPwd')}
            </label>
            <input
              id="new-pwd"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              className="auth-input"
              required
              minLength={6}
            />

            <label className="profile-label" htmlFor="confirm-pwd">
              {t('user.security.confirmPwd')}
            </label>
            <input
              id="confirm-pwd"
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder={t('user.security.confirmPwd')}
              className="auth-input"
              required
              minLength={6}
            />

            {securityMsg && (
              <p className={securityMsg === t('user.security.changed') ? 'auth-success-inline' : 'auth-error'}>
                {securityMsg}
              </p>
            )}

            <button type="submit" className="btn btn-consultar" disabled={securityLoading}>
              {securityLoading ? '...' : t('user.security.change')}
            </button>
          </form>
        )}

        {/* Danger tab */}
        {tab === 'danger' && (
          <form className="profile-section danger-zone" onSubmit={handleDeleteAccount}>
            <p className="danger-zone-desc">{t('user.danger.desc')}</p>
            <p className="danger-zone-instruction">
              {t('user.danger.typeToConfirm')} <strong>{DELETE_WORD}</strong>
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={DELETE_WORD}
              className="auth-input"
              autoComplete="off"
            />

            {deleteMsg && <p className="auth-error">{deleteMsg}</p>}

            <button
              type="submit"
              className="btn btn-danger"
              disabled={deleteConfirm !== DELETE_WORD || deleteLoading}
            >
              {deleteLoading ? '...' : t('user.danger.deleteAccount')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
