import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Homes from './Pages/Home/Homes'
import Video from "./Pages/Video/Video";
import SearchResults from './Pages/SearchResults/SearchResults';
import SavedVideos from './Pages/SavedVideos/SavedVideos';
import Channel from './Pages/Channel/Channel';
import Shorts from './Pages/Shorts/Shorts';
import Profile from './Pages/Profile/Profile';
import StatusMessage from './Components/StatusMessage';

const App = () => {
    const [sidebar, setsidebar] = useState(true);

    return (
        <div>
            <Navbar setsidebar={setsidebar} />
            <Routes>
                <Route path='/' element={<Homes sidebar={sidebar} />} />
                <Route path='/video/:categoryId/:videoId' element={<Video />} />
                <Route path='/search' element={<SearchResults sidebar={sidebar} />} />
                <Route path='/saved/:type' element={<SavedVideos sidebar={sidebar} />} />
                <Route path='/channel/:channelId' element={<Channel sidebar={sidebar} />} />
                <Route path='/shorts' element={<Shorts sidebar={sidebar} />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='*' element={<StatusMessage title="Page not found" message="The page you are looking for does not exist." />} />
            </Routes>
        </div>
    )
}

export default App
