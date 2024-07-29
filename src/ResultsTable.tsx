import { useState } from "react";
import { Table, Upload, Button, Divider } from "antd";
import type { TableProps, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Papa from "papaparse";

interface DataType {
  number: number;
  name: string;
  team: string;
  qualification: string;
  numberGR: string;
  year: number;
  result: string;
  behind: string;
  place: number;
  note: string;
}

const columns: TableProps<DataType>["columns"] = [
  { title: "№п/п", dataIndex: "number", key: "number" },
  { title: "Фамилия, имя", dataIndex: "name", key: "name" },
  { title: "Коллектив", dataIndex: "team", key: "team" },
  { title: "Квал", dataIndex: "qualification", key: "qualification" },
  { title: "Номер ГР", dataIndex: "numberGR", key: "numberGR" },
  { title: "Год рождения", dataIndex: "year", key: "year" },
  { title: "Результат", dataIndex: "result", key: "result" },
  { title: "Отставание", dataIndex: "behind", key: "behind" },
  { title: "Место", dataIndex: "place", key: "place" },
];

const ResultsTable: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: DataType[] = results.data as DataType[];
        setData(parsedData);
      },
    });
  };

  const uploadProps: UploadProps = {
    customRequest: ({ file }) => {
      if (file) {
        handleFileUpload(file as File);
      }
    },
    showUploadList: false,
    accept: ".csv",
  };

  return (
    <div>
      <Divider />
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Загрузить результаты (*.csv)</Button>
      </Upload>

      <div style={{ marginTop: "25px" }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="number"
          pagination={false}
          locale={{ emptyText: "Нет данных" }}
        />
      </div>
    </div>
  );
};

export default ResultsTable;
