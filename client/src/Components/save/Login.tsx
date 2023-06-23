import React, { useState } from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { useNavigate   } from 'react-router-dom';
import { Container } from 'react-bootstrap';

interface LoginRequestBody {
    username: string;
    password: string;
}

const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required()
});

const Login: React.FC = () => {
    const [formData, setFormData] = useState<LoginRequestBody>({ username: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            // validate form data
            await schema.validate(formData, { abortEarly: false });
    
            // make API request
            const response = await axios.post('http://localhost:3001/api/auth/login', formData);
    
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                navigate("/homepage")
                navigate(0)
            }
    
        } catch (error) {
            console.log(error)
            if (error instanceof yup.ValidationError) {
                const errors: Record<string, string> = {};
                error.inner.forEach((err) => {
                    if (err.path) {
                        errors[err.path] = err.message;
                    }
                });
                setErrors(errors);
            } else if (axios.isAxiosError(error)) {
                setErrors({ server: error.response?.data.message || 'An error occurred' });
            } else {
                console.error(error);
            }
        }
    };
    

    return (
        <Container className='justify-content-right align-items-center' style={{marginTop: "20px", marginRight:"40%", width: "40%" }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        {errors['username'] && <div className="error">{errors['username']}</div>}
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control" required />
                     
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        {errors['password'] && <div className="error">{errors['password']}</div>}
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" required />
                     
                    </div>
                    {errors['server'] && <div className="error">{errors['server']}</div>}
                    <button type="submit" className="btn btn-primary" style={{marginTop: "10px"}}>Login</button>
                </form>
        </Container>
    );
};

export default Login;
