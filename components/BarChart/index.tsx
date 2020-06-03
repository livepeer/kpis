import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const renderCustomAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text y={14} textAnchor="start" fill="#666">
        {payload.value}
      </text>
    </g>
  );
};

export default ({ title, data, barDataKey, xAxisDataKey }) => {
  return (
    <>
      <h2 style={{ marginTop: 40, marginBottom: 40 }}>{title}</h2>

      <div>
        <BarChart
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
          <XAxis
            tick={renderCustomAxisTick}
            dataKey={xAxisDataKey}
            allowDataOverflow
          />
          <YAxis scale="log" domain={[0.01, "dataMax"]} allowDataOverflow />
          <Tooltip />
          <Legend />
          <Bar dataKey={barDataKey} fill="#82ca9d" />
        </BarChart>
      </div>
    </>
  );
};
