import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Spinner } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useNavigate   } from 'react-router-dom';
import { ProtectedRoute } from '../Routes/ProtectedRoute';
import { Helmet } from 'react-helmet';

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


  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('http://192.168.0.12:3001/api/playlists', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          },
        });
        setPlaylists(response.data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };
    
    fetchPlaylists();
  }, []);



  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalName(selectedFile.name.split('.').slice(0, -1).join('.'));
      setErrorMessage(null); 

    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      console.log(file)
 
      try {
        const response = await axios.post('http://192.168.0.12:3001/api/video/submit-form', formData, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          },
        });
        setVideoId(response.data.videoId)
        console.log(response.data);
        setFileName(response.data.fileName.split('.').slice(0, -1).join('.'));
        setFileUploaded(true);
    
      } catch (error) {
        console.error('Error uploading file:', error);
        setErrorMessage('Error uploading file');
 

      } finally{
        setIsLoading(false);
      }
       
      
    }
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
  

 

  const handleCustomThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const Thumbnail = event.target.files && event.target.files[0];
    console.log(Thumbnail)
    if (Thumbnail) {
      const formData = new FormData();
      formData.append('file', Thumbnail);
      console.log(Thumbnail)
      console.log(isLoading)
      try {   
        setIsCustomThumbnail(true);
        const response = await axios.post('http://192.168.0.12:3001/api/video/upload-thumbnail', formData, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken'),
            fileName: fileName,
  
          },

        });

        setCustomThumbnail(fileName + response.data.fileName);
       
        setErrorMessage(null); 
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        setErrorMessage('Error uploading file'); 
        console.log(event.target.value)
        event.target.value = ""; 
        return null;
      }

    }
  };

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    isPrivate: false,
  });
  const handleVideoFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setVideoForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleVideoFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = event.currentTarget.elements.namedItem('title') as HTMLInputElement;
    const description = event.currentTarget.elements.namedItem('description') as HTMLInputElement;
    const playlist = event.currentTarget.elements.namedItem('playlist') as HTMLSelectElement;
    const isPrivate = (event.currentTarget.elements.namedItem('isPrivate') as HTMLInputElement).checked;
    console.log(isCustomThumbnail)
    const videoData = {
      title: title.value,
      description: description.value,
      originalName,
      fileName,
      thumbnail: isCustomThumbnail ? customThumbnail : selectedThumbnail, //
      playlist: playlist.value,
      isPrivate: isPrivate,
    };
    //customThumbnail
    try {
      await axios.post('http://192.168.0.12:3001/api/video/videos', videoData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
          videoId: videoID
        },
      });
  
      setFile(null);
      setFileName(null);
      setThumbnails([]);
      setSelectedThumbnail(fileName + "screenshot_0.png");
      setFileUploaded(false);
      setOriginalName(null);
      setCustomThumbnail(null);
      alert("Video uploaded successfully!");
      navigate("/homepage")
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
       <Spinner 
       animation="border" 
       role="status" 
       style={{
           position: 'fixed', 
           top: '50%', 
           left: '50%', 
           width: '3rem', 
           height: '3rem', 
           borderColor: 'blue', 
           borderRightColor: 'transparent'
       }} 
   />
      ) : !fileUploaded ? (
        <div className='file-upload-wrapper' style={{marginTop: "40px",}}>
          <form onSubmit={handleSubmit}>
            <div className="file-drop-area">
              <span className="choose-file-button">Choose files</span>
              <span className="file-message">              
              {originalName ? `Selected file: ${originalName}` : 'or drag and drop files here'}
            </span>
              <input 
              className="file-input" 
              type="file" 
              onChange={handleFileInputChange} // Passes the selected file to state
            ></input>

            </div>
            <button type="submit" className="btn btn-primary" style={{marginTop: "35px", marginLeft: "36%" }}>Upload</button>
          </form>
        </div>
      ) : thumbnails.length > 0 ? (
        <div>
        <legend>Edit details</legend>
        {errorMessage && (
            <div className="alert alert-danger" role="alert">
                {errorMessage}
            </div>
        )}
        <form onSubmit={handleVideoFormSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={videoForm.title}
              onChange={handleVideoFormChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
       
              <textarea
              id="description"
              name="description"
              value={videoForm.description}
              onChange={handleVideoFormChange}
              className="form-control"
              rows={5}
              required
              ></textarea>
   
          </div>
          <legend>Playlist</legend>
          <Form.Select name="playlist" aria-label="Default select example">
            <option>Select playlist</option>
            {playlists.map((playlist: any, index: number) => (
              <option value={playlist._id} key={index}>{playlist.name}</option>
            ))}
          </Form.Select>

          <legend>Choose custom thumbnail</legend>
          <div>
            <input type="file" className='form-control' onChange={handleCustomThumbnailUpload} />
          </div>

          <legend>Choose thumbnail</legend>
          <div style={{ marginTop: '20px', overflowY: 'hidden', overflowX: 'hidden', padding: '15px 35px' }}>
            <div className="row">
              {thumbnails.map((thumbnail, index) => (
                <div
                  className={`col${thumbnail === selectedThumbnail ? ' selected-thumbnail' : ''}`}
                  key={index}
                  onClick={() => handleThumbnailClick(thumbnail)}
                >
                  <img
                    src={`http://192.168.0.12:3001/uploaded_files/thumbnails/${thumbnail}`}
                    alt={`Thumbnail ${index + 1}`}
                    className="img-fluid"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group form-check">
            <input
              type="checkbox"
              name="isPrivate"
              className="form-check-input"
              id="isPrivate"
              checked={videoForm.isPrivate}
              onChange={handleVideoFormChange}
            />
            <label className="form-check-label" htmlFor="private">Set Video as Private</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '35px' }}>Create Video</button>
        </form>
      </div>
      ) : (
        <Spinner        animation="border" 
        role="status" 
        style={{
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            width: '3rem', 
            height: '3rem', 
            borderColor: 'blue', 
            borderRightColor: 'transparent'}} />
      )}
          {/* ... */}
    
   
    </div>
    </ProtectedRoute>


);
};

export default UploadForm;
