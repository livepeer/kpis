import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { abbreviateNumber } from "../../utils";

const getPercent = (value, total) => {
  const ratio = total > 0 ? value / total : 0;

  return toPercent(ratio, 2);
};

const renderCustomAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text y={14} textAnchor="start" fill="#666">
        {payload.value}
      </text>
    </g>
  );
};

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

const renderTooltipContent = (o) => {
  const { payload, label } = o;
  const total = payload.reduce((result, entry) => result + entry.value, 0);

  return (
    <div className="customized-tooltip-content">
      <p className="total">{`Round ${label} (Total: ${total})`}</p>
      <ul className="list">
        {payload.reverse().map((entry, index) => (
          <li
            key={`item-${index}`}
            style={{
              backgroundColor: "rgba(255, 255, 255, .8)",
              color: entry.color,
            }}
          >
            {`${entry.name}: ${abbreviateNumber(entry.value)}(${getPercent(
              entry.value,
              total
            )})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
}

export default ({ title, data }) => {
  return (
    <>
      <h2 style={{ marginTop: 40, marginBottom: 40 }}>{title}</h2>

      <AreaChart
        style={{ margin: "0 auto" }}
        width={800}
        height={400}
        data={data.stake}
        stackOffset="expand"
        margin={{
          top: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis tick={renderCustomAxisTick} dataKey="round" />
        <YAxis tickFormatter={toPercent} />
        <Tooltip content={renderTooltipContent} />
        {data.orchestrators.map((o, i) => (
          <Area
            key={i}
            type="monotone"
            dataKey={o}
            stackId="1"
            stroke={stringToColour(o)}
            fill={stringToColour(o)}
          />
        ))}
      </AreaChart>
    </>
  );
};
