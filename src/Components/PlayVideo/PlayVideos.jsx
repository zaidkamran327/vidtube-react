import { useCallback, useEffect, useState } from 'react'
import './Playvideo.css'
import like from '../../assets/like.png'
import dislike from '../../assets/dislike.png'
import share from '../../assets/share.png'
import save from '../../assets/save.png'
import jack from '../../assets/jack.png'
import { apiKey, fetchCachedJson, value_converter } from '../../data'
import moment from 'moment'
import { useParams, useNavigate } from 'react-router-dom'
import { useSubscriptions } from '../../context/SubscriptionContext'
import { useSaved } from '../../context/SavedContext'
import StatusMessage from '../StatusMessage';
import { handleAvatarError } from '../../utils/imageFallback';

const PlayVideos = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { subscribe, unsubscribe, isSubscribed } = useSubscriptions();
  const { toggleWatchLater, toggleLikedVideo, isInWatchLater, likedVideos } = useSaved();

  const [apiData, setApiData] = useState(null);
  const [channeldata, setchannelData] = useState(null);
  const [commentData, setcommentData] = useState([]);
  const [commentLikes, setCommentLikes] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState('');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [commentsError, setCommentsError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    setLiked(likedVideos.some(video => video.id === videoId));
  }, [videoId, likedVideos]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const buildVideoObj = (data) => ({
    id: videoId,
    title: data.snippet.title,
    thumbnail: data.snippet.thumbnails.medium.url,
    channelTitle: data.snippet.channelTitle,
    categoryId: data.snippet.categoryId || 0,
  });

  const handleLike = () => {
    if (!apiData) return;
    const video = buildVideoObj(apiData);
    toggleLikedVideo(video);
    if (liked) {
      setLiked(false);
    } else {
      setLiked(true);
      setDisliked(false);
      showToast('Added to Liked Videos');
    }
  };

  const handleDislike = () => {
    const dislikes = JSON.parse(localStorage.getItem('yt_dislikes') || '[]');
    if (disliked) {
      localStorage.setItem('yt_dislikes', JSON.stringify(dislikes.filter(id => id !== videoId)));
      setDisliked(false);
    } else {
      localStorage.setItem('yt_dislikes', JSON.stringify([...dislikes, videoId]));
      setDisliked(true);
      if (liked) {
        if (apiData) toggleLikedVideo(buildVideoObj(apiData));
        setLiked(false);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  };

  const handleSave = () => {
    if (!apiData) return;
    const video = buildVideoObj(apiData);
    const alreadySaved = isInWatchLater(videoId);
    toggleWatchLater(video);
    showToast(alreadySaved ? 'Removed from Watch Later' : 'Saved to Watch Later');
  };

  const handleCommentLike = (commentId, originalCount) => {
    setCommentLikes(prev => {
      const liked = prev[commentId];
      return { ...prev, [commentId]: liked ? null : originalCount + 1 };
    });
  };

  const fetchotherData = useCallback(async () => {
    if (!apiData) return;
    const channelData_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${apiData.snippet.channelId}&key=${apiKey}`;
    const channelData = await fetchCachedJson(channelData_url);
    setchannelData(channelData.items?.[0] || null);
    const comment_url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&videoId=${videoId}&key=${apiKey}`;
    try {
      const comments = await fetchCachedJson(comment_url);
      setcommentData(comments.items || []);
    } catch {
      setCommentsError('Comments are unavailable right now.');
    }
  }, [apiData, videoId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setApiData(null);
    setchannelData(null);
    setcommentData([]);
    setCommentsError(null);
    setExpanded(false);
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${apiKey}`;

    fetchCachedJson(url)
      .then(data => {
        const video = data.items?.[0];
        if (!video) throw new Error('Video not found.');
        if (!cancelled) setApiData(video);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [videoId, retry]);

  useEffect(() => {
    if (apiData) fetchotherData().catch(() => setError('Some video details are unavailable.'));
  }, [apiData, fetchotherData]);

  const handleSubscribe = () => {
    if (!channeldata) return;
    setSubscribing(true);
    const channel = {
      id: channeldata.id,
      name: channeldata.snippet.title,
      thumbnail: channeldata.snippet.thumbnails.default.url,
    };
    isSubscribed(channeldata.id) ? unsubscribe(channeldata.id) : subscribe(channel);
    setTimeout(() => setSubscribing(false), 300);
  };

  const subscribed = channeldata ? isSubscribed(channeldata.id) : false;
  const saved = isInWatchLater(videoId);
  const description = apiData?.snippet.description || '';

  if (loading) return (
    <div className="play-video video-loading-state">
      <div className="video-skeleton" />
      <p>Loading video...</p>
    </div>
  );

  if (error || !apiData) return <StatusMessage title="Video unavailable" message={error || 'This video is no longer available.'} onRetry={() => setRetry(value => value + 1)} />;

  return (
    <div className='play-video'>
      <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen>
      </iframe>

      <h3>{apiData ? apiData.snippet.title : 'Title'}</h3>

      <div className="play-video-info">
        <p>{apiData ? value_converter(apiData.statistics.viewCount) : '0'} Views &bull; {apiData ? moment(apiData.snippet.publishedAt).fromNow() : ''}</p>
        <div>
          <span className={`action-btn ${liked ? 'active-like' : ''}`} onClick={handleLike}>
            <img src={like} alt="" />{apiData ? value_converter(apiData.statistics.likeCount) : '0'}
          </span>
          <span className={`action-btn ${disliked ? 'active-dislike' : ''}`} onClick={handleDislike}>
            <img src={dislike} alt="" />
          </span>
          <span className="action-btn" onClick={handleShare}>
            <img src={share} alt="" />Share
          </span>
          <span className={`action-btn ${saved ? 'active-save' : ''}`} onClick={handleSave}>
            <img src={save} alt="" />{saved ? 'Saved' : 'Save'}
          </span>
        </div>
      </div>

      <hr />

      <div className="publisher">
            <img src={channeldata ? channeldata.snippet.thumbnails.default.url : jack} alt={channeldata ? channeldata.snippet.title : 'Channel'} onError={handleAvatarError} />
        <div>
          <p className="channel-link" onClick={() => channeldata && navigate(`/channel/${channeldata.id}`)}>{apiData ? apiData.snippet.channelTitle : ''}</p>
          <span>{channeldata ? value_converter(channeldata.statistics.subscriberCount) : '0'} Subscribers</span>
        </div>
        <button onClick={handleSubscribe} disabled={!channeldata || subscribing} className={subscribed ? 'subscribed' : ''}>
          {subscribing ? 'Saving...' : subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      <div className="vid-discription">
        <div className="desc-box">
          <p>{expanded ? description : description.slice(0, 200)}{!expanded && description.length > 200 ? '...' : ''}</p>
          {description.length > 200 && (
            <span className="desc-toggle" onClick={() => setExpanded(p => !p)}>
              {expanded ? 'Show less' : 'Show more'}
            </span>
          )}
        </div>
        <hr />
        <h4>{apiData ? value_converter(apiData.statistics.commentCount) : '0'} Comments</h4>

        {commentsError ? <p className="comments-status">{commentsError}</p> : commentData.length === 0 ? (
          <p className="comments-status">No comments available.</p>
        ) : commentData.map((item, index) => {
          const c = item.snippet.topLevelComment.snippet;
          const commentId = item.snippet.topLevelComment.id;
          const isCommentLiked = commentLikes[commentId] !== undefined && commentLikes[commentId] !== null;
          const displayCount = isCommentLiked ? commentLikes[commentId] : c.likeCount;
          return (
            <div key={index} className="comment">
              <img src={c.authorProfileImageUrl} alt={c.authorDisplayName} onError={handleAvatarError} />
              <div>
                <h3>{c.authorDisplayName} <span>{moment(c.publishedAt).fromNow()}</span></h3>
                <p dangerouslySetInnerHTML={{ __html: c.textDisplay }} />
                <div className="comment-action">
                  <img
                    src={like}
                    alt=""
                    className={isCommentLiked ? 'comment-liked' : ''}
                    onClick={() => handleCommentLike(commentId, Number(c.likeCount))}
                  />
                  <span>{value_converter(displayCount)}</span>
                  <img src={dislike} alt="" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
};

export default PlayVideos;
