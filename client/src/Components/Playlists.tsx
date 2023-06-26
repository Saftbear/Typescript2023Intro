import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {  Link } from 'react-router-dom';
import { Card, Col, Row } from 'antd';
import "./css/homepage.css"
import { EditOutlined } from '@ant-design/icons';
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
    const token = localStorage.getItem('authToken');
    axios.get('http://localhost:3001/api/playlists/playlist', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
  <title>Platlists</title>  </Helmet>

<div className="site-card-wrapper" style={{ overflowX: 'hidden', overflowY: 'hidden', marginTop: "20px", marginLeft: "20px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {[...Array(Math.ceil(currentVideos.length / 4))].map((_, rowIndex) => (
        <Row gutter={8} key={rowIndex} justify="center">
            {currentVideos.slice(rowIndex * 4, (rowIndex + 1) * 4).map(playlist => (
            <Link to={`/playlists/${playlist.id}`}>
                <Col span={6} key={playlist.id} style={{ width: 400 }}>
                    <Card>

                        <Meta
                       title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px' }}>{playlist.name}</span>
                          <Link to={`/playlistedit/${playlist.id}`}>
                            <EditOutlined key="edit" />
                          </Link>
                        </div>}
                        
                        description={<span style={{ fontSize: '12px' }}>{`Uploaded by: ${playlist.user.username}`}</span>}
                        />
                    </Card>
                </Col>
                </Link>
            ))}
        </Row>
    ))}
</div>
</div>
);

}

export default Playlists;
