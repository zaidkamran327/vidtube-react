import { useCallback, useEffect, useState } from 'react'
import './Recommended.css'
import { apiKey, fetchCachedJson, value_converter } from '../../data';
import { Link } from 'react-router-dom';
import { handleImageError } from '../../utils/imageFallback';
const Recommended = ({categoryId}) => {

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async ()=>{
    const videoRelated_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=20&regionCode=US&videoCategoryId=${categoryId}&key=${apiKey}`

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCachedJson(videoRelated_url);
      setApiData(data.items || []);
    } catch {
      setError('Recommendations are unavailable right now.');
    } finally {
      setLoading(false);
    }
  }, [categoryId])

  useEffect(()=>{
    fetchData()
  }, [fetchData])

  return (
    <div className='recommended'>
      {loading ? <p className="recommended-status">Loading recommendations...</p> : error ? (
        <p className="recommended-status error">{error}</p>
      ) : apiData.length === 0 ? (
        <p className="recommended-status">No recommendations available.</p>
      ) : apiData.map((item,index)=>{
        return (
          <Link to={`/video/${item.snippet.categoryId}/${item.id}`} key={index} className="side-video-list">
          <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} onError={handleImageError} />
          <div className="vid-info">
              <h4>{item.snippet.title}</h4>
              <p>{item.snippet.channelTitle}</p>
              <p>{value_converter(item.statistics.viewCount)} Views</p>
          </div>
        </Link>
        )
      })}
    
    </div>
  )
}

export default Recommended
