// VideoEdit.tsx

import React, { useState, useEffect} from 'react';
import { Form, Input, Select,  Button, message, Card, Upload } from 'antd';
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from './Routes/ProtectedRoute';
import { Helmet } from 'react-helmet';
import "./css/upload.css"
import { useAuth } from './authContext';

const { Dragger } = Upload;
const { Option } = Select;

const VideoEdit: React.FC = () => {
  const initialVideoDetails = { title: '', description: '', playlists: [] };

    const [fileName, setFileName] = useState<string | null>(null);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
    const [customThumbnail, setCustomThumbnail] = useState<string  | null>(null);
    const [playlists, setPlaylists] = useState([]);
    const [isCustomThumbnail, setIsCustomThumbnail] = useState(false);
    const { videoPath } = useParams<{ videoPath: string }>();
    const [videoDetails, setVideoDetails] = useState(initialVideoDetails);
    const [isLoading, setIsLoading] = useState(true); 
    const { logout, user } = useAuth();
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!videoPath) {
          return;
        }
        const fetchDetails = async () => {
          try {
              const response = await axios.get(`http://localhost:3001/api/video/get-video/${videoPath}`, {
                  headers: {
                      path: videoPath,
                  },
              });

              if (user?.username !== response.data.user.username) {
                navigate('/Error404');  
              } else {
                setVideoDetails(response.data);
              }


              setVideoDetails(response.data);
              setIsLoading(false); 
          } catch (error) {
              console.log(error);
          }
      };
      fetchDetails();

        setFileName(videoPath.split('.').slice(0, -1).join('.'));
      }, [videoPath]);

    const probs_thumbnail: UploadProps = {
        name: 'file',
        multiple: false,
        action: 'http://localhost:3001/api/misc/upload-thumbnail',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          fileName: fileName!,
        },
        accept: "image/*",
        onChange(info) {
     
          const { status } = info.file;
          if (status !== 'uploading') {
    
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            const newThumbnail = fileName + "/" + info.file.response.fileName;

            setCustomThumbnail(newThumbnail);
            console.log()
            setIsCustomThumbnail(true)
            setThumbnails(prevThumbnails => [...prevThumbnails, newThumbnail]);

            message.success(`${info.file.name} file uploaded successfully.`);
          
          } else if (status === 'error') {
            if(info.file.response){
        
              if (info.file.response.message === "Invalid token: no such user.") {
                logout();
              }
              message.error(`${info.file.response.message}`);
            }else{
    
              message.error(`Error Uploading File`);
    
            }
          }
        },
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
        },
      };
    

      useEffect(() => {
        const fetchPlaylists = async () => {
          try {
            const response = await axios.get('http://localhost:3001/api/playlists/playlist', {
              headers: {
                Authorization: 'Bearer ' + localStorage.getItem('authToken'),
              },
            });
            console.log(response.data)
            setPlaylists(response.data);
          } catch (error) {
            console.error('Error fetching playlists:', error);
          }
        };
        
        fetchPlaylists();
      }, []);
    
      useEffect(() => {
        let intervalId: NodeJS.Timeout;
      
        const checkThumbnails = async () => {
          if (fileName) {
            try {
              const response = await axios.get(`http://localhost:3001/api/misc/check-thumbnails/${fileName}`);
              if (response.data.thumbnails && response.data.thumbnails.length > 0) {
    
                console.log(thumbnails)
                setThumbnails(response.data.thumbnails.map((thumbnail: string) => fileName + "/" + thumbnail));
    
                if (!thumbnails.length) {
                  setSelectedThumbnail(fileName + "/" + response.data.thumbnails[0]);
                }
                setIsCustomThumbnail(false)
                clearInterval(intervalId); // Stop polling once thumbnails are received
              }
            } catch (error) {
              console.error('Error checking for thumbnails:', error);
            }
          }
        };
      
        intervalId = setInterval(checkThumbnails, 1000); 
      
        // Clear interval on component unmount
        return () => clearInterval(intervalId);
      }, [fileName]);
      
  const handleVideoFormSubmit = async (values: { title: string; description: string, playlist:string[] }) => {


    console.log(values.playlist)
    const videoData = {
      title: values.title,
      description: values.description,
      fileName,
      thumbnail: isCustomThumbnail ? customThumbnail : selectedThumbnail, //
      playlist: values.playlist,
    };



    try {
      await axios.post('http://localhost:3001/api/video/videos', videoData, {
      
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          filename: videoPath
        },
      });

      alert("Video edited successfully!");
      
    } catch (error) {
      console.error('Error creating video:', error);

    } 

  };
  
  const handleThumbnailClick = (thumbnailName: string) => {
    setSelectedThumbnail(thumbnailName);
    setIsCustomThumbnail(false); // Set isCustomThumbnail to false
    console.log(thumbnailName)
  };
  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this video?");
    if (!confirmDelete) {
        return;
    }
    const path = {'path': videoPath}
    try {
    const response = await axios.post('http://localhost:3001/api/video/delete-video', path,{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        }
    });
    navigate("/homepage")
  }catch(error){
    console.log(error)
  }

  };
  if (isLoading) {
    return <div>Loading...</div>; 
  }
  return (
    <ProtectedRoute>
      <Helmet>
        <title>
          Edit Video
        </title>
      </Helmet>
    <div>
    <legend>Edit details</legend>

    <Form onFinish={handleVideoFormSubmit}
      initialValues={{
        title: videoDetails.title,
        description: videoDetails.description,
        
        playlist: videoDetails.playlists ? videoDetails.playlists.map((playlist: any) => playlist.id) : [],

      }}
    >

      <Form.Item label="Title" name="title" rules={[{ required: true }]}>
        <Input maxLength={60} showCount />
      </Form.Item>
      <Form.Item label="Description" name="description" rules={[{ required: true }]}>
        <Input.TextArea rows={5} maxLength={200} showCount />
      </Form.Item>
      <Form.Item label="Playlist" name="playlist">
        <Select mode="multiple" placeholder="Select playlist">
          {playlists.map((playlist: any, index: number) => (
            <Option value={playlist.id} key={index}>{playlist.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
      <Dragger {...probs_thumbnail} maxCount={1}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single upload
          </p>
          
        </Dragger>
    </Form.Item>
    <Form.Item label="Choose thumbnail">
      <div className="row">
        {thumbnails.map((thumbnail, index) => (
          <Card
            hoverable
            bordered={false} 
            bodyStyle={{ padding: 0 }} 
            style={{ width: '200px', margin: '10px', }} 
            cover={
              <img
                src={`http://localhost:3001/uploaded_files/Thumbnails/${thumbnail}`}
                alt={`Thumbnail ${index + 1}`}
              />
            }
            onClick={() => handleThumbnailClick(thumbnail)}
            className={`thumbnail-card${thumbnail === selectedThumbnail ? ' selected-thumbnail' : ''}`}
          >
            {thumbnail === selectedThumbnail && <CheckCircleOutlined className="selected-icon" />}
          </Card>
        ))}
      </div>
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit" style={{ marginTop: '35px' }}>Edit Video</Button>
    </Form.Item>

    <Button danger onClick={handleDeleteClick} style={{ marginTop: '35px' }}>Delete Video</Button>



  </Form>
</div>
</ProtectedRoute>
  );
};

export default VideoEdit;
