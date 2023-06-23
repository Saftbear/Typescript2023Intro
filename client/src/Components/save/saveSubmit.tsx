import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./css/upload.css"
import { Spinner } from 'react-bootstrap';

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState(false); // New state
  const [originalName, setOriginalName] = useState<string | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/playlists', {
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

  const handleThumbnailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setCustomThumbnail(selectedFile);
    }
  };
  

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      setOriginalName(selectedFile.name.split('.').slice(0, -1).join('.')); // remove the extension from the filename

    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file) {
      // Perform file upload or other processing here
      const formData = new FormData();
      formData.append('file', file);
 
      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:3001/api/submit-form', formData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        },
      });
        console.log(response.data);
        setFileName(response.data.fileName.split('.').slice(0, -1).join('.')); // assuming the server returns the filename in the response

      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  
  // Effect to check for thumbnails
  useEffect(() => {
    const checkThumbnails = async () => {
      if (fileName) {
        try {
          const response = await axios.get(`http://localhost:3001/api/check-thumbnails/${fileName}`);
          if (response.data.thumbnails && response.data.thumbnails.length > 0) {
            console.log(response.data.thumbnails)
            setThumbnails(response.data.thumbnails);
          }
        } catch (error) {
          console.error('Error checking for thumbnails:', error);
        }
      }
      setFileUploaded(true); // Set fileUploaded to true after a successful file upload

    };

    const intervalId = setInterval(checkThumbnails, 5000); // Check every 5 seconds

    return () => {
      clearInterval(intervalId); // Clean up on unmount
    };
  }, [fileName]);


  const handleThumbnailClick = (thumbnailName: string) => {
    setSelectedThumbnail(thumbnailName);
  };


  const [videoForm, setVideoForm] = useState({
    title: originalName || '',
    description: '',
    isPrivate: false,
    thumbnail: 'screenshot_0.png'
  });
  
  // ...
  useEffect(() => {
    // When originalName changes, update the videoForm title
    setVideoForm(form => ({ ...form, title: originalName || '' }));
  }, [originalName]);

  const handleVideoFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setVideoForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
    console.log(videoForm.isPrivate)
  };
  
  const handleCustomThumbnailUpload = async () => {
    if (customThumbnail) {
      const formData = new FormData();
      formData.append('file', customThumbnail);
  
      try {   
        console.log("Hello")
        const response = await axios.post('http://localhost:3001/api/upload-thumbnail', formData, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('authToken'),
            filename: fileName,
          }, timeout: 5000 // timeout after 5 seconds
        });
        console.log("Here not reach")
        console.log(response);
        setThumbnails([...thumbnails, response.data.fileName]); // Assuming the server returns the filename of the uploaded thumbnail
        setSelectedThumbnail(response.data.fileName); // Set the selected thumbnail to the custom thumbnail
        return response.data.fileName; // Returning the filename
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        return null;
      }
    }
  };



const handleVideoFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log("asd")
  if (customThumbnail) {
    await handleCustomThumbnailUpload();
  }
  videoForm.thumbnail = selectedThumbnail; 
  try {
    console.log(videoForm)
    videoForm.thumbnail = selectedThumbnail;
    const response = await axios.post('http://localhost:3001/api/videos',videoForm ,{
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('authToken'),
    },
  });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error creating video:', error);
  }

  // Upload the custom thumbnail
  if (customThumbnail) {
    const formData = new FormData();
    formData.append('file', customThumbnail);
    console.log(formData)

    try {
      const response = await axios.post('http://localhost:3001/api/upload-thumbnail', formData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('authToken'),
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    } finally {
      // Reset the file and thumbnail states
      setFile(null);
      setCustomThumbnail(null);
      setThumbnails([]);
      setSelectedThumbnail("");
      setFileName(null);
    }
  }
};
  

  
  return (
    <div>
      {/* ... */}
      {isLoading || fileUploaded && thumbnails.length === 0 ?(
        <Spinner animation="border" role="status">
        </Spinner>
      ) : thumbnails.length > 0 ? (
        <div>
          <legend>Edit details</legend>
          <form onSubmit={handleVideoFormSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={videoForm.title} onChange={handleVideoFormChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" name="description" value={videoForm.description} onChange={handleVideoFormChange} className="form-control" required />
            </div>
            <legend>Choose custom thumbnail</legend>
            <div>
              <input 
                type="file" 
                onChange={handleThumbnailInputChange}
              />
            </div>

          <legend>Choose thumbnail</legend>
          <div style={{marginTop: "20px", overflowY: "hidden", overflowX: "hidden", padding: '15px 35px'}}>
            <div className="row">
              {thumbnails.map((thumbnail, index) => (
         <div 
         className={`col${thumbnail === selectedThumbnail ? ' selected-thumbnail' : ''}`} 
         key={index} 
         onClick={() => handleThumbnailClick(thumbnail)}
       >
         <img 
           src={`http://localhost:3001/uploaded_files/thumbnails/${fileName}/${thumbnail}`} 
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
    <button type="submit" className="btn btn-primary"style={{marginTop: "35px"}}>Create Video</button>
  </form>


        
        </div>
      ) : (
        <div className='file-upload-wrapper' style={{marginTop: "40px",}}>
          <form onSubmit={handleSubmit}>
            <div className="file-drop-area">
              <span className="choose-file-button">Choose files</span>
              <span className="file-message">or drag and drop files here</span>
              <input 
              className="file-input" 
              type="file" 
              onChange={handleFileInputChange} // Passes the selected file to state
            ></input>
            </div>
            <button type="submit" className="btn btn-primary" style={{marginTop: "35px", marginLeft: "36%" }}>Upload</button>
          </form>
        </div>
      )}
      {/* ... */}
    </div>
  );
  
};

export default UploadForm;



