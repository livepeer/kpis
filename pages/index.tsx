import Head from "next/head";
import Layout from "../components/Layout";
import AreaChart from "../components/AreaChart";
import BarChart from "../components/BarChart";
import { GraphQLClient } from "graphql-request";
import moment from "moment";
import LineChart from "../components/LineChart";
import axios from "axios";
import { request } from "graphql-request";
import Utils from "web3-utils";

const SUBGRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/livepeer/livepeer";

const Home = ({
  aggregateGovernanceData,
  forumData,
  lipRepoData,
  discordData,
  newStakeData,
  stakeMovementData,
  stakeDistributionData,
}) => {
  return (
    <div className="container">
      <Head>
        <title>Livepeer KPIs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <h1 className="title" style={{ marginTop: 80 }}>
          Livepeer KPIs
        </h1>

        <div className="grid">
          <LineChart
            title="Aggregate Governance Activity (discord, forum, github)"
            data={aggregateGovernanceData}
          />
          <LineChart title="LIP Repo Activity" data={lipRepoData} />
          <LineChart
            title="Discord Governance Channel Activity"
            data={discordData}
          />
          <LineChart title="Forum Activity" data={forumData} />
          <AreaChart
            title="Active Stake Distribution"
            data={stakeDistributionData}
          />
          <BarChart
            barDataKey="totalMovedStake"
            xAxisDataKey="round"
            title="Stake Movement"
            data={stakeMovementData}
          />
          <BarChart
            barDataKey="totalNewStake"
            xAxisDataKey="round"
            title="New Stake"
            data={newStakeData}
          />
        </div>
      </Layout>
    </div>
  );
};

export async function getStaticProps(context) {
  const lipRepoData = await getGithubComments();
  const discordData = await getDiscordComments();
  const forumData = await getForumComments();
  const newStakeData = await getNewStake();
  const stakeMovementData = await getStakeMovement();
  const stakeDistributionData = await getStakeDistribution();

  let aggregateGovernanceData = [];
  for (var i = 0; i < discordData.length; i++) {
    aggregateGovernanceData.push({
      totalComments:
        discordData[i].totalComments + lipRepoData[i].totalComments,
      date: discordData[i].date,
    });
  }

  return {
    props: {
      lipRepoData,
      discordData,
      forumData,
      aggregateGovernanceData,
      newStakeData,
      stakeMovementData,
      stakeDistributionData,
    },
    unstable_revalidate: true,
  };
}

// TODO: paginate results
async function getGithubComments() {
  const endpoint = "https://api.github.com/graphql";
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
    },
  });

  const query = /* GraphQL */ `
    {
      repository(owner: "livepeer", name: "LIPs") {
        pullRequests(last: 100, orderBy: { direction: DESC, field: COMMENTS }) {
          nodes {
            comments(last: 100) {
              totalCount
              edges {
                cursor
                node {
                  createdAt
                }
              }
            }
          }
        }
        issues(last: 100, orderBy: { direction: DESC, field: COMMENTS }) {
          nodes {
            comments(last: 100) {
              totalCount
              edges {
                cursor
                node {
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  const now = new Date();
  let commentsArr = [];
  for (
    var d = new Date(moment().subtract(3, "months").toString());
    d <= now;
    d.setDate(d.getDate() + 1)
  ) {
    commentsArr.push({
      date: moment(new Date(d)).format("MM.DD.YYYY"),
      totalComments: 0,
    });
  }
  const {
    repository: { issues, pullRequests },
  } = data;

  for (const { comments } of issues.nodes) {
    for (const { node } of comments.edges) {
      const date = moment(node.createdAt.toString()).format("MM.DD.YYYY");
      const objIndex = commentsArr.findIndex((obj) => obj.date === date);
      if (objIndex != -1) {
        commentsArr[objIndex].totalComments =
          commentsArr[objIndex].totalComments + 1;
      }
    }
  }

  for (const { comments } of pullRequests.nodes) {
    for (const { node } of comments.edges) {
      const date = moment(node.createdAt.toString()).format("MM.DD.YYYY");
      const objIndex = commentsArr.findIndex((obj) => obj.date === date);
      if (objIndex != -1) {
        commentsArr[objIndex].totalComments =
          commentsArr[objIndex].totalComments + 1;
      }
    }
  }
  return commentsArr.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(a.date) - new Date(b.date);
  });
}

// TODO: paginate results
async function getDiscordComments() {
  let commentsArr = [];
  const now = new Date();

  for (
    var d = new Date(moment().subtract(3, "months").toString());
    d <= now;
    d.setDate(d.getDate() + 1)
  ) {
    commentsArr.push({
      date: moment(new Date(d)).format("MM.DD.YYYY"),
      totalComments: 0,
    });
  }

  const endpoint = `https://discord.com/api/channels/686685097935503397/messages?limit=50`;
  const { data } = await axios.get(endpoint, {
    headers: {
      Authorization: `Bot ${process.env.LIVEPEER_KPI_DISCORD_BOT_API_KEY}`,
    },
  });
  for (const comment of data) {
    const date = moment(comment.timestamp).format("MM.DD.YYYY");
    const objIndex = commentsArr.findIndex((obj) => obj.date === date);
    if (objIndex != -1) {
      commentsArr[objIndex].totalComments =
        commentsArr[objIndex].totalComments + 1;
    }
  }
  return commentsArr;
}

// TODO: paginate results
async function getForumComments() {
  let commentsArr = [];
  const now = new Date();

  for (
    var d = new Date(moment().subtract(3, "months").toString());
    d <= now;
    d.setDate(d.getDate() + 1)
  ) {
    commentsArr.push({
      date: moment(new Date(d)).format("MM.DD.YYYY"),
      totalComments: 0,
    });
  }

  const endpoint = `https://forum.livepeer.org/search.json?q=category%3Agovernance%20order%3Alatest&page=1`;
  const {
    data: { posts, topics },
  } = await axios.get(endpoint);

  for (const comment of posts) {
    const date = moment(comment.created_at).format("MM.DD.YYYY");
    const objIndex = commentsArr.findIndex((obj) => obj.date === date);
    if (objIndex != -1) {
      commentsArr[objIndex].totalComments =
        commentsArr[objIndex].totalComments + 1;
    }
  }
  for (const comment of topics) {
    const date = moment(comment.created_at).format("MM.DD.YYYY");
    const objIndex = commentsArr.findIndex((obj) => obj.date === date);
    if (objIndex != -1) {
      commentsArr[objIndex].totalComments =
        commentsArr[objIndex].totalComments + 1;
    }
  }
  return commentsArr;
}

export default Home;

async function getNewStake() {
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
  rounds.map((round) => {
    let obj = {
      round: round.id,
      totalNewStake: parseFloat(
        Utils.fromWei(round.totalNewStake ? round.totalNewStake : "0")
      ),
    };
    dataArr.push(obj);
  });
  return dataArr.reverse();
}

async function getStakeMovement() {
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
  rounds.map((round) => {
    let obj = {
      round: round.id,
      totalMovedStake: parseFloat(
        Utils.fromWei(round.totalMovedStake ? round.totalMovedStake : "0")
      ),
    };
    dataArr.push(obj);
  });
  return dataArr.reverse();
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

async function getStakeDistribution() {
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
  rounds.map((round) => {
    let obj = { round: round.id };
    round.pools.map((pool) => {
      const totalStake = parseFloat(Utils.fromWei(pool.totalStake));
      obj[pool.delegate.id] = totalStake;
      orchestratorArr.push(pool.delegate.id);
    });
    dataArr.push(obj);
  });
  return {
    stake: dataArr.reverse(),
    orchestrators: orchestratorArr.filter(onlyUnique),
  };
}
