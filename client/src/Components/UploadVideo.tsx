
import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from './authContext';
import { ProtectedRoute } from './Routes/ProtectedRoute';
const { Dragger } = Upload;
const UploadForm: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const props_video: UploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://localhost:3001/api/video/submit-form',
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
        console.log(info.file.response.fileName)

        message.success(`${info.file.name} file uploaded successfully.`);
        console.log(`/videoedit/${info.file.response.fileName}`)
        navigate(`/videoedit/${info.file.response.fileName}`)

      } else if (status === 'error') {
        setIsUploading(false)
        if(info.file.response){
        
          if (info.file.response.message === "Invalid token: no such user.") {
            auth.logout();
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
    beforeUpload: file => {
      if (isUploading) {
        message.error("A file has already been uploaded.");
        return false;
      }
      setIsUploading(true)
      return true;
    },

  };


  return(
    <ProtectedRoute>
      <Helmet>
        <title> 
        Upload 
        </title> 
      </Helmet>
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
  </ProtectedRoute>
    );
}

export default UploadForm;
