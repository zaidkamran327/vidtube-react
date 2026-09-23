import { Link, useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { useSaved } from '../../context/SavedContext'
import './SavedVideos.css'

const SavedVideos = ({ sidebar, mobileSidebarOpen, setMobileSidebarOpen }) => {
    const { type } = useParams();
    const { watchLater, likedVideos } = useSaved();

    const navigate = useNavigate();
    const handleCategory = (cat) => navigate(`/?category=${cat}`);
    const isLiked = type === 'liked';
    const videos = isLiked ? likedVideos : watchLater;
    const title = isLiked ? 'Liked Videos' : 'Watch Later';

    return (
        <>
            <Sidebar
                sidebar={sidebar}
                category={null}
                setCategory={handleCategory}
                mobileSidebarOpen={mobileSidebarOpen}
                setMobileSidebarOpen={setMobileSidebarOpen}
            />
            <div className={`saved-container ${sidebar ? '' : 'large-saved-container'}`}>
                <h2>{title}</h2>
                {videos.length === 0 ? (
                    <p className="saved-empty">No videos here yet.</p>
                ) : (
                    <div className="saved-grid">
                        {videos.map(video => (
                            <Link to={`/video/${video.categoryId}/${video.id}`} key={video.id} className="saved-card">
                                <img src={video.thumbnail} alt={video.title} />
                                <h3>{video.title}</h3>
                                <p>{video.channelTitle}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default SavedVideos
