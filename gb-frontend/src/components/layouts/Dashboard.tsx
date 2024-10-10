import React, { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  const items = [UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map(
    (icon, index) => ({
      key: String(index + 1),
      icon: React.createElement(icon),
      label: `nav ${index + 1}`,
    }),
  );

  return (
    <Layout className='min-h-screen'>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical h-12 mx-auto p-4 flex justify-center items-center " >
          {/* <h1 className='text-white font-bold text-2xl'>GB</h1> */}
          <img src="/src/assets/logo//grontho-bilash-transparent.png" className='h-12 w-12' alt="" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,

          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;