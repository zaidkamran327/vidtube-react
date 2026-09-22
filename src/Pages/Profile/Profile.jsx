import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSaved } from '../../context/SavedContext';
import { useSubscriptions } from '../../context/SubscriptionContext';
import { useNotifications } from '../../context/NotificationContext';
import defaultAvatar from '../../assets/jack.png';
import './Profile.css';
import { handleAvatarError, handleImageError } from '../../utils/imageFallback';

const Profile = () => {
    const [name, setName] = useState(() => localStorage.getItem('yt_profile_name') || 'YouTube User');
    const [avatar, setAvatar] = useState(() => localStorage.getItem('yt_profile_avatar') || defaultAvatar);
    const { watchLater, likedVideos } = useSaved();
    const { subscriptions } = useSubscriptions();

    const [searchHistory, setSearchHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('yt_search_history')) || [];
        } catch {
            return [];
        }
    });
    const { notifications, clearNotifications } = useNotifications();

    const saveName = (event) => {
        const nextName = event.target.value;
        setName(nextName);
        localStorage.setItem('yt_profile_name', nextName);
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const nextAvatar = reader.result;
            setAvatar(nextAvatar);
            localStorage.setItem('yt_profile_avatar', nextAvatar);
            window.dispatchEvent(new Event('profile-updated'));
        };
        reader.readAsDataURL(file);
    };

    const clearSearchHistory = () => {
        if (!window.confirm('Clear all search history?')) return;
        localStorage.removeItem('yt_search_history');
        setSearchHistory([]);
    };

    const handleClearNotifications = () => {
        if (window.confirm('Clear all notifications?')) clearNotifications();
    };

    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-avatar-wrap">
                    <img className="profile-avatar" src={avatar} alt="Profile" onError={handleAvatarError} />
                    <label className="change-avatar" title="Change profile photo">
                        Change photo
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                </div>
                <div className="profile-details">
                    <label htmlFor="profile-name">Your name</label>
                    <input id="profile-name" value={name} onChange={saveName} maxLength={40} />
                    <p>Your profile is stored only in this browser.</p>
                </div>
            </section>

            <section className="profile-stats" aria-label="Profile activity summary">
                <div><strong>{subscriptions.length}</strong><span>Subscriptions</span></div>
                <div><strong>{watchLater.length}</strong><span>Watch Later</span></div>
                <div><strong>{likedVideos.length}</strong><span>Liked Videos</span></div>
                <div><strong>{searchHistory.length}</strong><span>Searches</span></div>
            </section>

            <div className="profile-actions">
                <button onClick={clearSearchHistory} disabled={!searchHistory.length}>Clear search history</button>
                <button onClick={handleClearNotifications} disabled={!notifications.length}>Clear notifications</button>
            </div>

            <section className="profile-content">
                <div className="profile-section">
                    <div className="profile-section-heading">
                        <h2>Saved videos</h2>
                        <Link to="/saved/watchlater">View all</Link>
                    </div>
                    {watchLater.length === 0 ? (
                        <p className="profile-empty">Videos you save for later will appear here.</p>
                    ) : (
                        <div className="profile-video-list">
                            {watchLater.slice(0, 4).map(video => (
                                <Link to={`/video/${video.categoryId || 0}/${video.id}`} className="profile-video" key={video.id}>
                                    <img src={video.thumbnail} alt={video.title} onError={handleImageError} />
                                    <span>{video.title}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <div className="profile-section-heading">
                        <h2>Subscriptions</h2>
                    </div>
                    {subscriptions.length === 0 ? (
                        <p className="profile-empty">Channels you subscribe to will appear here.</p>
                    ) : (
                        <div className="profile-channel-list">
                            {subscriptions.map(channel => (
                                <Link to={`/channel/${channel.id}`} className="profile-channel" key={channel.id}>
                                    <img src={channel.thumbnail} alt={channel.name} onError={handleAvatarError} />
                                    <span>{channel.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <div className="profile-section-heading">
                        <h2>Recent activity</h2>
                    </div>
                    {searchHistory.length === 0 ? (
                        <p className="profile-empty">Your recent searches will appear here.</p>
                    ) : (
                        <div className="profile-activity-list">
                            {searchHistory.slice(0, 5).map(search => (
                                <Link to={`/search?q=${encodeURIComponent(search)}`} key={search}>
                                    Searched for <strong>{search}</strong>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Profile;
