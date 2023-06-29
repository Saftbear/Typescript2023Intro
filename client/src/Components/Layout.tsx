import React, { useEffect, useState } from 'react';
import { Layout, Menu, Divider, Button } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, LogoutOutlined , DownOutlined} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from './authContext';

const { Header, Content, Footer, Sider } = Layout;

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutAnt: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth(); // use the hook to get the user
  const isLoggedIn = !!user;

  

  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
        <Menu mode="inline" style={{ height: '100%', borderRight: 0 }}>
          <Menu.Item key="logo" icon={<VideoCameraOutlined />} style={{ marginTop: '30px', marginBottom: '30px', fontSize: '20px' }}>
            <Link to="/">FakeTube</Link>
          </Menu.Item>
          <Divider />
      
         <Menu.Item key="1" icon={<VideoCameraOutlined />} style={{ marginTop: '20px' }}> 
            <Link to="/">Home</Link>
         </Menu.Item>
      
          <Menu.Item key="2" icon={<VideoCameraOutlined />}><Link to="/playlists">Playlists</Link></Menu.Item>
          <Menu.Item key="3" icon={<VideoCameraOutlined />}>
            <Link to="/create-playlist">Create Playlist</Link>
          </Menu.Item>
          <Divider />

        </Menu>
      </Sider>
      <Layout style={{ padding: '0 24px 24px' }}>

      <Header className="site-layout-background" style={{ padding: 0, display: 'flex', justifyContent: 'flex-end', backgroundColor:"#ffffff", color:'black',  }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          
          {isLoggedIn ? (
            <>
              <Link to="/Upload">
                <Button icon={<UploadOutlined />}  type="link" >Upload</Button>
              </Link>
              <Button icon={<LogoutOutlined />}type="link" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/Login">
                <Button icon={<UserOutlined />}type="link">Login</Button>
              </Link>
              <Link to="/Register">
                <Button icon={<UserOutlined />}type="link">Register</Button>
              </Link>
            </>
          )}
        </div>
      </Header>

        <Content className="site-layout-background" style={{ padding: '24px', minHeight: '280px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutAnt;

