import Head from "next/head";
import Layout from "../components/Layout";
import ActiveStakeDistribution from "../components/ActiveStakeDistribution";
import StakeMovement from "../components/StakeMovement";
import NewStake from "../components/NewStake";

const Home = () => (
  <div className="container">
    <Head>
      <title>Livepeer Charts</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Layout>
      <h1 className="title" style={{ marginTop: 80 }}>
        Livepeer Charts
      </h1>

      <p className="description">Livepeer Protocol Metrics</p>

      <div className="grid">
        <ActiveStakeDistribution />
        <StakeMovement />
        <NewStake />
      </div>
    </Layout>
  </div>
);

export default Home;
