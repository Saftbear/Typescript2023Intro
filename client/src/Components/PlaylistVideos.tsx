import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link,useParams } from 'react-router-dom';
import { Card, Col, Row } from 'antd';
import "./css/homepage.css"
import { EditOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';

const { Meta } = Card;

const ITEMS_PER_PAGE = 24; // Change this if screen is too big 

const PlaylistVideos: React.FC = () => {
  const [videos, setVideos] = useState<Array<{id: number, title: string, thumbnail: string, path: string, user: string}>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const { playlistId } = useParams<{ playlistId: string }>();
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    axios.get('http://localhost:3001/api/playlists/playlist-videos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        playlistid: playlistId
      }
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

  const currentVideos = videos.slice(0, currentPage * ITEMS_PER_PAGE);
  return (

    <div>


    <Helmet>
    <title>Playlist</title>
  </Helmet>

<div className="site-card-wrapper" style={{ overflowX: 'hidden', overflowY: 'hidden', marginTop: "20px", marginLeft: "20px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {[...Array(Math.ceil(currentVideos.length / 4))].map((_, rowIndex) => (
        <Row gutter={8} key={rowIndex} justify="center">
            {currentVideos.slice(rowIndex * 4, (rowIndex + 1) * 4).map(video => (
                <Col span={6} key={video.id} style={{ width: 400 }}>
                    <Card
                        style={{ width: 350, marginTop: "15px", border: "none", height: "280px" }} 
                        className="no-padding-card"
          
                        cover={
                            <Link to={`/video/${video.path}`}>
                            <div style={{ width: '100%', height: '190px', position: 'relative' }}>
                            {hoveredVideo === video.id ? (
                                <video 
                                src={`http://192.168.0.12:3001/uploaded_files/ShortVideos/${video.path.split('.').slice(0, -1).join('.')}/output.mp4`} 
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
                          <span style={{ fontSize: '14px' }}>{video.title}</span>
                          <Link to={`/videoedit/${video.path}`}>
                            <EditOutlined key="edit" />
                          </Link>
                        </div>}
                        
                        description={<span style={{ fontSize: '12px' }}>{`Uploaded by: ${video.user}`}</span>}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    ))}
</div>
</div>
);

}

export default PlaylistVideos;
