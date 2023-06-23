import React, { useState } from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { useNavigate   } from 'react-router-dom';
import { useAuth } from './authContext';
import { Helmet } from 'react-helmet';
import { Form, Input, Button, Alert } from 'antd';
import { UnauthenticatedRoute } from './Routes/UnauthenticatedRouteProps ';
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
    const auth = useAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (values: { username: string; password: string }) => {
        try {
            // login the user
            await auth.login(values.username, values.password);

            navigate("/homepage")
       
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    setErrors(prevErrors => ({ ...prevErrors, server: 'Invalid Username or Password' }));
                } else if (error.response?.status === 500) {
                    setErrors(prevErrors => ({ ...prevErrors, server: 'Server error' }));
                }
            } else {
                console.error(error);
                setErrors(prevErrors => ({ ...prevErrors, server: 'Login failed' }));
            }
        }
    }

    

    return (
        <UnauthenticatedRoute>
        <>
          <Helmet>
            <title>Login</title>
          </Helmet>
      
          <div style={{ display: 'flex', justifyContent: 'center', marginRight:"60px"}}>
            <Form style={{ width: '600px'}} onFinish={handleSubmit}>
              {errors['username'] && <Alert message={errors['username']} type="error" />}
              {errors['password'] && <Alert message={errors['password']} type="error" />}
              {errors['server'] && <Alert message={errors['server']} type="error" />}
      
              <Form.Item 
                style={{marginTop: "20px"}}
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input onChange={handleChange} />
              </Form.Item>
      
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password onChange={handleChange} />
              </Form.Item>
      
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        </>
        </UnauthenticatedRoute>
      );
};

export default Login;
