import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { apiKey, fetchCachedJson, value_converter } from '../../data'
import moment from 'moment'
import './Channel.css'
import StatusMessage from '../../Components/StatusMessage';
import { handleAvatarError, handleImageError } from '../../utils/imageFallback';
import { useSubscriptions } from '../../context/SubscriptionContext';

const Channel = ({ sidebar }) => {
    const { channelId } = useParams();
    const navigate = useNavigate();
    const { subscribe, unsubscribe, isSubscribed } = useSubscriptions();

    const [channelInfo, setChannelInfo] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);

    const subscribed = channelInfo ? isSubscribed(channelInfo.id) : false;

    const handleSubscribe = () => {
        if (!channelInfo) return;
        const channel = {
            id: channelInfo.id,
            name: channelInfo.snippet.title,
            thumbnail: channelInfo.snippet.thumbnails.default.url,
        };
        subscribed ? unsubscribe(channelInfo.id) : subscribe(channel);
    };

    useEffect(() => {
        const fetchChannel = async () => {
            setLoading(true);
            setError(null);

            const channelRes = await fetchCachedJson(
                `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`
            );

            const channel = channelRes.items?.[0];
            if (!channel) throw new Error('Channel not found.');
            setChannelInfo(channel);

            const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
            const videosRes = await fetchCachedJson(
                `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=${uploadsPlaylistId}&key=${apiKey}`
            );

            setVideos(videosRes.items || []);
            setLoading(false);
        };

        fetchChannel().catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [channelId, retry]);

    return (
        <>
            <Sidebar sidebar={sidebar} category={null} setCategory={(cat) => navigate(`/?category=${cat}`)} />
            <div className={`channel-container ${sidebar ? '' : 'large-channel-container'}`}>
                {loading ? (
                    <div className="channel-skeleton" aria-label="Loading channel">
                        <div className="skeleton skeleton-channel-header" />
                        <div className="skeleton-channel-grid">
                            {Array(6).fill(0).map((_, index) => <div className="skeleton skeleton-channel-card" key={index} />)}
                        </div>
                    </div>
                ) : error ? (
                    <StatusMessage title="Channel unavailable" message="We could not load this channel right now." onRetry={() => setRetry(value => value + 1)} />
                ) : !channelInfo ? (
                    <p className="channel-status">This channel could not be found.</p>
                ) : (
                    <>
                        <div className="channel-header">
                            <img src={channelInfo.snippet.thumbnails.medium.url} alt={channelInfo.snippet.title} onError={handleAvatarError} />
                            <div className="channel-details">
                                <h2>{channelInfo.snippet.title}</h2>
                                <p>{value_converter(channelInfo.statistics.subscriberCount)} subscribers &bull; {value_converter(channelInfo.statistics.videoCount)} videos</p>
                                <p className="channel-desc">{channelInfo.snippet.description.slice(0, 150)}{channelInfo.snippet.description.length > 150 ? '...' : ''}</p>
                            </div>
                            <button
                                className={`channel-subscribe ${subscribed ? 'subscribed' : ''}`}
                                onClick={handleSubscribe}
                            >
                                {subscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        </div>

                        <h3 className="channel-videos-title">Videos</h3>
                        {videos.length === 0 ? (
                            <p className="channel-status">This channel has no videos available.</p>
                        ) : <div className="channel-grid">
                            {videos.map(item => {
                                const s = item.snippet;
                                const vidId = s.resourceId.videoId;
                                return (
                                    <Link to={`/video/0/${vidId}`} key={vidId} className="channel-card">
                                        <img src={s.thumbnails.medium.url} alt={s.title} onError={handleImageError} />
                                        <h4>{s.title}</h4>
                                        <p>{moment(s.publishedAt).fromNow()}</p>
                                    </Link>
                                );
                            })}
                        </div>}
                    </>
                )}
            </div>
        </>
    );
};

export default Channel;
