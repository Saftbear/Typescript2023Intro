import React, { useState } from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { Container } from 'react-bootstrap';

interface RegisterRequestBody {
    username: string;
    password: string;
    email: string;
    confirmPassword: string;
}


const schema = yup.object().shape({
    username: yup.string().required(),
    email: yup.string().email(),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password is too short - should be 8 chars minimum.")
        .matches(/[a-zA-Z]/, "Password can only contain Latin letters.")
        .notOneOf([yup.ref('username'), null], "Password can't be the same as the username")
        .notOneOf([yup.ref('email'), null], "Password can't be the same as the email"),
    confirmPassword: yup.string()
    .required("Please re-type your password")
    .oneOf([yup.ref("password")], "Passwords does not match"),
});



const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterRequestBody>({username: '', password: '', email: '', confirmPassword: ''});
    const [errors, setErrors] = useState({});

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("asd")
        try {
            // validate form data
            await schema.validate(formData, { abortEarly: false });
       
            // make API request
            const response = await axios.post('http://localhost:3001/api/auth/register', formData);
            console.log(response.data); // Response from server
        } catch (error) {
            console.log(error)
            if (error instanceof yup.ValidationError) {
                const errors = {};
                error.inner.forEach((err) => {
                    const errors: Record<string, string> = {};
                    if (err.path) {
                        errors[err.path] = err.message;
                    }
                });
                setErrors(errors);
            } else {
                console.error(error);
            }
        }
    };

    return (
        <Container className='justify-content-right align-items-center' style={{marginTop: "20px",marginRight:"40%", width: "40%" }}>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="text" name="email" value={formData.email} onChange={handleChange} className="form-control" required />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input type="text" name="password" value={formData.password} onChange={handleChange} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="text" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-control" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{marginTop: "10px"}}>Register</button>
            </form>

        </Container> 
    );
};

export default Register;
