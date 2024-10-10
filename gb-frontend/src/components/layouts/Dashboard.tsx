import React, { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import { Button, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';

const { Header, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);



  return (
    <Layout className='min-h-screen'>
      <Sidebar collapsed={ collapsed} />
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