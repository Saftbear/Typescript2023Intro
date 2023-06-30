import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { useSearch } from './searchContext';

import "./css/homepage.css"
import { EditOutlined } from '@ant-design/icons';
import { useAuth } from './authContext';
import { Helmet } from 'react-helmet';
const { Meta } = Card;

const ITEMS_PER_PAGE = 24; // Change this if screen is too big 

const Homepage: React.FC = () => {
  const [videos, setVideos] = useState<Array<{id: number, title: string, thumbnail: string, path: string, user: string}>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const { searchTerm } = useSearch();

  const { user } = useAuth();

  useEffect(() => {

    axios.get('http://localhost:3001/api/misc/get-videos', {
 
    }).then((response) => {
      setVideos(response.data);
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

  const currentVideos = videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, currentPage * ITEMS_PER_PAGE); 
    return (
    <div>
      <Helmet>
        <title>
      Homepage
       </title>
      </Helmet>

      <div className="site-card-wrapper" style={{ 
    overflowX: 'hidden', 
    overflowY: 'hidden', 
    marginTop: "20px", 
    marginLeft: "20px", 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gridGap: '20px', 
}}>

    {currentVideos.map((video, index) => (
        <div key={video.id} className="video-card">
            <Card
                style={{ width: '100%', marginTop: "15px", border: "none", height: "280px" }} 
                className="no-padding-card"

                cover={
                    <Link to={`/video/${video.path}`}>
                    <div style={{ width: '100%', height: '190px', position: 'relative' }}>
                    {hoveredVideo === video.id ? (
                        <video 
                        src={`http://localhost:3001/uploaded_files/ShortVideos/${video.path.split('.').slice(0, -1).join('.')}/output.mp4`} 
                        autoPlay
                        loop
                        style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', borderRadius:"6px" }}
                        onMouseLeave={() => {
                            if (timerId) {
                            clearTimeout(timerId);
                            }
                            setHoveredVideo(null);
                        }}
                        />
                    ) : (
                        <img
                        className="video-thumbnail"
                        alt={video.title}
                        style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute',  borderRadius:"6px" }}
                        src={`http://localhost:3001/uploaded_files/Thumbnails/${video.thumbnail}`}
                        onMouseEnter={() => {
                            const timer = setTimeout(() => {
                            setHoveredVideo(video.id);
                            }, 50);
                            setTimerId(timer);
                        }}
                        />
                    )}
                
                    </div>
                    </Link>
                    }           
          
            >
                <Meta

            title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="video-title" style={{ fontSize: '14px' }}>          {video.title.length > 26 ? video.title.substring(0, 26) + "..." : video.title}
</span>
                {video.user === user?.username && 
                <Link to={`/videoedit/${video.path}`}>
                    <EditOutlined key="edit" />
                </Link>
                }
            </div>
            }
            description={<span className="video-user" style={{ fontSize: '12px' }}>{`Uploaded by: ${video.user}`}</span>}
            />
            </Card>
        </div>
    ))}

</div>
</div>

);

}

export default Homepage;
