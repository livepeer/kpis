import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { request } from "graphql-request";
import { useEffect, useState } from "react";
import Utils from "web3-utils";

// 1. Query 100 rounds
// 2. Loop through rounds and get startblock
// 3. query transcoders at start block
// 4. create an object using ids as unique keys and round number
const SUBGRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/livepeer/livepeer-canary";

export default () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      const query = `{
        rounds(orderBy: timestamp, orderDirection: desc) {
          id
          totalMovedStake
          totalGeneratedFees
          totalNewStake
        }
      }`;

      const { rounds } = await request(SUBGRAPH_ENDPOINT, query);
      let dataArr = [];
      rounds.map(round => {
        let obj = {
          round: round.id,
          totalMovedStake: parseFloat(
            Utils.fromWei(round.totalMovedStake ? round.totalMovedStake : "0")
          )
        };
        dataArr.push(obj);
      });
      setData(dataArr.reverse());
      setLoading(false);
    };
    init();
  }, []);

  return (
    <>
      <h2 style={{ marginTop: 40, marginBottom: 40 }}>Stake Movement</h2>

      {!loading && (
        <div>
          <BarChart
            style={{ margin: "0 auto" }}
            width={800}
            height={400}
            data={data}
            margin={{
              top: 5,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" />
            <YAxis scale="log" domain={[0.01, "dataMax"]} allowDataOverflow />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalMovedStake" fill="#82ca9d" />
          </BarChart>
        </div>
      )}
    </>
  );
};
