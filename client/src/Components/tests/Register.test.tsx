import { render, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import axios, { Axios, AxiosError, AxiosResponse, AxiosHeaders } from "axios";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import Register from "../Register";
import { isAxiosError } from "../isAxiosError";


jest.mock("axios");
jest.mock("../authContext");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
  }));

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

jest.mock('../isAxiosError', () => ({
    isAxiosError: jest.fn(),
}));

describe("Register", () => {

    afterEach(() => {
        jest.clearAllMocks();
      });

    let mockNavigate: jest.Mock;

    beforeEach(() => {
      mockNavigate = jest.fn();
      (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  
      (useAuth as jest.Mock).mockReturnValue({
        register: jest.fn(() =>
          Promise.resolve({
            data: { success: true, user: {} },
          })
        ),
      });
    });
  

  it("should submit form successfully", async () => {
    const { getByLabelText, getByRole } = render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.input(getByLabelText(/username/i), {
      target: { value: "testUsername" },
    });
    fireEvent.input(getByLabelText(/email/i), {
        target: { value: "test@email.com" },
      });
      fireEvent.input(getByLabelText('Password'), {
        target: { value: "testPassword1" },
    });
        fireEvent.input(getByLabelText('Confirm Password'), {
            target: { value: "testPassword1" },
        });
  
  
      fireEvent.click(getByRole("button", { name: /register/i }));
  
      // Here we wait for the mock register function to be called
      await waitFor(() => {
        expect(useAuth().register).toHaveBeenCalledWith(
          "testUsername",
          "testPassword1",
          "test@email.com"
        );
      });
  
      // We can also assert that the useNavigate function was called, which would simulate a navigation to another route
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    
    it("should handle error when register returns status 400", async () => {

        (useAuth as jest.Mock).mockReturnValue({
            register: jest.fn().mockImplementationOnce(() => {
              throw {
                isAxiosError: true,
                toJSON: () => {},
                config: {},
                name: "",
                message: "Request failed with status code 400",
                response: {
                  status: 400,
                  data: {
                    message: 'Username already exists',
                  },
                },
              };
            })
          });
          const mockedIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;
          
          mockedIsAxiosError.mockImplementation((error: any) => {
            return error.isAxiosError === true;
          });

        const { getByLabelText, getByRole, getByText } = render(
          <Router>
            <Register />
          </Router>
        );
      
        fireEvent.input(getByLabelText(/username/i), { target: { value: "testUsername" } });
        fireEvent.input(getByLabelText(/email/i), { target: { value: "test@email.com" } });
        fireEvent.input(getByLabelText('Password'), { target: { value: "testPassword1" }});
        fireEvent.input(getByLabelText('Confirm Password'), { target: { value: "testPassword1" }});
      
        fireEvent.click(getByRole("button", { name: /register/i }));
      
        // Check if the mocked function is called with the right arguments
        await waitFor(() => {
          expect(useAuth().register).toHaveBeenCalledWith(
            "testUsername",
            "testPassword1",
            "test@email.com"
          );
        });
      
        // Assert that the appropriate error message is displayed
        await waitFor(() => {
          expect(getByText('Username already exists.')).toBeInTheDocument();
        });  
      });
      it("should handle error when register returns status 500", async () => {

        (useAuth as jest.Mock).mockReturnValue({
            register: jest.fn().mockImplementationOnce(() => {
              throw {
                isAxiosError: true,
                toJSON: () => {},
                config: {},
                name: "",
                message: "Request failed with status code 500",
                response: {
                  status: 500,
                  data: {
                    message: 'Server error',
                  },
                },
              };
            })
          });
          const mockedIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;
          
          mockedIsAxiosError.mockImplementation((error: any) => {
            return error.isAxiosError === true;
          });

        const { getByLabelText, getByRole, getByText } = render(
          <Router>
            <Register />
          </Router>
        );
      
        fireEvent.input(getByLabelText(/username/i), { target: { value: "testUsername" } });
        fireEvent.input(getByLabelText(/email/i), { target: { value: "test@email.com" } });
        fireEvent.input(getByLabelText('Password'), { target: { value: "testPassword1" }});
        fireEvent.input(getByLabelText('Confirm Password'), { target: { value: "testPassword1" }});
      
        fireEvent.click(getByRole("button", { name: /register/i }));
      
        // Check if the mocked function is called with the right arguments
        await waitFor(() => {
          expect(useAuth().register).toHaveBeenCalledWith(
            "testUsername",
            "testPassword1",
            "test@email.com"
          );
        });

        // Assert that the appropriate error message is displayed
        await waitFor(() => {
          expect(getByText('Server error')).toBeInTheDocument();
        });  
    });  
    it("should handle password length detection", async () => {
        // Render the component
        const {getByLabelText, getByRole ,getByText } = render(
            <Router>
            <Register />
            </Router>
        );
                
        fireEvent.input(getByLabelText(/username/i), { target: { value: "RandomName" } });
        fireEvent.input(getByLabelText(/email/i), { target: { value: "test@email.com" } });
        fireEvent.input(getByLabelText('Password'), { target: { value: "testP" }});
        fireEvent.input(getByLabelText('Confirm Password'), { target: { value: "testP" }});
        
        fireEvent.click(getByRole("button", { name: /register/i }));
        // Wait for the error message to be displayed
        await waitFor(() => {
            expect(getByText('Password is too short - should be 8 chars minimum.')).toBeInTheDocument();
        });
        
        });
  });
  