import { PlusOutlined } from "@ant-design/icons";
import {
  ProTable,
  ModalForm,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
} from "@ant-design/pro-components";
import {
  Select,
  Button,
  Space,
  message,
  Tag,
  Popconfirm,
  Form,
  DatePicker,
} from "antd";
import { useRef, useState, useEffect } from "react";
import dayjs from "dayjs";
import "./App.css";
import moment from "moment/moment";
import { nanoid } from "nanoid";

const App = () => {
  const tagOptions = [
    {
      value: "home",
      label: "home",
    },
    {
      value: "important",
      label: "important",
    },
    {
      value: "college",
      label: "college",
    },
    {
      value: "school",
      label: "school",
    },
    {
      value: "work",
      label: "work",
    },
  ];
  const statusOptions = [
    {
      text: "Open",
      status: "Open",
    },
    {
      text: "Done",
      status: "Done",
    },
    {
      text: "Working",
      status: "Working",
    },
    {
      text: "Overdue",
      status: "Overdue",
    },
  ];
  const actionRef = useRef();
  const [tableData, setTableData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const handleDelete = (id) => {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    };
    fetch(`https://63ecef2abe929df00cb58085.mockapi.io/todoapp/${id}`, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const newTableData = tableData.filter((d) => d.id !== id);
        setTableData(newTableData);
        message.success("Task deleted successfully!");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        message.error("Failed to delete task");
      });
  };

  const handleFinish = (values) => {
    const created_at = moment().format("YYYY-MM-DD HH-mm-ss");
    let id = nanoid();
    const todo = { ...values, created_at, id };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    };
    fetch("https://63ecef2abe929df00cb58085.mockapi.io/todoapp", options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        fetch("https://63ecef2abe929df00cb58085.mockapi.io/todoapp")
          .then((response) => response.json())
          .then((data) => {
            setTableData(data);
            message.success("Added New Todo");
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
    form.resetFields();
    setVisible(false);
  };

  const disabledDate = (current) => {
    return current < dayjs().endOf("day");
  };

  const tagFilters = tagOptions.map((option) => ({
    text: option.label,
    value: option.value,
  }));

  const stateFilters = statusOptions.map((option) => ({
    text: option.text,
    value: option.status,
  }));

  useEffect(() => {
    fetch("https://63ecef2abe929df00cb58085.mockapi.io/todoapp")
      .then((response) => response.json())
      .then((data) => setTableData(data))
      .catch((error) => console.log(error));
  }, []);

  const columns = [
    {
      title: "Created on",
      dataIndex: "created_at",
      valueType: "datetime",
      sorter: (a, b) =>
        moment(a.created_at, "YYYY-MM-DD HH:mm:ss") -
        moment(b.created_at, "YYYY-MM-DD HH:mm:ss"),
      editable: false,
      hideInSearch: true,
    },
    {
      title: "Title",
      sorter: (a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      dataIndex: "title",
      copyable: false,
      ellipsis: true,
      hideInSearch: false,
      tip: "Titles that are too long will get short automatically",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "This field is required",
          },
        ],
      },
    },
    {
      title: "Description",
      dataIndex: "desc",
      copyable: false,
      ellipsis: true,
      sorter: (a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      formItemProps: {
        rules: [
          {
            required: true,
            message: "This field is required",
          },
        ],
      },
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      valueType: "date",
      hideInSearch: false,
    },
    {
      editable: false,
      disable: true,
      title: "Tag",
      dataIndex: "tags",
      filters: tagFilters,
      onFilter: (value, record) => record.tags?.includes(value),
      search: false,
      renderFormItem: (_, { defaultRender }) => {
        return defaultRender(_);
      },

      render: (_, record) => (
        <Space>
          {record?.tags?.map((tag) => {
            if (record?.tags) {
              return (
                <Tag color="blue" key={tag}>
                  {tag}
                </Tag>
              );
            } else {
              return null;
            }
          })}
        </Space>
      ),
    },
    {
      disable: false,
      title: "Status",
      dataIndex: "state",
      filters: stateFilters,
      onFilter: (value, record) => {
        return record?.state?.includes(value);
      },
      ellipsis: true,
      valueType: "select",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "This field is required",
          },
        ],
      },
      valueEnum: statusOptions,
    },

    {
      title: "operate",
      valueType: "option",
      key: "option",
      render: (text, record, _, action) => [
        <Button
          type="primary"
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          Edit
        </Button>,
        <Popconfirm
          title="Delete the task"
          description="Are you sure to delete this task?"
          onConfirm={() => {
            handleDelete(record?.id);
          }}
          okText="Yes"
          cancelText="No"
          id={record?.id}
        >
          <Button danger>Delete</Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <h1 style={{ textAlign: "center", marginTop: "20px", color: "blue" }}>
        TO DO LIST
      </h1>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        dataSource={tableData}
        cardBordered
        editable={{
          type: "multiple",
          onDelete: (key) => {
            handleDelete(key);
          },
          onSave: async (key, row) => {
            try {
              const response = await fetch(
                `https://63ecef2abe929df00cb58085.mockapi.io/todoapp/${key}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(row),
                }
              );
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              let index = tableData.findIndex((item) => item.id === key);
              let newData = [...tableData];
              let newRowData = {
                ...newData[index],
                ...row,
              };
              if (!Array.isArray(newRowData.tags)) {
                newRowData.tags = [newRowData.tags];
              }
              newData.splice(index, 1, newRowData);
              setTableData(newData);
              message.success("Successfully saved!");
            } catch (error) {
              console.error(
                "There was a problem with the fetch operation:",
                error
              );
            }
          },
        }}
        columnsState={{
          persistenceKey: "pro-table-singe-demos",
          persistenceType: "localStorage",
        }}
        rowKey="id"
        search={{
          labelWidth: "auto",
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          syncToUrl: (values, type) => {
            if (type === "get") {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        pagination={{
          pageSize: 5,
        }}
        dateFormatter="string"
        headerTitle="Advanced forms"
        toolBarRender={() => [
          <ModalForm
            submitter={{
              render: () => null,
            }}
            visible={visible}
            className="custom-modal-form"
            title="Add todos"
            trigger={
              <Button type="primary" onClick={() => setVisible(true)}>
                <PlusOutlined />
                Add Todo
              </Button>
            }
            form={form}
            autoFocusFirstInput
            modalProps={{
              destroyOnClose: true,
              onCancel: () => {
                setVisible(false);
              },
            }}
          >
            <ProForm
              onFinish={handleFinish}
              initialValues={{
                state: "Open",
              }}
            >
              <ProForm.Group>
                <ProFormText
                  width="md"
                  name="title"
                  label="Title"
                  placeholder="title"
                  rules={[
                    {
                      required: true,
                      max: 100,
                      message:
                        "Description must be no more than 100 characters",
                    },
                  ]}
                />
                <ProFormTextArea
                  name="desc"
                  label="Description"
                  placeholder="Description"
                  width="xl"
                  rules={[
                    {
                      required: true,
                      max: 1000,
                      message:
                        "Description must be no more than 1000 characters",
                    },
                  ]}
                />
                <Form.Item name="due_date" label="Due Date">
                  <DatePicker disabledDate={disabledDate} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="tags" label="Tags">
                  <Select
                    mode="tags"
                    showSearch
                    style={{ width: "100px" }}
                    placeholder="Select or enter tags"
                    options={tagOptions}
                  />
                </Form.Item>
                <ProFormSelect
                  name="state"
                  label="Select"
                  valueEnum={{
                    Open: "Open",
                    Working: "Working",
                    Done: "Done",
                    Overdue: "Overdue",
                  }}
                  placeholder="Please select status"
                  rules={[
                    { required: true, message: "Please select your status!" },
                  ]}
                />
              </ProForm.Group>
            </ProForm>
          </ModalForm>,
        ]}
      />
    </>
  );
};
export default App;
