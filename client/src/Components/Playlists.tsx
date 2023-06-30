import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {  Link } from 'react-router-dom';
import { Card} from 'antd';

import "./css/homepage.css"
import { Helmet } from 'react-helmet';
interface User{
    id: number,
    username: string,

}
const { Meta } = Card;

const ITEMS_PER_PAGE = 24; // Change this if screen is too big 

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Array<{id: number, name: string, user: User}>>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios.get('http://localhost:3001/api/playlists/playlist', {
    }).then((response) => {
  
      setPlaylists(response.data);
    });
  }, []);

  // Implement the infinite scroll
  const handleScroll = useCallback(() => {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
    if (scrollTop + window.innerHeight + 50 >= scrollHeight){
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const currentVideos = playlists.slice(0, currentPage * ITEMS_PER_PAGE);
  return (
<div>
  <Helmet>
  <title>Playlists</title>  </Helmet>

  <div className="site-card-wrapper" style={{ 
    overflowX: 'hidden', 
    overflowY: 'hidden', 
    marginTop: "20px", 
    marginLeft: "20px", 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gridGap: '20px', 
}}>

    {currentVideos.map((playlist, index) => (
        <Link to={`/playlists/${playlist.id}`} key={playlist.id}>
            <div>
                <Card>

                    <Meta
                   title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>{playlist.name}</span>
         
                    </div>}
                    
                    description={<span style={{ fontSize: '12px' }}>{`Uploaded by: ${playlist.user.username}`}</span>}
                    />
                </Card>
            </div>
        </Link>
    ))}

</div>
</div>
);

}

export default Playlists;
