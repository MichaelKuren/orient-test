import ResultsTable from "./ResultsTable.tsx";
import { Typography } from "antd";

const { Title } = Typography;

const App: React.FC = () => (
  <div>
    <Title level={2}>Протокол результатов</Title>
    <ResultsTable />
  </div>
);

export default App;
