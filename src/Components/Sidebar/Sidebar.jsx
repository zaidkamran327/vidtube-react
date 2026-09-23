import './Sidebar.css'
import logo from '../../assets/logo.png'
import home from '../../assets/home.png'
import game_icon from '../../assets/game_icon.png'
import automobiles from '../../assets/automobiles.png'
import sports from '../../assets/sports.png'
import entertainment from '../../assets/entertainment.png'
import tech from '../../assets/tech.png'
import music from '../../assets/music.png'
import blogs from '../../assets/blogs.png'
import news from '../../assets/news.png'
import like from '../../assets/like.png'
import save from '../../assets/save.png'
import { useSubscriptions } from '../../context/SubscriptionContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ sidebar, category, setCategory, mobileSidebarOpen, setMobileSidebarOpen }) => {
    const { subscriptions } = useSubscriptions();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;
    const closeMobileSidebar = () => setMobileSidebarOpen?.(false);

    const handleNav = (callback) => {
        if (typeof callback === 'function') callback();
        closeMobileSidebar();
    };

    return (
        <>
            <div
                className={`sidebar-backdrop ${mobileSidebarOpen ? 'show' : ''}`}
                onClick={closeMobileSidebar}
                aria-hidden="true"
            />
            <div className={`sidebar ${sidebar ? '' : 'small-sidebar'} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>

                {/* Mobile-only sticky header */}
                <div className="mobile-sidebar-header">
                    <img src={logo} alt="Logo" className="sidebar-logo" />
                    <button
                        type="button"
                        className="mobile-sidebar-close"
                        onClick={closeMobileSidebar}
                        aria-label="Close sidebar"
                    >×</button>
                </div>

                <div className="sidebar-scroll-area">
                    <div className="sortcut-links">
                        <div className={`side-links ${category === 0 && location.pathname === '/' ? 'active' : ''}`} onClick={() => handleNav(() => { setCategory(0); navigate('/'); })}>
                            <img src={home} alt="Home" /><p>Home</p>
                        </div>
                        <div className={`side-links ${isActive('/shorts') ? 'active' : ''}`} onClick={() => handleNav(() => navigate('/shorts'))}>
                            <span className="shorts-icon">▶</span><p>Shorts</p>
                        </div>
                        <div className={`side-links ${category === 20 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(20))}>
                            <img src={game_icon} alt="Gaming" /><p>Gaming</p>
                        </div>
                        <div className={`side-links ${category === 2 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(2))}>
                            <img src={automobiles} alt="Automobiles" /><p>Automobiles</p>
                        </div>
                        <div className={`side-links ${category === 17 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(17))}>
                            <img src={sports} alt="Sports" /><p>Sports</p>
                        </div>
                        <div className={`side-links ${category === 28 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(28))}>
                            <img src={tech} alt="Technology" /><p>Technology</p>
                        </div>
                        <div className={`side-links ${category === 24 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(24))}>
                            <img src={entertainment} alt="Entertainment" /><p>Entertainment</p>
                        </div>
                        <div className={`side-links ${category === 10 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(10))}>
                            <img src={music} alt="Music" /><p>Music</p>
                        </div>
                        <div className={`side-links ${category === 22 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(22))}>
                            <img src={blogs} alt="Blogs" /><p>Blogs</p>
                        </div>
                        <div className={`side-links ${category === 25 ? 'active' : ''}`} onClick={() => handleNav(() => setCategory(25))}>
                            <img src={news} alt="News" /><p>News</p>
                        </div>
                        <hr />
                    </div>

                    <div className="saved-links">
                        <h3>Library</h3>
                        <div className={`side-links ${isActive('/saved/watchlater') ? 'active' : ''}`} onClick={() => handleNav(() => navigate('/saved/watchlater'))}>
                            <img src={save} alt="Watch Later" /><p>Watch Later</p>
                        </div>
                        <div className={`side-links ${isActive('/saved/liked') ? 'active' : ''}`} onClick={() => handleNav(() => navigate('/saved/liked'))}>
                            <img src={like} alt="Liked Videos" /><p>Liked Videos</p>
                        </div>
                    </div>

                    <hr className="sidebar-hr" />

                    <div className="subscribed-list">
                        <h3>Subscriptions</h3>
                        {subscriptions.length === 0 ? (
                            <p className="no-subs">No subscriptions yet</p>
                        ) : (
                            subscriptions.map(channel => (
                                <div key={channel.id} className="side-links" onClick={() => handleNav(() => navigate(`/channel/${channel.id}`))}>
                                    <img src={channel.thumbnail} alt={channel.name} />
                                    <p>{channel.name}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar
