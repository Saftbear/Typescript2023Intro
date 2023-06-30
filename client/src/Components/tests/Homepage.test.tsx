import axios, { AxiosResponse } from 'axios';
import { render, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../Homepage';
import { AuthProvider } from '../authContext';
import { SearchProvider } from '../searchContext';

jest.mock('axios');

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

it('renders content from api', async () => {
    const mockResponse: AxiosResponse = {
        data: [
          {
            id: 1,
            title: "Test Video",
            thumbnail: "test_thumbnail.jpg",
            path: "test_path.mp4",
            user: "Test User"
          }
        ],
        status: 200,
        statusText: 'OK',
        config: { 
          url: '',
          headers: {} as any, 
        },
        headers: {} as any,
      };
      


  (axios.get as jest.Mock).mockResolvedValue(mockResponse);

  render(   
    <BrowserRouter>
        <SearchProvider>
        <AuthProvider>
          <Homepage />
        </AuthProvider>
      </SearchProvider>
    </BrowserRouter>
  );

  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

  await waitFor(() => {
    expect(screen.getByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("Uploaded by: Test User")).toBeInTheDocument();
  });

});
