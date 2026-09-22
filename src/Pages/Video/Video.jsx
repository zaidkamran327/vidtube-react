import './Video.css'
import PlayVideos from '../../Components/PlayVideo/PlayVideos'
import Recommended from '../../Components/Recommended/Recommended'
import { useParams } from 'react-router-dom'


const Video = () => {

    const {videoId,categoryId} = useParams();

  return (
    <div className='play-container'>
      <PlayVideos videoId={videoId}/>  
      <Recommended categoryId={categoryId}/>
    </div>
  )
}

export default Video
