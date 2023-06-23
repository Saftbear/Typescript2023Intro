import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Form, Input, Select, Checkbox, Button, Spin, message } from 'antd';

import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import "./css/upload.css"
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../Routes/ProtectedRoute';
import { Helmet } from 'react-helmet';
import { Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Dragger } = Upload;


const { Option } = Select;

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
  const [playlists, setPlaylists] = useState([]);
  const [isCustomThumbnail, setIsCustomThumbnail] = useState(false);
  const [videoID, setVideoId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false)

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


  const props_video: UploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://192.168.0.12:3001/api/video/submit-form',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('authToken'),
    },
    accept: "video/*",
    onChange(info) {
      
      const { status } = info.file;

      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }

      if (status === 'done') {
        setIsUploading(false)

        setVideoId(info.file.response.videoId)
        setFileName(info.file.response.fileName.split('.').slice(0, -1).join('.'))
        setFileUploaded(true);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        setIsUploading(false)
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },  
    beforeUpload: file => {
      if (isUploading) {
        message.error("A file has already been uploaded.");
        return false;
      }
      setIsUploading(true)
      return true;
    },

  };

  const probs_thumbnail: UploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://192.168.0.12:3001/api/video/upload-thumbnail',
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
        setCustomThumbnail(fileName + info.file.response.fileName);
        message.success(`${info.file.name} file uploaded successfully.`);
        this.disabled = false
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };




  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const checkThumbnails = async () => {
      if (fileName) {
        try {
          const response = await axios.get(`http://192.168.0.12:3001/api/video/check-thumbnails/${fileName}`);
          if (response.data.thumbnails && response.data.thumbnails.length > 0) {

            console.log(thumbnails)
            setThumbnails(response.data.thumbnails.map((thumbnail: string) => fileName + "/" + thumbnail));

            if (!thumbnails.length) {
              setSelectedThumbnail(fileName + "/" + response.data.thumbnails[0]);
            }
            setFileUploaded(true);
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
  

 




  const handleVideoFormSubmit = async (values: { title: string; description: string, playlist:string[], isPrivate:boolean }) => {


    console.log(values.playlist)
    const videoData = {
      title: values.title,
      description: values.description,
      originalName,
      fileName,
      thumbnail: isCustomThumbnail ? customThumbnail : selectedThumbnail, //
      playlist: values.playlist,
      isPrivate: values.isPrivate,
    };



    try {
      await axios.post('http://192.168.0.12:3001/api/video/videos', videoData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          videoId: videoID
        },
      });
      /*
      setFile(null);
      setFileName(null);
      setThumbnails([]);
      setSelectedThumbnail(fileName + "screenshot_0.png");
      setFileUploaded(false);
      setOriginalName(null);
      setCustomThumbnail(null);
      alert("Video uploaded successfully!");
      navigate("/homepage")
      */
    } catch (error) {
      console.error('Error creating video:', error);
      setErrorMessage('Error creating  Video'); // or use error.message depending on the error format

    } finally {
      setIsLoading(false);
    }

  };
  
  const handleThumbnailClick = (thumbnailName: string) => {
    setSelectedThumbnail(thumbnailName);
    setIsCustomThumbnail(false); // Set isCustomThumbnail to false
    console.log(thumbnailName)
  };

  return (
    <ProtectedRoute>
      <div>
        <Helmet>
          <title>Uploads</title>
        </Helmet>
        {/* ... */}
        {isLoading ? (
          <Spin  />
        ) : !fileUploaded ? (
          <div style={{ marginTop: "40px" }}>
            <Dragger {...props_video} maxCount={1} disabled={isUploading}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
              Support for a single upload
              </p>
            </Dragger>

          </div>
        ) : thumbnails.length > 0 ? (
          <div>
            <legend>Edit details</legend>

            <Form onFinish={handleVideoFormSubmit}>
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
                        src={`http://192.168.0.12:3001/uploaded_files/thumbnails/${thumbnail}`}
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
                <Form.Item name="isPrivate" valuePropName="checked">
              <Checkbox>Set Video as Private</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginTop: '35px' }}>Create Video</Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <Spin />
      )}
    </div>
  </ProtectedRoute>
);
};

export default UploadForm;


/*


*/