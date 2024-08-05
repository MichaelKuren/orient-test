import { useState } from "react";
import { XMLParser } from "fast-xml-parser";
import { Table, Upload, Button, Divider } from "antd";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Title } = Typography;

interface PointDTO {
  key: string;
  mapX?: number;
  mapY?: number;
  gpsX?: number;
  gpsY?: number;
}

interface PointCourseDTO {
  courseTitle: string;
  pointList: PointDTO[];
}

const CoursesTable: React.FC = () => {
  const [data, setData] = useState<PointDTO[]>([]);
  const [columns, setColumns] = useState<ColumnsType<PointDTO>>();

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const parserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: "",
        textNodeName: "text",
        ignoreNameSpace: false,
      };

      const fileContent = reader.result as string;
      const parser = new XMLParser(parserOptions);
      const rawJson = parser.parse(fileContent);

      const points: PointDTO[] = rawJson.CourseData.RaceCourseData.Control.map(
        (point: any) => ({
          key: String(point.Id),
          mapX: parseFloat(point.MapPosition.x),
          mapY: parseFloat(point.MapPosition.y),
          gpsX: parseFloat(point.Position.lng),
          gpsY: parseFloat(point.Position.lat),
        }),
      );

      const courses: PointCourseDTO[] =
        rawJson.CourseData.RaceCourseData.Course.map((course: any) => ({
          courseTitle: String(course.Name),
          pointList: course.CourseControl.map((point: any) => ({
            key: String(point.Control),
            mapX: points.find((_point) => _point.key === String(point.Control))
              ?.mapX,
            mapY: points.find((_point) => _point.key === String(point.Control))
              ?.mapY,
            gpsX: points.find((_point) => _point.key === String(point.Control))
              ?.gpsX,
            gpsY: points.find((_point) => _point.key === String(point.Control))
              ?.gpsY,
          })),
        }));

      const columns: ColumnsType<PointDTO> = [
        {
          dataIndex: "key",
          key: "key",
          render: (text: string) => text,
        },
        ...courses.map((course) => ({
          title: course.courseTitle,
          key: course.courseTitle,
          render: (point: PointDTO) => {
            const coursePoint = course.pointList.find(
              (p) => p.key === point.key,
            );
            return coursePoint ? "+" : "";
          },
          align: "center" as "center",
        })),
      ];

      setColumns(columns);
      setData(points);
      console.log(courses);
    };

    reader.readAsText(file);
  };

  const uploadProps: UploadProps = {
    customRequest: ({ file }) => {
      if (file) {
        handleFileUpload(file as File);
      }
    },
    showUploadList: false,
    accept: ".xml",
  };

  return (
    <div>
      <Title level={2}>XML</Title>

      <Divider />

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Загрузить (*.xml)</Button>
      </Upload>

      <div style={{ marginTop: 25 }}>
        <Table
          columns={columns}
          bordered={true}
          dataSource={data}
          rowKey="key"
          locale={{ emptyText: "Нет данных" }}
        />
      </div>
    </div>
  );
};

export default CoursesTable;
