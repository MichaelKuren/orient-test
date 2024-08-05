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

      const buildPointDTO = (point: any): PointDTO => {
        const result: PointDTO = { key: String(point.Id) };

        if (point.MapPosition) {
          if (point.MapPosition.x !== undefined) {
            result.mapX = parseFloat(point.MapPosition.x);
          }
          if (point.MapPosition.y !== undefined) {
            result.mapY = parseFloat(point.MapPosition.y);
          }
        }

        if (point.Position) {
          if (point.Position.lng !== undefined) {
            result.gpsX = parseFloat(point.Position.lng);
          }
          if (point.Position.lat !== undefined) {
            result.gpsY = parseFloat(point.Position.lat);
          }
        }

        return result;
      };

      const points: PointDTO[] =
        rawJson.CourseData.RaceCourseData.Control.map(buildPointDTO);

      const buildPointWithDetails = (pointId: string): Partial<PointDTO> => {
        const point = points.find((p) => p.key === pointId);
        if (!point) return {};

        return {
          ...(point.mapX !== undefined && { mapX: point.mapX }),
          ...(point.mapY !== undefined && { mapY: point.mapY }),
          ...(point.gpsX !== undefined && { gpsX: point.gpsX }),
          ...(point.gpsY !== undefined && { gpsY: point.gpsY }),
        };
      };

      const courses: PointCourseDTO[] =
        rawJson.CourseData.RaceCourseData.Course.map((course: any) => ({
          courseTitle: String(course.Name),
          pointList: course.CourseControl.map((point: any) => ({
            key: String(point.Control),
            ...buildPointWithDetails(String(point.Control)),
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
