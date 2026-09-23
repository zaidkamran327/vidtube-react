import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { apiKey, fetchCachedJson, value_converter } from '../../data'
import moment from 'moment'
import './Shorts.css'
import StatusMessage from '../../Components/StatusMessage';

const parseDuration = (iso) => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 999;
    return (parseInt(match[1] || 0) * 3600) + (parseInt(match[2] || 0) * 60) + parseInt(match[3] || 0);
};

const Shorts = ({ sidebar, mobileSidebarOpen, setMobileSidebarOpen }) => {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);
    const [descExpanded, setDescExpanded] = useState(false);

    useEffect(() => {
        const fetchShorts = async () => {
            setLoading(true);
            setError(null);
            const searchRes = await fetchCachedJson(
                `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=shorts&type=video&videoDuration=short&regionCode=US&relevanceLanguage=en&key=${apiKey}`
            );

            if (!searchRes.items?.length) { setLoading(false); return; }

            const ids = searchRes.items.map(i => i.id.videoId).join(',');
            const detailRes = await fetchCachedJson(
                `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids}&key=${apiKey}`
            );

            const filtered = (detailRes.items || []).filter(v => parseDuration(v.contentDetails.duration) <= 60);
            setShorts(filtered);
            setLoading(false);
        };
        fetchShorts().catch(() => {
            setError('Unable to load Shorts right now.');
            setLoading(false);
        });
    }, [retry]);

    const prev = useCallback(() => { setIndex(i => Math.max(0, i - 1)); setDescExpanded(false); }, []);
    const next = useCallback(() => { setIndex(i => Math.min(shorts.length - 1, i + 1)); setDescExpanded(false); }, [shorts.length]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowUp') prev();
            if (e.key === 'ArrowDown') next();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [prev, next]);

    const current = shorts[index];
    const desc = current?.snippet.description || '';

    return (
        <>
            <Sidebar
                sidebar={sidebar}
                category={null}
                setCategory={(cat) => navigate(`/?category=${cat}`)}
                mobileSidebarOpen={mobileSidebarOpen}
                setMobileSidebarOpen={setMobileSidebarOpen}
            />
            <div className={`shorts-container ${sidebar ? '' : 'large-shorts-container'}`}>
                {loading ? (
                    <div className="shorts-skeleton">
                        <div className="skeleton-player" />
                    </div>
                ) : error ? (
                    <StatusMessage title="Shorts unavailable" message={error} onRetry={() => setRetry(value => value + 1)} />
                ) : !current ? (
                    <p className="shorts-empty">No Shorts are available right now.</p>
                ) : (
                    <div className="shorts-wrapper">
                        <div className="shorts-player-row">
                            <div className="shorts-player">
                                <iframe
                                    key={current.id}
                                    src={`https://www.youtube.com/embed/${current.id}?autoplay=1&loop=1&playlist=${current.id}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            <div className="shorts-nav-btns">
                                <button onClick={prev} disabled={index === 0} className="nav-btn" title="Previous (↑)">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                                </button>
                                <span className="nav-count">{index + 1} / {shorts.length}</span>
                                <button onClick={next} disabled={index === shorts.length - 1} className="nav-btn" title="Next (↓)">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                                </button>
                            </div>
                        </div>

                        <div className="shorts-info">
                            <p className="shorts-channel" onClick={() => navigate(`/channel/${current.snippet.channelId}`)}>
                                {current.snippet.channelTitle}
                            </p>
                            <h2>{current.snippet.title}</h2>
                            <p className="shorts-meta">
                                {value_converter(current.statistics.viewCount)} views &bull; {moment(current.snippet.publishedAt).fromNow()}
                            </p>
                            {desc.length > 0 && (
                                <div className="shorts-desc-box">
                                    <p>{descExpanded ? desc : desc.slice(0, 100)}{!descExpanded && desc.length > 100 ? '...' : ''}</p>
                                    {desc.length > 100 && (
                                        <span className="desc-toggle" onClick={() => setDescExpanded(p => !p)}>
                                            {descExpanded ? 'Show less' : 'Show more'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Shorts;
