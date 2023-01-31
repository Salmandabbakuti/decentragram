import * as PushAPI from "@pushprotocol/restapi";
import { createSocketConnection, EVENTS } from "@pushprotocol/socket";
import { NotificationItem, Chat } from "@pushprotocol/uiweb";
import { GraphQLClient, gql } from "graphql-request";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Tabs,
  notification,
  Avatar,
  Button,
  Layout,
  Menu,
  Card,
  Drawer,
  Col,
  Row,
  Input,
  Upload,
  Space,
  message
} from "antd";
import { useEffect, useState } from "react";
import { providers, Contract } from "ethers";
import {
  BellOutlined,
  BarsOutlined,
  RetweetOutlined,
  LikeOutlined,
  MessageOutlined,
  PictureOutlined
} from "@ant-design/icons";
import "antd/dist/antd.css";
import "./styles.css";

const { Header, Footer, Sider, Content } = Layout;
dayjs.extend(relativeTime);

const DECENTRAGRAM_CHANNEL_ADDRESS =
  "0xc2009D705d37A9341d6cD21439CF6B4780eaF2d7"; // Decentragram channel address

const client = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/salmandabbakuti/decentragram",
  { headers: {} }
);

const abi = [
  "function createPost(string _content, string _imageHash)",
  "function tip(uint256 _postId, uint256 _amount) payable",
  "function posts(uint256) view returns (uint256 id, string content, string imageHash, uint256 earnings, address author)"
];
const contractAddress = "0x3401aE59dA159928F504DEC7F12745Da078D9890";

const uploadImageToIpfs = async (image) => {
  const data = new FormData();
  data.append("file", image);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      // 'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
      pinata_secret_api_key: process.env.REACT_APP_PINATAe_SECRET_API_KEY
    },
    body: data
  });
  // check if response is ok
  if (!res.ok) throw new Error("Failed to upload image");
  const { IpfsHash } = await res.json();
  return IpfsHash;
};

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [sdkSocket, setSdkSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [postInput, setPostInput] = useState({ content: "", image: null });

  // const timestamp = 1674723570;
  // const date = new Date(timestamp * 1000);
  // console.log(date.toString());
  // console.log(dayjs(date).fromNow());

  // const timestamp = 1674723570;
  // const relativeTime = dayjs().to(dayjs.unix(timestamp));
  // console.log(relativeTime);

  const handleConnectWallet = async () => {
    if (window?.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Using account: ", accounts[0]);
      const provider = new providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const { chainId } = await provider.getNetwork();
      if (chainId !== 5) {
        message.info("Switching to goerli testnet");
        // switch to the goerli testnet
        await window.ethereum
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5" }]
          });
      }
      console.log("chainId:", chainId);
      setProvider(provider);
      setChainId(chainId);
      setAccount(accounts[0]);
      const contract = new Contract(contractAddress, abi, signer);
      setContract(contract);
    } else {
      console.warn("Please use web3 enabled browser");
      message.warn("Please install Metamask or any other web3 enabled browser");
    }
  };

  useEffect(() => {
    if (account && chainId) {
      const sdkSocket = createSocketConnection({
        user: `eip155:${chainId}:${account}`, // user address in CAIP
        env: "staging",
        socketOptions: { autoConnect: true }
      });
      setSdkSocket(sdkSocket);
      addSocketEvents(sdkSocket);
      getNotifications();
      getPosts();
      return () => {
        if (sdkSocket) {
          removeSocketEvents(sdkSocket);
          sdkSocket.disconnect();
        }
      };
    }
  }, [account, chainId]);

  useEffect(() => {
    if (provider) {
      console.log("window.ethereum", window.ethereum);
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", (chainId) => setChainId(parseInt(chainId)));
      window.ethereum.on("connect", (info) =>
        console.log("connected to network", info)
      );
    }
    return () => {
      if (provider) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [provider]);

  const addSocketEvents = (sdkSocket) => {
    sdkSocket?.on(EVENTS.CONNECT, () => {
      console.log("Connected to Push Protocol");
      setIsSocketConnected(true);
    });

    sdkSocket?.on(EVENTS.DISCONNECT, () => {
      console.log("Disconnected from Push Protocol");
      setIsSocketConnected(false);
    });

    sdkSocket?.on(EVENTS.USER_FEEDS, (feedItem, b, c) => {
      console.log("Received new notification:", feedItem, b, c);
      notification.info({
        message: feedItem?.payload?.notification?.title,
        description: feedItem?.payload?.notification?.body,
        duration: 6,
        icon: (
          <Avatar
            shape="circle"
            size="large"
            alt="notification icon"
            src={feedItem?.payload?.data?.icon}
          />
        )
      });
      const {
        payload: { data },
        source
      } = feedItem;
      const newNotification = {
        cta: data.acta,
        app: data.app,
        icon: data.icon,
        title: data.asub,
        message: data.amsg,
        image: data.aimg,
        url: data.url,
        blockchain: source
      };
      console.log("New notification", newNotification);
      setNotifications((prev) => [feedItem, ...prev]);
    });
  };

  const removeSocketEvents = (sdkSocket) => {
    sdkSocket?.off(EVENTS.CONNECT);
    sdkSocket?.off(EVENTS.DISCONNECT);
    sdkSocket?.off(EVENTS.USER_FEEDS);
  };

  const toggleConnection = () => {
    if (isSocketConnected) {
      console.log("Disconnecting from Push Protocol");
      sdkSocket.disconnect();
      window.location.reload();
    } else {
      console.log("Connecting to Push Protocol");
      sdkSocket.connect();
    }
  };

  const getNotifications = () => {
    PushAPI.user
      .getFeeds({
        user: `eip155:${chainId}:${account}`, // user address in CAIP
        env: "staging",
        page: 1,
        limit: 10,
        raw: true
      })
      .then((feeds) => {
        console.log("user notifications: ", feeds);
        setNotifications(feeds);
      })
      .catch((err) => {
        console.error("failed to get user notifications: ", err);
      });
  };

  const optInToChannel = async () => {
    await PushAPI.channels.subscribe({
      env: "staging",
      signer: provider.getSigner(),
      channelAddress: `eip155:${chainId}:${DECENTRAGRAM_CHANNEL_ADDRESS}`, // channel address in CAIP
      userAddress: `eip155:${chainId}:${account}`, // user address in CAIP
      onSuccess: () => {
        console.log("opt-in success");
        message.success("Opted-in to channel to receive notifications");
      },
      onError: (err) => {
        console.error("opt-in error", err);
        message.error("Failed to opt-in to channel");
      }
    });
  };

  const POSTS_QUERY = gql`
    query getPosts(
      $skip: Int
      $first: Int
      $orderBy: Post_orderBy
      $orderDirection: OrderDirection
      $where: Post_filter
    ) {
      posts(
        skip: $skip
        first: $first
        orderBy: $orderBy
        orderDirection: $orderDirection
        where: $where
      ) {
        id
        content
        imageHash
        earnings
        author
        createdAt
        tips {
          id
          amount
          sender
          createdAt
        }
      }
    }
  `;

  const getPosts = () => {
    setLoading(true);
    client
      .request(POSTS_QUERY, {
        skip: 0,
        first: 100,
        orderBy: "createdAt",
        orderDirection: "desc",
        where: {}
      })
      .then((data) => {
        console.log("posts: ", data.posts);
        setPosts(data.posts);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        message.error("Something went wrong!");
        console.error("failed to get posts: ", err);
      });
  };

  const createPost = async () => {
    if (!account || chainId !== 5) return message.error("Connect to goerli testnet");
    if (!postInput?.content) return message.error("Content cannot be empty");
    setLoading(true);
    const { content, image } = postInput;
    try {
      const imageHash = image ? await uploadImageToIpfs(image) : "";
      console.log("imageHash: ", imageHash);
      const tx = await contract.createPost(content, imageHash);
      console.log("tx: ", tx);
      await tx.wait();
      console.log("tx mined");
      setLoading(false);
      setPostInput({});
      message.success("Post created successfully");
    } catch (err) {
      setLoading(false);
      message.error("Failed to create post");
      console.error("failed to create post: ", err);
    }
  };

  const Inbox = () => {
    return (
      <div>
        <h3>Inbox</h3>
        {notifications.map((oneNotification, id) => {
          const {
            payload: { data },
            source
          } = oneNotification;
          const { app, icon, acta, asub, amsg, aimg, url } = data;
          return (
            <NotificationItem
              key={id} // any unique id
              notificationTitle={asub}
              notificationBody={amsg}
              cta={acta}
              app={app}
              icon={icon}
              image={aimg}
              url={url}
              chainName={source}
              isSpam={false}
            />
          );
        })}
      </div>
    );
  };

  const DecentragramNotifications = () => {
    return (
      <div>
        <h3>Decentragram</h3>
        {notifications
          .filter(({ sender }) => sender === DECENTRAGRAM_CHANNEL_ADDRESS)
          .map((oneNotification, id) => {
            const {
              payload: { data },
              source
            } = oneNotification;
            const { app, icon, acta, asub, amsg, aimg, url } = data;
            return (
              <NotificationItem
                key={id} // any unique id
                notificationTitle={asub}
                notificationBody={amsg}
                cta={acta}
                app={app}
                icon={icon}
                image={aimg}
                url={url}
                chainName={source}
                isSpam={false}
              />
            );
          })}
      </div>
    );
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider theme="dark" breakpoint="lg" collapsedWidth="0">
          {account && (
            <Card type="inner" size="small">
              <Card.Meta
                title="Connected"
                description={`${account.slice(0, 8)}...${account.slice(-8)}`}
                avatar={
                  <Avatar
                    shape="circle"
                    size="large"
                    alt="Profile"
                    src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${account}`}
                  />
                }
              />
            </Card>
          )}
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["notifications"]}
            items={[
              {
                key: "explore",
                icon: <BarsOutlined />,
                label: "Explore"
              },
              {
                key: "notifications",
                icon: <BellOutlined />,
                label: "Notifications",
                onClick: () => setDrawerVisible(!drawerVisible)
              }
            ]}
          />
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }}>
            <h1 style={{ textAlign: "center", color: "white" }}>
              Decentragram
              <BellOutlined
                style={{
                  float: "right",
                  marginTop: "19px",
                  marginRight: "12px",
                  fontSize: "23px",
                  color: "white"
                }}
                onClick={() => setDrawerVisible(!drawerVisible)}
              />
            </h1>
            {/* add notification bell icon here */}
          </Header>
          <Content
            className="site-layout-background"
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280
            }}
          >
            {provider ? (
              <div>
                <div>
                  <Card className="new-post-card-container">
                    <Input.TextArea
                      placeholder="What's happening?"
                      value={postInput?.content || ""}
                      onChange={(e) =>
                        setPostInput({ ...postInput, content: e.target.value })
                      }
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      style={{
                        borderRadius: 10,
                        marginBottom: 10,
                        width: "100"
                      }}
                    />
                    <Upload
                      name="file"
                      type="select"
                      accept="image/*"
                      showUploadList
                      listType="picture"
                      previewFile={postInput?.image}
                      onRemove={() =>
                        setPostInput({ ...postInput, image: null })
                      }
                      progress="percent"
                      fileList={postInput?.image ? [postInput.image] : []}
                      customRequest={({ file }) =>
                        setPostInput({ ...postInput, image: file })
                      }
                      multiple={false}
                    >
                      <Button icon={<PictureOutlined />} />
                    </Upload>
                    <Button
                      type="primary"
                      style={{ marginTop: 10 }}
                      onClick={createPost}
                    >
                      Post
                    </Button>
                  </Card>
                  <h1>Explore</h1>
                  <Row gutter={[16, 18]}>
                    {posts.map((post, index) => {
                      const {
                        id,
                        content,
                        imageHash,
                        author,
                        createdAt
                      } = post;
                      const createdAtTime = dayjs().to(dayjs.unix(createdAt));
                      return (
                        <Col key={id} xs={24} sm={12} md={8} lg={6}>
                          <Card style={{ width: 300 }} loading={loading}>
                            <Card.Meta
                              avatar={
                                <Avatar
                                  size="large"
                                  src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${author}`}
                                />
                              }
                              title={`${author?.slice(0, 10)}...${author?.slice(
                                -6
                              )}`}
                              description={createdAtTime}
                            />
                          </Card>
                          <Card
                            hoverable
                            loading={loading}
                            type="inner"
                            style={{ width: 300 }}
                            actions={[
                              <LikeOutlined key="like" />,
                              <MessageOutlined key="comment" />,
                              <RetweetOutlined key="retweet" />
                            ]}
                          >
                            <Card.Meta description={content} />
                            {imageHash && (
                              <img
                                width={260}
                                style={{ marginTop: 10, borderRadius: 10 }}
                                alt="post-media"
                                src={`https://ipfs.io/ipfs/${imageHash}`}
                              />
                            )}
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
                <Drawer
                  title="Push Notifications"
                  placement="right"
                  // width={500}
                  closable={true}
                  onClose={() => setDrawerVisible(false)}
                  open={drawerVisible}
                >
                  <h3>Push Socket</h3>
                  <div>
                    <p>
                      Connection Status :{" "}
                      {isSocketConnected ? "Connected" : "Disconnected"}
                    </p>
                    <Space>
                      <Button type="primary" onClick={toggleConnection}>
                        {isSocketConnected ? "Disconnect" : "Connect"}
                      </Button>
                      <Button type="primary" onClick={optInToChannel}>
                        Opt-in
                      </Button>
                    </Space>
                  </div>
                  <Tabs
                    animated
                    // onChange={getNotifications}
                    items={[
                      {
                        label: "Decentragram",
                        key: "item-2",
                        children: <DecentragramNotifications />
                      },
                      {
                        label: "Inbox",
                        key: "item-1",
                        children: <Inbox />
                      }
                    ]}
                  />
                </Drawer>
              </div>
            ) : (
              <Button style={{ marginLeft: "30%" }} type="primary" onClick={handleConnectWallet}>
                Connect Wallet
              </Button>
            )}
          </Content>
          <Footer style={{ textAlign: "center" }}>
            {account && (
              <Chat
                account={account} //user address
                supportAddress="0xc2009D705d37A9341d6cD21439CF6B4780eaF2d7" //support address
                apiKey={process.env.REACT_APP_PUSH_CHAT_API_KEY}
                env="staging"
              />
            )}
            <a
              href="https://github.com/Salmandabbakuti"
              target="_blank"
              rel="noopener noreferrer"
            >
              © 2022 Salman Dabbakuti. Powered by Push Protocol
            </a>
          </Footer>
        </Layout>
      </Layout>
    </>
  );
}
