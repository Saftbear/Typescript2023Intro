import React from 'react';
import axios from 'axios';
import * as yup from 'yup';
import { useAuth } from './authContext';

import { Form, Input, Checkbox, Button, message } from 'antd';
import { ProtectedRoute } from './Routes/ProtectedRoute';
import { Helmet } from 'react-helmet';

const schema = yup.object().shape({
  playlistName: yup.string().required().max(100),
 
});

const CreatePlaylist: React.FC = () => {
    const auth = useAuth();
    const [form] = Form.useForm();
  
    const onFinish = async (values: any) => {
      try {
        await schema.validate(values, { abortEarly: false });
        await auth.createPlaylist(values.playlistName);
        alert('Playlist created!');

      } catch (error) {
        if (error instanceof yup.ValidationError) {
          error.inner.forEach((err) => {
            if (err.path) {
              form.setFields([
                {
                  name: err.path,
                  errors: [err.message],
                },
              ]);
            }
          });
        } else if (axios.isAxiosError(error)) {
            console.log(error)
          if (error.response?.status === 400) {
            message.error('Playlist already exists.');
          } else if (error.response?.status === 500) {
            message.error('Server error');
          } else {
            console.error(error);
            message.error('Creation failed');
          }
        }
      }
    };
  
    return (
        <ProtectedRoute>
          <Helmet>
             <title>
              Create Playlist
             </title>
          </Helmet>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label="Playlist Name"
          name="playlistName"
          rules={[
            {
              required: true,
              message: 'Please input a playlist name',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Playlist
          </Button>
        </Form.Item>
      </Form>
      </ProtectedRoute>
    );
  };

export default CreatePlaylist;
