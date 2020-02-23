import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { request } from "graphql-request";
import { useEffect, useState } from "react";
import Utils from "web3-utils";
import { abbreviateNumber } from "../../utils";

// 1. Query 100 rounds
// 2. Loop through rounds and get startblock
// 3. query transcoders at start block
// 4. create an object using ids as unique keys and round number
const SUBGRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/livepeer/livepeer-canary";

const getPercent = (value, total) => {
  const ratio = total > 0 ? value / total : 0;

  return toPercent(ratio, 2);
};

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;
const renderTooltipContent = o => {
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
              color: entry.color
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

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

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

export default () => {
  const [data, setData] = useState([]);
  const [orchestrators, setOrchestrators] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      const query = `{
        rounds(orderBy: timestamp, orderDirection: desc) {
          id
          startBlock
          pools {
            totalStake
            delegate {
              id
            }
          }
        }
      }`;

      const { rounds } = await request(SUBGRAPH_ENDPOINT, query);
      let dataArr = [];
      let orchestratorArr = [];
      rounds.map(round => {
        let obj = { round: round.id };
        round.pools.map(pool => {
          const totalStake = parseFloat(Utils.fromWei(pool.totalStake));
          obj[pool.delegate.id] = totalStake;
          orchestratorArr.push(pool.delegate.id);
        });
        dataArr.push(obj);
      });
      setData(dataArr.reverse());
      setOrchestrators(orchestratorArr.filter(onlyUnique));
      setLoading(false);
    };
    init();
  }, []);

  return (
    <>
      <h2 style={{ marginTop: 40, marginBottom: 40 }}>
        Active Stake Distribution
      </h2>

      {!loading && (
        <AreaChart
          style={{ margin: "0 auto" }}
          width={800}
          height={400}
          data={data}
          stackOffset="expand"
          margin={{
            top: 10,
            bottom: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round" />
          <YAxis tickFormatter={toPercent} />
          <Tooltip content={renderTooltipContent} />
          {orchestrators.map(o => (
            <Area
              type="monotone"
              dataKey={o}
              stackId="1"
              stroke={stringToColour(o)}
              fill={stringToColour(o)}
            />
          ))}
        </AreaChart>
      )}
    </>
  );
};
