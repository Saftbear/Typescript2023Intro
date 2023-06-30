// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Homepage from './Components/Homepage';
import Error404 from './Components/NotFound';
import Register from './Components/Register';
import Login from './Components/Login';
import { AuthProvider } from './Components/authContext';
import VideoPlayer from './Components/VideoPlayer';

import Layout from './Components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreatePlaylist from './Components/CreatePlaylist';
import UploadForm from './Components/UploadVideo';
import VideoEdit from './Components/VideoEdit';
import Playlists from './Components/Playlists';
import PlaylistVideos from './Components/PlaylistVideos';
import { SearchProvider } from './Components/searchContext';

const App: React.FC = () => {


  return (
    <Router>
        <AuthProvider>
          <SearchProvider>
            <Layout>
              <Routes>
                <Route path="/videoedit/:videoPath" element={<VideoEdit />} />
                <Route path="/upload" element={<UploadForm />} />
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/" element={<Homepage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlists/:playlistId" element={<PlaylistVideos />} />
                <Route path='*' element={<Error404 />}/>
                <Route path="/video/:videoPath" element={<VideoPlayer/>} />
                <Route path='/create-playlist' element={<CreatePlaylist/>}></Route>
              </Routes>
            </Layout>
          </SearchProvider>
        </AuthProvider>
    </Router>
  );
};


export default App;
