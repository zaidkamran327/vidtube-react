import { useEffect, useState } from 'react'
import './Feed.css'
import { Link } from 'react-router-dom';
import { apiKey, fetchCachedJson, value_converter } from '../../data';
import SkeletonFeed from './SkeletonCard';
import moment from 'moment';
import { handleImageError } from '../../utils/imageFallback';
import StatusMessage from '../StatusMessage';

const REGIONS = ['US', 'GB', 'CA', 'AU'];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Parse ISO 8601 duration to seconds — filters out Shorts (< 60s)
const parseDuration = (iso) => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    return h * 3600 + m * 60 + s;
};

const Feed = ({ category }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
        const targetCount = category === 0 ? 70 : 20;
        const buildUrl = (r, pageToken = '') => {
            const params = new URLSearchParams({
                part: 'snippet,contentDetails,statistics',
                chart: 'mostPopular',
                maxResults: '50',
                regionCode: r,
                relevanceLanguage: 'en',
                key: apiKey,
            });
            if (category !== 0) params.set('videoCategoryId', category);
            if (pageToken) params.set('pageToken', pageToken);
            return `https://youtube.googleapis.com/youtube/v3/videos?${params}`;
        };

        const fetchVideos = async (selectedRegion) => {
            const videos = [];
            const seenIds = new Set();
            let pageToken = '';

            while (videos.length < targetCount) {
                const page = await fetchCachedJson(buildUrl(selectedRegion, pageToken));

                (page.items || []).forEach(item => {
                    if (!seenIds.has(item.id) && parseDuration(item.contentDetails.duration) > 60) {
                        seenIds.add(item.id);
                        videos.push(item);
                    }
                });

                if (!page.nextPageToken || !(page.items || []).length) break;
                pageToken = page.nextPageToken;
            }

            return videos.slice(0, targetCount);
        };

        fetchVideos(region)
            .catch(() => fetchVideos('US'))
            .then(videos => setData(shuffle(videos)))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [category, retry]);

    if (loading) return <SkeletonFeed />;
    if (error) return (
        <StatusMessage title="Videos unavailable" message="We could not load videos right now." onRetry={() => setRetry(value => value + 1)} />
    );
    if (!data.length) return <div className="feed-status">No videos are available for this category right now.</div>;

    return (
        <div className="feed">
            {data.map((item) => (
                <Link to={`/video/${item.snippet.categoryId}/${item.id}`} key={item.id} className='card'>
                    <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} onError={handleImageError} />
                    <h2>{item.snippet.title}</h2>
                    <h3>{item.snippet.channelTitle}</h3>
                    <p>{value_converter(item.statistics.viewCount)} views &bull; {moment(item.snippet.publishedAt).fromNow()}</p>
                </Link>
            ))}
        </div>
    )
}

export default Feed
