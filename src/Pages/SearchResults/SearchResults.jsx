import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { apiKey, fetchCachedJson } from '../../data'
import moment from 'moment'
import Sidebar from '../../Components/Sidebar/Sidebar'
import SkeletonFeed from '../../Components/Feed/SkeletonCard'
import { handleImageError } from '../../utils/imageFallback';
import StatusMessage from '../../Components/StatusMessage';
import './SearchResults.css'

const SearchResults = ({ sidebar, mobileSidebarOpen, setMobileSidebarOpen }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const navigate = useNavigate();

    const handleCategory = (cat) => navigate(`/?category=${cat}`);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        const search_url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

        fetchCachedJson(search_url)
            .then(data => setResults(data.items || []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [query, retry]);

    const content = () => {
        if (loading) return <SkeletonFeed />;
        if (!query) return <p className="search-status">Search for a video to see results.</p>;
        if (error) return <StatusMessage title="Search unavailable" message="We could not load these results right now." onRetry={() => setRetry(value => value + 1)} />;
        if (!results.length) return <p className="search-status">No videos matched &quot;{query}&quot;. Try a different search.</p>;

        return (
            <>
                <h2>Results for &quot;{query}&quot;</h2>
                {results.map((item) => (
                    <Link to={`/video/${item.snippet.categoryId || 0}/${item.id.videoId}`} key={item.id.videoId} className="search-card">
                        <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} onError={handleImageError} />
                        <div className="search-card-info">
                            <h3>{item.snippet.title}</h3>
                            <p className="channel-name">{item.snippet.channelTitle}</p>
                            <p className="published">{moment(item.snippet.publishedAt).fromNow()}</p>
                            <p className="description">{item.snippet.description}</p>
                        </div>
                    </Link>
                ))}
            </>
        );
    };

    return (
        <>
            <Sidebar
                sidebar={sidebar}
                category={null}
                setCategory={handleCategory}
                mobileSidebarOpen={mobileSidebarOpen}
                setMobileSidebarOpen={setMobileSidebarOpen}
            />
            <div className={`search-container ${sidebar ? '' : 'large-search-container'}`}>
                {content()}
            </div>
        </>
    )
}

export default SearchResults
