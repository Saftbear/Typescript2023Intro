import React, {useState, useEffect,} from 'react';
import axios from 'axios';
import { Card, Col, Row, Pagination } from 'antd';
import "./css/homepage.css"
const { Meta } = Card;

const ITEMS_PER_PAGE = 24;

const Homepage: React.FC = () => {
  const [videos, setVideos] = useState<Array<{id: number, title: string, thumbnail: string, path: string, user: string}>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    axios.get('http://192.168.0.12:3001/api/misc/get-videos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      setVideos(response.data);
    });

    window.onresize = () => {
      setCurrentPage(1);
    }
  }, []);

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const currentVideos = videos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="site-card-wrapper" style={{overflowX: 'hidden', overflowY: 'hidden', marginTop: "20px", marginLeft: "20px"}}>
      {[...Array(Math.ceil(currentVideos.length / 6))].map((_, rowIndex) => (
        <Row gutter={16} key={rowIndex}>
          {currentVideos.slice(rowIndex * 6, (rowIndex + 1) * 6).map(video => (
            <Col span={4} key={video.id} style={{ width: 220 }}>
  <Card
    hoverable
    style={{ width: 250, marginTop: "10px" }} 
    className="no-padding-card"
    cover={
      <a href={`http://192.168.0.12:3001/uploaded_files/uploads/${video.path}`}>
        <div style={{ width: '100%', height: '140px', position: 'relative' }}>
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
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute' }}
              src={`http://192.168.0.12:3001/uploaded_files/Thumbnails/${video.thumbnail}`}
              onMouseEnter={() => {
                const timer = setTimeout(() => {
                  setHoveredVideo(video.id);
                }, 50);
                setTimerId(timer);
              }}
            />
          )}
        </div>
      </a>
    }
  >
    <Meta
      title={<span style={{ fontSize: '14px' }}>{video.title}</span>}
      description={<span style={{ fontSize: '12px' }}>{`Uploaded by: ${video.user}`}</span>}
    />
  </Card>
</Col>



          ))}
        </Row>
      ))}
      <Pagination
        style={{marginTop: "20px"}}
        current={currentPage}
        total={videos.length}
        pageSize={ITEMS_PER_PAGE}
        onChange={page => setCurrentPage(page)}
      />
    </div>
  );
}

export default Homepage;
