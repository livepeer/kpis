import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import moment from "moment";

export default ({ title, data }) => {
  const renderCustomAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text y={14} textAnchor="start" fill="#666">
          {moment(payload.value).format("MM.DD")}
        </text>
      </g>
    );
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ marginTop: 40, marginBottom: 40 }}>{title}</h2>
      <LineChart
        style={{ margin: "0 auto" }}
        width={800}
        height={400}
        data={data}
        margin={{
          top: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={renderCustomAxisTick} interval={7} dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalComments" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};
