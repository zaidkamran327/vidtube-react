import { useEffect, useState } from 'react'
import './Navbar.css'
import menu_icon from '../../assets/menu.png'
import logo from '../../assets/logo.png'
import search_icon from '../../assets/search.png'
import notification_icon from '../../assets/notification.png'
import profile_icon from '../../assets/jack.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiKey, fetchCachedJson } from '../../data'
import { useTheme } from '../../context/ThemeContext'
import { useSubscriptions } from '../../context/SubscriptionContext'
import { useNotifications } from '../../context/NotificationContext'

const Navbar = ({ setsidebar }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [profileAvatar, setProfileAvatar] = useState(() => localStorage.getItem('yt_profile_avatar') || profile_icon);
    const [searchHistory, setSearchHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('yt_search_history')) || [];
        } catch {
            return [];
        }
    });
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [liveSuggestions, setLiveSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const navigate = useNavigate();
    const { dark, toggleTheme } = useTheme();
    const { subscriptions } = useSubscriptions();
    const { notifications, checkForUploads, markAllRead, clearNotifications } = useNotifications();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationsRefreshing, setNotificationsRefreshing] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        setPageLoading(true);
        const timer = setTimeout(() => setPageLoading(false), 700);
        return () => clearTimeout(timer);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length < 2) {
            setLiveSuggestions([]);
            setSuggestionsLoading(false);
            return undefined;
        }

        let active = true;
        const timeout = setTimeout(async () => {
            setSuggestionsLoading(true);
            const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(trimmedQuery)}&type=video&key=${apiKey}`;
            try {
                const data = await fetchCachedJson(url);
                if (active) {
                    setLiveSuggestions((data.items || []).map(item => ({
                        query: item.snippet.title,
                        channel: item.snippet.channelTitle,
                    })));
                }
            } catch {
                if (active) setLiveSuggestions([]);
            } finally {
                if (active) setSuggestionsLoading(false);
            }
        }, 350);

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [searchQuery]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target.closest('.search-box')) setSuggestionsOpen(false);
            if (!event.target.closest('.notification-wrapper')) setNotificationsOpen(false);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        const handleProfileUpdate = () => {
            setProfileAvatar(localStorage.getItem('yt_profile_avatar') || profile_icon);
        };

        window.addEventListener('profile-updated', handleProfileUpdate);
        return () => window.removeEventListener('profile-updated', handleProfileUpdate);
    }, []);

    useEffect(() => {
        checkForUploads(subscriptions);
        const interval = setInterval(() => checkForUploads(subscriptions), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [subscriptions, checkForUploads]);

    const unreadCount = notifications.filter(notification => !notification.read).length;

    const handleNotificationsClick = () => {
        setNotificationsOpen(previous => !previous);
        if (unreadCount) markAllRead();
    };

    const refreshNotifications = async () => {
        setNotificationsRefreshing(true);
        await checkForUploads(subscriptions);
        setNotificationsRefreshing(false);
    };

    const handleClearNotifications = () => {
        if (window.confirm('Clear all notifications?')) clearNotifications();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        submitSearch(searchQuery);
    };

    const submitSearch = (value) => {
        const trimmedQuery = value.trim();
        if (!trimmedQuery) return;

        const updatedHistory = [
            trimmedQuery,
            ...searchHistory.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase()),
        ].slice(0, 8);
        setSearchHistory(updatedHistory);
        localStorage.setItem('yt_search_history', JSON.stringify(updatedHistory));
        setSearchQuery(trimmedQuery);
        setSuggestionsOpen(false);
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    };

    const suggestions = searchHistory.filter(item =>
        !searchQuery.trim() || item.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    const displayedSuggestions = liveSuggestions.length ? liveSuggestions : suggestions.map(query => ({ query }));

    return (
        <>
        <nav className='flex-div'>
            <div className='nav-left flex-div'>
                <img className='menu-icon' onClick={() => setsidebar(prev => !prev)} src={menu_icon} alt="Toggle sidebar" />
                <Link to='/'><img className='logo' src={logo} alt="YouTube Clone home" /></Link>
            </div>

            <div className="nav-middle flex-div">
                <form className="search-box flex-div" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder='Search'
                        value={searchQuery}
                        onFocus={() => setSuggestionsOpen(true)}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSuggestionsOpen(true);
                        }}
                    />
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <img src={search_icon} alt="search" />
                    </button>
                    {suggestionsOpen && (displayedSuggestions.length > 0 || suggestionsLoading) && (
                        <div className="search-suggestions">
                            {suggestionsLoading && <p className="search-suggestions-loading">Finding suggestions...</p>}
                            {displayedSuggestions.map(suggestion => (
                                <button
                                    type="button"
                                    className="search-suggestion"
                                    key={suggestion.query}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => submitSearch(suggestion.query)}
                                >
                                    <img src={search_icon} alt="" />
                                    <span>
                                        <strong>{suggestion.query}</strong>
                                        {suggestion.channel && <small>{suggestion.channel}</small>}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </form>
            </div>

            <div className="nav-right flex-div">
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
                    {dark ? '☀️' : '🌙'}
                </button>
                <div className="notification-wrapper">
                    <button className="notification-button" onClick={handleNotificationsClick} title="Notifications">
                        <img src={notification_icon} alt="Notifications" />
                        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>
                    {notificationsOpen && (
                        <div className="notification-panel">
                            <div className="notification-header">
                                <h3>Notifications</h3>
                                <div>
                                    <button onClick={refreshNotifications} disabled={notificationsRefreshing}>
                                        {notificationsRefreshing ? 'Checking...' : 'Refresh'}
                                    </button>
                                    <button onClick={handleClearNotifications} disabled={!notifications.length}>Clear</button>
                                </div>
                            </div>
                            {notifications.length === 0 ? (
                                <p className="notification-empty">No new uploads yet.</p>
                            ) : (
                                notifications.map(notification => (
                                    <button
                                        className="notification-item"
                                        key={notification.id}
                                        onClick={() => {
                                            setNotificationsOpen(false);
                                            navigate(`/video/0/${notification.id}`);
                                        }}
                                    >
                                        <img src={notification.thumbnail} alt="" />
                                        <span>
                                            <strong>{notification.title}</strong>
                                            <small>{notification.channelName}</small>
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <Link to="/profile" className="profile-link" title="Profile">
                    <img src={profileAvatar} className='user-icon' alt="Profile" />
                </Link>
            </div>
        </nav>
        {pageLoading && <div className="page-loading-bar" aria-label="Loading page" />}
        </>
    )
}

export default Navbar
