import React, {useState, useEffect, useContext} from 'react';
import { Form, Select, Button, Input, message } from 'antd';
import './NewQueueForm.css';
import { SignalRContext } from '../../helpers/SignalRProvider';
const { Option } = Select;

type NewQueueFormProps = {
  serviceOptions: {value:string, label: string}[];
  isNumberDisplay: (status:boolean, data:any) => void;
}
const NewQueueForm = (props:NewQueueFormProps) => {
  const connection= useContext(SignalRContext);
  const [form] = Form.useForm();
  //const [serviceOptions, setServiceOptions] = useState<{value:string, label: string}[]>([])
  
  const handleFinish = async (values: any) => {
    console.log('Selected Service:', values.service);
    try {
      const response = await fetch(process.env.REACT_APP_API_URL+'api/Assignment/', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({customerName: values.customerName , Telephone: values.telephone, status: 0, deviceCode: 'KIO_06',
          serviceCode: values.serviceCode, assignmentDate: (new Date()).toISOString(), expireDate: (new Date()).toISOString()}),
      });
      if (response.ok) {
          const data = await response.json();
          console.log(data);
          if(connection){
            connection.invoke("BroadcastNumber", data.code);
          }
          props.isNumberDisplay(true, data);
      } else {
        message.error('Bạn không được cập nhật thông tin người khác');
      }
    } catch (error) {
      message.error('An error occurred while submitting the form.');
    }
  };

  const handleCancel = () => {
    console.log('Form canceled');
  };
  const handleDeleteProvidedNumber = async (providedNumberCode: string) => {
    if (!providedNumberCode) {
      message.error("Mã cấp số không được để trống.");
      return;
    }
  
    console.log("Deleting Provided Number with Code:", providedNumberCode);
  
    const url = `${process.env.REACT_APP_API_URL}api/ProvidedNumber/${providedNumberCode}`;
  
    try {
     
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      });
  
      if (response.ok) {
        console.log("Provided Number deleted successfully");
        message.success("Cấp số đã được xóa thành công!");
      } else {
        const error = await response.json();
        console.error("Failed to delete provided number:", error.message || response.status);
        message.error(`Lỗi: ${error.message || "Không thể xóa cấp số."}`);
      }
    } catch (error) {
      console.error("Error occurred while deleting provided number:", error);
      message.error("Đã xảy ra lỗi trong quá trình xóa cấp số. Hãy thử lại sau.");
    }
  };
  
  return (
    <div className="new-queue-form-container">
      <h2 className="new-queue-form-title">CẤP SỐ MỚI</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="new-queue-form"
      >
        <Form.Item
          name="serviceCode"
          label="Dịch vụ khách hàng lựa chọn"
          rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
        >
          <Select placeholder="Chọn dịch vụ">
            {props.serviceOptions.map(item=>{
              return(
                <Option value={item.value}>{item.label}</Option>
              )
            })}
          </Select>
        </Form.Item>
        <Form.Item
              name="customerName"
              label="Tên khách hàng"
              rules={[{ required: true, message: 'Họ tên là bắt buộc' }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>
            <Form.Item
              name="telephone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Số điện thoại là bắt buộc' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              name="customerEmail"
              label="Email"
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
        <Form.Item>
          <div className="form-actions">
            <Button htmlType="button" onClick={handleCancel}>
              Hủy bỏ
            </Button>
            <Button type="primary" htmlType="submit">
              In số
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewQueueForm;
