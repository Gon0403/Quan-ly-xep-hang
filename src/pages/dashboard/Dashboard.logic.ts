import message from "antd/es/message";
import { fetchWithTokenRetry } from "../../helpers/tokens";
export const getProvidedNumber = async(
  serviceCode:string, start:string, end: string, deviceCode:string, searchText:string, pageNumber:number, pageSize:number, status:string):Promise<any> => {
  let url = process.env.REACT_APP_API_URL+'api/Assignment/'+localStorage.getItem('userName')
  + '/' + serviceCode + '/' + start + '/' + end + '/' + deviceCode + '/' + searchText + '/' + pageNumber + '/' + pageSize + '/' + status;
        let data1:any = [];
        let response = await fetchWithTokenRetry(url);
        if (response.ok) {
          data1 = await response.json();
          console.log("Data fetched successfully:", data1);
      } else {
          console.error("Failed to fetch data, status:", response.status);
      }
    return new Promise(resolve=>{
             resolve(data1.map((item:any)=>{
                return {...item, assignmentDate: formatDate(item.assignmentDate),
                    expireDate: formatDate(item.expireDate)
                }
             }));
          })
    }
export const formatDate = (isoString:string) => {
    const date = new Date(isoString);
    // Extract hours, minutes, seconds, day, month, and year
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
  
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  }
  
export const getDeviceData = async():Promise<any> => {
  let url = process.env.REACT_APP_API_URL+'api/Device/';
        let data1:any = [];
        let response = await fetchWithTokenRetry(url);
        if (response.ok) {
          data1 = await response.json();
          console.log("Data fetched successfully:", data1);
      } else {
          console.error("Failed to fetch data, status:", response.status);
      }
  return new Promise(resolve=>{
    resolve(data1)
  })    
}
export const getUserData = async(filter1: string, filter2: string, searchText: string, pageNumber:number, pageSize: number):Promise<any> => {
  let url = process.env.REACT_APP_API_URL+'api/User/pages/'+ filter1 + '/' + filter2 + '/' + searchText + '/' + pageNumber +'/' + pageSize;
        let data1:any = [];
        let response = await fetchWithTokenRetry(url);
        if (response.ok) {
          data1 = await response.json();
          console.log("Data fetched successfully:", data1);
      } else {
          data1 = await response;
      }
  return new Promise(resolve=>{
         resolve(data1)
      })
}

export const getServiceData = async():Promise<any> => {
  let url = process.env.REACT_APP_API_URL+'api/Service/';
        let data1:any = [];
        let response = await fetchWithTokenRetry(url);
        if (response.ok) {
          data1 = await response.json();
          console.log("Data fetched successfully:", data1);
      } else {
          console.error("Failed to fetch data, status:", response.status);
      }
  return new Promise(resolve=>{
         resolve(data1)
      })
}
export const updateDeviceData = async (deviceCode: string, values: any): Promise<any> => {
  const url = `${process.env.REACT_APP_API_URL}api/Device/${deviceCode}`;
  let responseData: any = null;

  const options = {
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`, 
    },
    body: JSON.stringify({
      deviceCode: values.deviceCode,
      deviceName: values.deviceName,
      ipAddress: values.ipAddress,
      username: values.username,
      password: values.password,
      operationStatus: values.operationStatus ? "Active" : "Inactive", 
      connected: values.connected ? "Connected" : "Disconnected",
      serviceCode: values.service, 
    }),
  };
  try {
    const response = await fetchWithTokenRetry(
      `${url}?method=${options.method}&headers=${encodeURIComponent(JSON.stringify(options.headers))}`,
    );

    if (response.ok) {
      responseData = await response.json();
      console.log("Device updated successfully:", responseData);
    } else {
      const error = await response.json();
      console.error("Failed to update device:", error.message || response.status);
    }
  } catch (error) {
    console.error("Error occurred while updating device:", error);
  }

  return new Promise((resolve) => {
    resolve(responseData);
  });
};

export const deleteDeviceData = async (deviceCode: string): Promise<any> => {
  const url = `${process.env.REACT_APP_API_URL}api/Device/${deviceCode}`;
  let responseData: any = null;

  try {
    const response = await fetchWithTokenRetry(
      `${url}?method=DELETE&headers=${encodeURIComponent(
        JSON.stringify({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        })
      )}`
    );

    if (response.ok) {
      responseData = await response.json();
      console.log("Device deleted successfully:", responseData);
    } else {
      const error = await response.json();
      console.error("Failed to delete device:", error.message || response.status);
    }
  } catch (error) {
    console.error("Error occurred while deleting device:", error);
  }

  return new Promise((resolve) => {
    resolve(responseData);
  });
};
const handleDeleteService = async (serviceCode: string) => {
  console.log("Deleting Service with Code:", serviceCode);

  const url = `${process.env.REACT_APP_API_URL}api/Service/${serviceCode}`;

  try {
    
    const response = await fetch(url, {
      method: "DELETE", 
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      console.log("Service deleted successfully");
      message.success("Dịch vụ đã được xóa thành công!");
      
    } else {
      const error = await response.json();
      console.error("Failed to delete service:", error.message || response.status);
      message.error(`Lỗi: ${error.message || "Không thể xóa dịch vụ."}`);
    }
  } catch (error) {
    console.error("Error occurred while deleting service:", error);
    message.error("Đã xảy ra lỗi trong quá trình xóa dịch vụ. Hãy thử lại sau.");
  }
};

const handleUpdateService = async (serviceCode: string, values: any) => {
  if (!serviceCode) {
    message.error("Mã dịch vụ không được để trống.");
    return;
  }

  console.log("Updating Service with Code:", serviceCode);

  const url = `${process.env.REACT_APP_API_URL}api/Service/${serviceCode}`;
  const requestData = {
    serviceCode: values.serviceCode,
    serviceName: values.serviceName,
    description: values.description,
    isInOperation: values.isInOperation ? "Active" : "Inactive", 
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify(requestData), 
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Service updated successfully:", data);
      message.success("Dịch vụ đã được cập nhật thành công!");
    } else {
      const error = await response.json();
      console.error("Failed to update service:", error.message || response.status);
      message.error(`Lỗi: ${error.message || "Không thể sửa dịch vụ."}`);
    }
  } catch (error) {
    console.error("Error occurred while updating service:", error);
    message.error("Đã xảy ra lỗi trong quá trình sửa dịch vụ. Hãy thử lại sau.");
  }
};
const handleUpdateProvidedNumber = async (providedNumberCode: string, values: any) => {
  if (!providedNumberCode) {
    message.error("Mã cấp số không được để trống.");
    return;
  }
  console.log("Updating Provided Number with Code:", providedNumberCode);
  const url = `${process.env.REACT_APP_API_URL}api/ProvidedNumber/${providedNumberCode}`;
  const requestData = {
    customerName: values.customerName,
    telephone: values.telephone,
    serviceCode: values.serviceCode,
    status: values.status,
    assignmentDate: values.assignmentDate || new Date().toISOString(),
    expireDate: values.expireDate || new Date().toISOString(),
  };
  try {
    const response = await fetch(url, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify(requestData), 
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Provided Number updated successfully:", data);
      message.success("Cấp số đã được cập nhật thành công!");
    } else {
      const error = await response.json();
      console.error("Failed to update provided number:", error.message || response.status);
      message.error(`Lỗi: ${error.message || "Không thể sửa cấp số."}`);
    }
  } catch (error) {
    console.error("Error occurred while updating provided number:", error);
    message.error("Đã xảy ra lỗi trong quá trình sửa cấp số. Hãy thử lại sau.");
  }
};
export const deleteUser = async (userId: string): Promise<void> => {
  if (!userId) {
    message.error("Mã người dùng không được để trống.");
    return;
  }
  console.log("Deleting user with ID:", userId);
  const url = `${process.env.REACT_APP_API_URL}api/User/${userId}`;
  try {
    const response = await fetch(url, {
      method: "DELETE", 
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
    });
    if (response.ok) {
      console.log("User deleted successfully.");
      message.success("Người dùng đã được xóa thành công!");
    } else {
      const error = await response.json();
      console.error("Failed to delete user:", error.message || response.status);
      message.error(`Lỗi: ${error.message || "Không thể xóa người dùng."}`);
    }
  } catch (error) {
    console.error("Error occurred while deleting user:", error);
    message.error("Đã xảy ra lỗi trong quá trình xóa người dùng. Hãy thử lại sau.");
  }
};

  // Example usage
  //const isoString = "2024-11-27T08:01:02.389Z";
  //console.log(formatDate(isoString)); // Output: "15:01:02 27/11/2024"
  