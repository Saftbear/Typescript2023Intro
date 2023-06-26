// VideoEdit.tsx

import React, { useState, useEffect} from 'react';
import { Form, Input, Select, Checkbox, Button, Spin, message, Card, Upload } from 'antd';
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from './Routes/ProtectedRoute';
import { Helmet } from 'react-helmet';
import "./css/upload.css"

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
    const [videoDetails, setVideoDetails] = useState(initialVideoDetails); // State variable to store the video details
    const [isLoading, setIsLoading] = useState(true); // set

    const navigate = useNavigate();

    useEffect(() => {
        if (!videoPath) {
          return;
        }
        const fetchDetails = async () => {
          try {
              const response = await axios.get(`http://localhost:3001/api/video/get-video/`, {
                  headers: {
                      Authorization: 'Bearer ' + localStorage.getItem('authToken'),
                      path: videoPath,
                  },
              });
              setVideoDetails(response.data);
              setIsLoading(false); // set loading state to false after data is fetched
              console.log(response.data.title)
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
        action: 'http://localhost:3001/api/video/upload-thumbnail',
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
            message.error(`${info.file.name} file upload failed.`);
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
              const response = await axios.get(`http://localhost:3001/api/video/check-thumbnails/${fileName}`);
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
    return <div>Loading...</div>; // or a loading spinner
  }
  return (
    <ProtectedRoute>
    <div>
    <legend>Edit details</legend>

    <Form onFinish={handleVideoFormSubmit}
      initialValues={{
        title: videoDetails.title,
        description: videoDetails.description,
        // If the 'playlist' field expects an array of playlist IDs, you would map the playlist array to get the IDs.
      }}
    >

      <Form.Item label="Title" name="title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Description" name="description" rules={[{ required: true }]}>
        <Input.TextArea rows={5} />
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
            bordered={false} // remove default border
            bodyStyle={{ padding: 0 }} // remove default padding
            style={{ width: '200px', margin: '10px', }} // set width auto
            cover={
              <img
                src={`http://localhost:3001/uploaded_files/thumbnails/${thumbnail}`}
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
