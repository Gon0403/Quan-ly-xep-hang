// components/Sidebar/Sidebar.tsx
import React, {useState, useContext} from "react";
import { Menu } from "antd";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import {
  DashboardOutlined,
  DesktopOutlined,
  FileOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./Sidebar.css";
import "./HoverMenu.css";
import { SignalRContext } from "../../helpers/SignalRProvider";
type SideBarProps = {
  sendSelectedIndex: (index:number) => void;
}
const Sidebar = (props:SideBarProps) => {
  const [isSubMenuVisible, setSubMenuVisible] = useState(false);
  const connection = useContext(SignalRContext);
  const handleMouseEnter = () => {
    setSubMenuVisible(true);
  };

  const handleMouseLeave = () => {
    setSubMenuVisible(false);
  };
  const handleMenuClick = (index:number)=>{
    props.sendSelectedIndex(index);
  }
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="./images/Logo.png" alt="Logo" />
      </div>
      <Menu
        mode="vertical"
        theme="light"
        defaultSelectedKeys={["1"]}
        className="menu"
      >
        <Menu.Item key="1" icon={<DashboardOutlined />}
        onClick={()=>handleMenuClick(0)}
        >
          Dashboard
        </Menu.Item>
        {localStorage.getItem('userRole')!='Doctor'?<div>
          <Menu.Item key="2" icon={<DesktopOutlined />}
         onClick={()=>handleMenuClick(1)}
        >
          Thiết bị
        </Menu.Item>
        <Menu.Item key="3" icon={<FileOutlined />}
         onClick={()=>handleMenuClick(5)}
        >
          Dịch vụ
        </Menu.Item>
        </div>:null}
        <Menu.Item key="4" icon={<FileOutlined />}
        onClick={()=>handleMenuClick(6)}
        >
          Cấp số
        </Menu.Item>
        <div className="hover-container"
        onMouseOver={handleMouseEnter}
        >
          <Menu.Item key="6" icon={<SettingOutlined />} className="menu-item">
            Cài đặt hệ thống
          </Menu.Item>
          {isSubMenuVisible && (
            <div className="submenu"
            onMouseOut={handleMouseLeave}
            >
              <Menu mode="vertical" theme="light" className="submenu-content">
                <Menu.Item key="sub2"
                onClick={()=>handleMenuClick(7)}
                >Quản lý tài khoản</Menu.Item>
                <Menu.Item key="sub3">Nhật ký người dùng</Menu.Item>
              </Menu>
            </div>
          )}
        </div>
        <Menu.Item key="7" icon={<LogoutOutlined />} 
        onClick={async()=>{
          if(connection)
            if(connection.state==HubConnectionState.Connected){
              connection.invoke("UserDisconnected", localStorage.getItem('userName'));
            }
          const userName = localStorage.getItem("userName");
        const response = await fetch(process.env.REACT_APP_API_URL+'api/Authenticate/logout/'+userName, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            console.error("Failed to refresh token:", response.status);
            //return false; // Return false if refreshing token fails
        }
        localStorage.clear();
        window.location.reload();         
        }}
        className="logout">
          Đăng xuất
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Sidebar;
