import React, { useEffect, useState, useContext } from "react";
import { Table, Select, Input, Modal, Tag } from "antd";
import _ from "lodash";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "./DeviceList.css";
import AddDeviceButton from "../AddDeviceButton";
import UserSection from "../userSection";
import NewQueueForm from "../NewQueueForm";
import { formatDate } from "../../pages/dashboard/Dashboard.logic";
import {getProvidedNumber,getDeviceData,getServiceData,getUserData} from "../../pages/dashboard/Dashboard.logic";
import AccountForm from "../AccountForm";
import DeviceForm from "../DeviceForm";
import {UserStatus,DeviceStatus,DeviceConnected,UserRole,NumberStatus,} from "../../helpers/predefinedData";
import ServiceForm from "../ServiceForm";
import { SignalRContext } from "../../helpers/SignalRProvider";
import TicketDisplay from "../TicketDisplay/TicketDisplay";
const { Option } = Select;
type DeviceListProps = {
  sendSelectedIndex: (index: number, data: any) => void;
  columns: number;
  headerText: string;
  buttonText: string;
  filter1: string;
  filter2: string;
};
const initialValues = {
  fullName: "", // Pre-fill the username field
  email: "", // Pre-fill the email field
  phoneNumber: "",
};
const DeviceList = React.memo((props: DeviceListProps) => {
  const connection = useContext(SignalRContext);
  const token = localStorage.getItem("token");
  const [filter1Value, setFilter1Value] = useState("All");
  const [filter2Value, setFilter2Value] = useState("All");
  const [status, setStatus] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [internalData, setInternalData] = useState<any>([]);
  const [displayData, setDisplayData] = useState<any>([]);
  const [serviceOptions, setServiceOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [internalColumns, setInternalColumns] = useState<any>([]);
  const [dataUserEdit, setDataUserEdit] = useState<any>({});
  const [isModelNumberOpen, setIsModalNumberOpen] = useState(false);
  const [newNumber, setNewNumber] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [assignmentDate, setAssignmentDate] = useState<string>("");
  const [serviceName, setServiceName] = useState<string>("");

  const debouncedSearch = _.debounce(
    (filter1Value, filter2Value, searchValue) => {
      handleSearch(filter1Value, filter2Value, searchValue);
    },
    300
  );
  const debouncedSearchNumber = _.debounce(
    (service, start, end, deviceCode, searchText, status) => {
      handleSearchNumber(service, start, end, deviceCode, searchText, status);
    },
    300
  );
  const handleInputChange = (e: any, columnProp: number) => {
    const value = e.target.value;
    if (columnProp == 4) debouncedSearch(filter1Value, filter2Value, value);
    else
      debouncedSearchNumber(
        filter1Value,
        "2024-01-01",
        "2025-12-31",
        "All",
        searchText,
        filter2Value
      );
  };
  
  const receiveStatus = (status: boolean) => {
    setIsModalOpen(status);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(5);


  const customPagination = {
    current: currentPage, 
    pageSize: pageSize,
    total:totalRecords,  
    showSizeChanger: true,
    pageSizeOptions: ["10", "5", "2","15"], 
    onChange: async (page: number) => {
      setCurrentPage(page);
    },
    onShowSizeChange: async (current: number, newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(current);
    },
  };

  const receiveIsNumberDisplay = (status: boolean, data: any) => {
    if (status) {
      setCustomerName(data.customerName);
      setNewNumber(data.code);
      setServiceName(data.serviceName);
      setAssignmentDate(formatDate(data.assignmentDate));
      setIsModalOpen(false);
      setIsModalNumberOpen(true);
    }
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setDataUserEdit({});
    setIsModalOpen(false);
  };
  const handleNumberOk = () => {
    setIsModalNumberOpen(false);
  };
  const handleCancel = () => {
    setDataUserEdit({});
    setIsModalOpen(false);
  };
  const handleNumberCancel = () => {
    setIsModalNumberOpen(false);
  };
  const columns = [
    {
      title: "Mã thiết bị",
      dataIndex: "deviceCode",
      key: "deviceCode",
    },
    {
      title: "Tên thiết bị",
      dataIndex: "deviceName",
      key: "deviceName",
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "operationStatus",
      key: "operationStatus",
      render: (status: string) =>
        status === "Active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: "Trạng thái kết nối",
      dataIndex: "connected",
      key: "connected",
      render: (connection: string) =>
        connection === "Connected" ? (
          <Tag color="green">Kết nối</Tag>
        ) : (
          <Tag color="red">Mất kết nối</Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      render: (text: string, record: any, index: number) => (
        <>
          <a href="#" style={{ marginRight: 10 }}>
            Chi tiết
          </a>
          <a
            href="#"
            onClick={() => {
              setDataUserEdit(record);
              setIsModalOpen(true);
            }}
          >
            Cập nhật
          </a>
        </>
      ),
    },
  ];
  const columnsSvc = [
    {
      title: "Mã dịch vụ",
      dataIndex: "serviceCode",
      key: "serviceCode",
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "serviceName",
      key: "servicName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "isInOperation",
      key: "isInOperation",
      render: (status: string) =>
        status === "Active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: () => (
        <>
          <a href="#" style={{ marginRight: 10 }}>
            Chi tiết
          </a>
          <a href="#">Cập nhật</a>
        </>
      ),
    },
  ];
  const renderStatus = React.useCallback((status: string) => {
    return status === "Đang online" ? (
      <Tag color="blue">{status}</Tag>
    ) : (
      <Tag color="red">{status}</Tag>
    );
  }, []);
  const renderActions = React.useCallback(
    (text: string, record: any, index: number) => {
      return (
        <>
          <a href="#" style={{ marginRight: 10 }}>
            Chi tiết
          </a>
          <a
            href="#"
            onClick={() => {
              setDataUserEdit(record);
              setIsModalOpen(true);
            }}
          >
            Cập nhật
          </a>
        </>
      );
    },
    [setDataUserEdit, setIsModalOpen]
  );

  const columnsUser = React.useMemo(
    () => [
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Họ tên",
        dataIndex: "fullName",
        key: "fullName",
      },
      {
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
      },
      {
        title: "Vai trò",
        dataIndex: "userRole",
        key: "userRole",
      },
      {
        title: "Trạng thái",
        dataIndex: "isActive",
        key: "isActive",
        render: renderStatus,
      },
      {
        title: "",
        key: "actions",
        render: renderActions,
      },
    ],
    [renderStatus, renderActions]
  );
  const columnsPN = [
    {
      title: "STT",
      dataIndex: "code",
      key: "code",
      render: (text: string, record: any, index: number) => {
        if (localStorage.getItem("userRole") == "Doctor")
          return (
            <a
              href="#"
              onClick={() => {
                fetch(
                  process.env.REACT_APP_API_URL +
                    "api/Assignment/" +
                    text +
                    "/1",
                  {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.message == "Updated") {
                      getPN();
                    }
                  });
              }}
            >
              {text}
            </a>
          );
        else return <span>{text}</span>;
      },
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Thời gian cấp",
      dataIndex: "assignmentDate",
      key: "assignmentDate",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expireDate",
      key: "expireDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "Đang chờ" ? (
          <Tag color="blue">{status}</Tag>
        ) : status === "Đã sử dụng" ? (
          <Tag color="gray">{status}</Tag>
        ) : (
          <Tag color="red">{status}</Tag>
        ),
    },
    {
      title: "Nguồn cấp",
      dataIndex: "deviceCode",
      key: "deviceCode",
    },
    {
      title: "",
      key: "actions",
      render: () => (
        <>
          <a href="#" style={{ marginRight: 10 }}>
            Chi tiết
          </a>
        </>
      ),
    },
  ];
  const handleFilter1Change = async (value: string) => {
    switch (props.columns) {
      case 1:
        setDisplayData(
          filter2Value == "All"
            ? value != "All"
              ? internalData.filter(
                  (x: any) =>
                    x.operationStatus == value &&
                    x.deviceName.includes(searchText)
                )
              : internalData.filter((x: any) =>
                  x.deviceName.includes(searchText)
                )
            : value != "All"
            ? internalData.filter(
                (x: any) =>
                  x.operationStatus == value &&
                  x.connected == filter2Value &&
                  x.deviceName.includes(searchText)
              )
            : internalData.filter(
                (x: any) =>
                  x.connected == filter2Value &&
                  x.deviceName.includes(searchText)
              )
        );
        setFilter1Value(value);
        break;
      case 2:
        setDisplayData(
          filter2Value == "All"
            ? value != "All"
              ? internalData.filter(
                  (x: any) =>
                    x.isInOperation == value &&
                    x.description.includes(searchText)
                )
              : internalData.filter((x: any) =>
                  x.description.includes(searchText)
                )
            : value != "All"
            ? internalData.filter((x: any) => x.isInOperation == value)
            : internalData.filter((x: any) =>
                x.description.includes(searchText)
              )
        );
        setFilter2Value(value);
        break;
      case 4:
        await handleSearch(value, filter2Value, searchText);
        setFilter1Value(value);
        break;
      default:
        await handleSearchNumber(
          value,
          "2024-01-01",
          "2025-12-31",
          "All",
          "",
          "All"
        );
        setFilter1Value(value);
        break;
    }
  };
  const handleFilter2Change = async (value: string) => {
    switch (props.columns) {
      case 1:
        setDisplayData(
          filter1Value == "All"
            ? value != "All"
              ? internalData.filter((x: any) => x.connected == value)
              : internalData
            : value != "All"
            ? internalData.filter(
                (x: any) =>
                  x.connected == value && x.operationStatus == filter1Value
              )
            : internalData.filter((x: any) => x.operationStatus == filter1Value)
        );
        setFilter2Value(value);
        break;
      case 2:
        setDisplayData(
          filter1Value == "All"
            ? internalData.filter((x: any) => x.IsInOperation == value)
            : internalData.filter(
                (x: any) =>
                  x.operationStatus == value && x.connected == filter1Value
              )
        );
        setFilter2Value(value);
        break;
      case 4:
        await handleSearch(filter1Value, value, searchText);
        setFilter2Value(value);
        break;
      default:
        await handleSearchNumber(
          filter1Value,
          "2024-01-01",
          "2025-12-31",
          "All",
          "",
          value
        );
        setFilter2Value(value);
        break;
    }
  };
  const getTotalRecord = async (
    value1: string,
    value2: string,
    value3: string
  ): Promise<number> => {
    return new Promise((resolve) => {
      fetch(
        process.env.REACT_APP_API_URL +
          "api/User/totaluser/" +
          value1 +
          "/" +
          value2 +
          "/" +
          value3,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => console.log(error));
    });
  };
  const getTotalNumber = async (serviceCode: string,start: string,end: string,deviceCode: string,searchText: string,status: string): Promise<number> => {
    return new Promise((resolve) => {
      fetch(
        process.env.REACT_APP_API_URL +
          "api/Assignment/count/" +
          localStorage.getItem("userName") +
          "/" +
          serviceCode +
          "/" +
          start +
          "/" +
          end +
          "/" +
          deviceCode +
          "/" +
          searchText +
          "/" +
          status,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => console.log(error));
    });
  };
  const handleSearch = async (filter1Value: string,filter2Value: string,searchValue: string) => {
    const searchParam = searchValue === "" ? "___" : searchValue;

    setLoading(true); // Show the loading indicator

    try {
      const [totalRecords, tempData] = await Promise.all([
        getTotalRecord(filter1Value, filter2Value, searchParam),
        getUserData(filter1Value, filter2Value, searchParam, 1, pageSize),
      ]);
      setTotalRecords(totalRecords);
      setDisplayData(tempData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Hide the loading indicator
    }
  };
  const handleSearchNumber = async (
    filter1Value: string,
    start: string,
    end: string,
    filter2Value: string,
    searchValue: string,
    status: string
  ) => {
    const searchParam = searchValue === "" ? "___" : searchValue;

    setLoading(true); // Show the loading indicator

    try {
      const [totalRecords, tempData] = await Promise.all([
        getTotalNumber(
          filter1Value,
          "2024-01-01",
          "2025-12-31",
          filter2Value,
          searchParam,
          status
        ),
        getProvidedNumber(
          filter1Value,
          "2024-01-01",
          "2025-12-31",
          filter2Value,
          searchParam,
          1,
          pageSize,
          status
        ),
      ]);
      setTotalRecords(totalRecords);
      setDisplayData(tempData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Hide the loading indicator
    }
  };
  async function getPN() {
    let srvData = await getServiceData();
    setServiceOptions(
      srvData.map((item: any) => {
        return { value: item.serviceCode, label: item.serviceName };
      })
    );
    if (props.columns == 1) {
      let tempData = await getDeviceData();
      setInternalData(tempData);
      setDisplayData(tempData);
    } else if (props.columns == 2) {
      let tempData = await getServiceData();
      setInternalData(tempData);
      setDisplayData(tempData);
    } else if (props.columns == 3) {
      setLoading(true);
      const [totalRecords, tempData] = await Promise.all([
        getTotalNumber(
          filter1Value,
          "2024-01-01",
          "2025-12-31",
          "All",
          searchText == "" ? "___" : searchText,
          filter2Value
        ),
        getProvidedNumber(
          filter1Value,
          "2024-01-01",
          "2025-12-31",
          "All",
          searchText == "" ? "___" : searchText,
          currentPage,
          pageSize,
          filter2Value
        ),
      ]);
      setLoading(false);
      setTotalRecords(totalRecords);
      setDisplayData(tempData);
    } else {
      setLoading(true);
      const [totalRecords, tempData] = await Promise.all([
        getTotalRecord(
          filter1Value,
          filter2Value,
          searchText == "" ? "___" : searchText
        ),
        getUserData(
          filter1Value,
          filter2Value,
          searchText == "" ? "___" : searchText,
          currentPage,
          pageSize
        ),
      ]);
      setLoading(false);
      setTotalRecords(totalRecords);
      setDisplayData(tempData);
    }
  }
  useEffect(() => {
    if (connection) {
      connection.on(
        "ReceivedOnline",
        async (userId: string, status: boolean) => {
          setLoading(true);
          const [totalRecords, tempData] = await Promise.all([
            getTotalRecord(
              filter1Value,
              filter2Value,
              searchText == "" ? "___" : searchText
            ),
            getUserData(
              filter1Value,
              filter2Value,
              searchText == "" ? "___" : searchText,
              1,
              pageSize
            ),
          ]);
          setLoading(false);
          setTotalRecords(totalRecords);
          setDisplayData(tempData);
        }
      );
      connection.on(
        "ReceivedOffline",
        async (userId: string, status: boolean) => {
          setLoading(true);
          const [totalRecords, tempData] = await Promise.all([
            getTotalRecord(
              filter1Value,
              filter2Value,
              searchText == "" ? "___" : searchText
            ),
            getUserData(
              filter1Value,
              filter2Value,
              searchText == "" ? "___" : searchText,
              1,
              pageSize
            ),
          ]);
          setLoading(false);
          setTotalRecords(totalRecords);
          setDisplayData(tempData);
        }
      );
      connection.on("ReceiveProvidedNumber", async (code: string) => {
        setLoading(true);
        const [totalRecords, tempData] = await Promise.all([
          getTotalNumber(
            filter1Value,
            "2024-01-01",
            "2025-12-31",
            "All",
            searchText == "" ? "___" : searchText,
            filter2Value
          ),
          getProvidedNumber(
            filter1Value,
            "2024-01-01",
            "2025-12-31",
            "All",
            searchText == "" ? "___" : searchText,
            1,
            pageSize,
            filter2Value
          ),
        ]);
        setLoading(false);
        setTotalRecords(totalRecords);
        setDisplayData(tempData);
      });
    }
  }, [connection]);
  useEffect(() => {
    setInternalColumns(
      props.columns == 1
        ? columns
        : props.columns == 2
        ? columnsSvc
        : props.columns == 3
        ? columnsPN
        : columnsUser
    );
    getPN();
  }, [currentPage, pageSize, isModalOpen]);
  return (
    <div className="device-list">
      <div className="top-bar">
        <h2>{props.headerText}</h2>
        <UserSection
          count={displayData.filter((x: any) => x.status == "Đang chờ").length}
        />
      </div>
      {/* User section */}
      {/* Filters */}
      <div className="filters">
        
        <div className="leftFilterItem">
          <div className="filterItem">
            <span style={{ marginBottom: "5px" }}>{props.filter1}</span>
            <Select
              defaultValue="Tất cả"
              style={{ width: 180 }}
              className="filter"
              onChange={handleFilter1Change}
            >
              {props.columns == 1 || props.columns == 2 ? (
                DeviceStatus.map((item) => {
                  return <Option value={item.value}>{item.label}</Option>;
                })
              ) : props.columns == 4 ? (
                UserRole.map((item) => {
                  return <Option value={item.value}>{item.label}</Option>;
                })
              ) : (
                <>
                  <Option value="All">Tất cả</Option>
                  {serviceOptions.map((item) => {
                    return <Option value={item.value}>{item.label}</Option>;
                  })}
                </>
              )}
            </Select>
          </div>
          <div className="filterItem">
            <span style={{ marginBottom: "5px" }}>{props.filter2}</span>
            <Select
              defaultValue="Tất cả"
              style={{ width: 180 }}
              className="filter"
              onChange={handleFilter2Change}
            >
              {props.columns == 1 ? (
                DeviceConnected.map((item) => {
                  return <Option value={item.value}>{item.label}</Option>;
                })
              ) : props.columns == 2 ? (
                <Option value="All">Tất cả</Option>
              ) : props.columns == 4 ? (
                UserStatus.map((item) => {
                  return <Option value={item.value}>{item.label}</Option>;
                })
              ) : (
                NumberStatus.map((item) => {
                  return <Option value={item.value}>{item.label}</Option>;
                })
              )}
            </Select>
          </div>
        </div>
        <div className="leftFilterItem">
          <div className="filterItem">
            <span style={{ marginBottom: "5px" }}>Từ khóa</span>
            <Input
              placeholder="Nhập từ khóa"
              value={searchText}
              onChange={async (e) => {
                if (props.columns == 4 || props.columns == 3)
                  handleInputChange(e, props.columns);
                else if (props.columns == 1) {
                  setDisplayData(
                    filter1Value != "All"
                      ? filter2Value != "All"
                        ? internalData.filter(
                            (x: any) =>
                              x.deviceName.includes(e.target.value) &&
                              x.operationStatus == filter1Value &&
                              x.connected == filter2Value
                          )
                        : internalData.filter(
                            (x: any) =>
                              x.deviceName.includes(e.target.value) &&
                              x.operationStatus == filter1Value
                          )
                      : internalData.filter((x: any) =>
                          x.deviceName.includes(e.target.value)
                        )
                  );
                } else if (props.columns == 2) {
                  setDisplayData(
                    filter1Value != "All"
                      ? internalData.filter(
                          (x: any) =>
                            x.description.includes(e.target.value) &&
                            x.isInOperation == filter1Value
                        )
                      : internalData.filter((x: any) =>
                          x.description.includes(e.target.value)
                        )
                  );
                }
                //await handleSearch(filter1Value, filter2Value, e.target.value);
                setSearchText(e.target.value);
              }}
              style={{ width: 240 }}
              suffix={<SearchOutlined />}
            />
          </div>
        </div>
      </div>
      <div className="middleData">
        <Table
          style={{ width: "88%" }}
          dataSource={displayData}
          columns={
            props.columns == 1
              ? columns
              : props.columns == 2
              ? columnsSvc
              : props.columns == 3
              ? columnsPN
              : columnsUser
          }
          loading={{ spinning: loading, delay: 200 }}
          pagination={
            props.columns == 1 || props.columns == 2
              ? { pageSize: 8 }
              : customPagination
          }
          className="device-table"
        />
        <div
          style={{
            width: "10%",
            marginLeft: "10px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          {localStorage.getItem("userRole") != "Doctor" ? (
            <AddDeviceButton
              sendStatus={receiveStatus}
              headerText={props.buttonText}
            />
          ) : null}
        </div>
      </div>
      <Modal
        title=""
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        onClose={() => {
          setDataUserEdit({});
        }}
        width="60%"
        footer={null}
        style={{ padding: "20px" }} 
      >
        {props.columns == 3 ? (
          <NewQueueForm
            serviceOptions={serviceOptions}
            isNumberDisplay={receiveIsNumberDisplay}
          />
        ) : props.columns == 4 ? (
          <AccountForm
            myForm={dataUserEdit}
            serviceOptions={serviceOptions}
            handleSendStatus={receiveStatus}
          />
        ) : props.columns == 1 ? (
          <DeviceForm
            myForm={dataUserEdit}
            serviceOptions={serviceOptions}
            handleSendStatus={receiveStatus}
          />
        ) : (
          <ServiceForm />
        )}
      </Modal>
      <Modal
        title=""
        open={isModelNumberOpen}
        onOk={handleNumberOk}
        onCancel={handleNumberCancel}
        footer={null}
        className="custom-modal"
      >
        <TicketDisplay
          ticketNumber={newNumber}
          serviceName={serviceName}
          issueTime={assignmentDate}
          customerName={customerName}
          expiryTime="Trong ngày"
        />
      </Modal>
    </div>
  );
});
export default DeviceList;
