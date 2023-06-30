import React, { useState } from 'react';
import * as yup from 'yup';
import { Container } from 'react-bootstrap';
import { useAuth } from './authContext';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { Helmet } from 'react-helmet';
import { UnauthenticatedRoute } from './Routes/UnauthenticatedRouteProps ';
import { isAxiosError } from './isAxiosError';
import { schema } from './schema/schema';


interface RegisterRequestBody {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
}


const { Title } = Typography;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};



const Register: React.FC = () => {
  const auth = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate: NavigateFunction = useNavigate();



  const onFinish = async (values: RegisterRequestBody) => {

    try {
      await schema.validate(values, { abortEarly: false });
      await auth.register(values.username, values.password, values.email);
      navigate('/login');
      console.log('Before logging values');
      console.log(values);
      console.log('After logging values');
    } catch (error) {
      if (errors) {
        setErrors({}); 
      }
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setErrors(errors);
      } else if (isAxiosError(error)) {
        if (error.response?.status === 400) {
          message.error('Username already exists.');
        } else if (error.response?.status === 500) {
          message.error('Server error');
        } else {
          message.error(`An unexpected error occurred: ${error.response?.status}`);
        }
      }else {
        message.error('Registration failed');
      }
    }
  };
  return (
    <UnauthenticatedRoute>
      <>
        <Helmet>
          <title>Register</title>
        </Helmet>
        <Container
          className='justify-content-right align-items-center'
          style={{ marginTop: '20px', marginRight: '40%', width: '40%' }}
        >
          <Title level={2}>Register</Title>
          <Form
            {...layout}
            name="register"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
          
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
              {...(errors['username'] && {
                help: errors['username'],
                validateStatus: 'error',
              })}
            >
              <Input maxLength={25}/>
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
              {...(errors['email'] && {
                help: errors['email'],
                validateStatus: 'error',
              })}
            >
              <Input maxLength={320}/>
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              {...(errors['password'] && {
                help: errors['password'],
                validateStatus: 'error',
              })}
            >
              <Input.Password maxLength={32}/>
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
              {...(errors['confirmPassword'] && {
                help: errors['confirmPassword'],
                validateStatus: 'error',
              })}
            >
              <Input.Password maxLength={32}/>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Register
              </Button>
            </Form.Item>
          </Form>
        </Container>
      </>
    </UnauthenticatedRoute>
  );
};

export default Register;
