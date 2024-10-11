import React, { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import { Button, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';

const { Header, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);



  return (
    <Layout >
      <Sidebar collapsed={ collapsed}  />
      <Layout>
        <Header style={{ padding: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined className='text-white border p-2 rounded shadow' /> : <MenuFoldOutlined className='text-white border p-2 rounded shadow' />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content className='min-h-screen'
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