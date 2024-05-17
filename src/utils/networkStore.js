import { mainnetId, sandboxId} from "./constant";
import { atom } from "jotai";
import moment from "moment";

export let networks = [
  {
    id: mainnetId,
    title: "Mainnet",
    description: "Akash Network mainnet network.",
    nodesUrl: 'https://api.cloudmos.io/v1/nodes/mainnet',
    chainId: "akashnet-2",
    chainRegistryName: "akash",
    versionUrl: '',
    rpcEndpoint: "https://rpc.cosmos.directory/akash",
    enabled: true,
    basicAPIUrl:'https://api.akashnet.net/',
    cloudmosAPIUrl:'https://api.cloudmos.io/',
    version: null // Set asynchronously
  },
  {
    id: sandboxId,
    title: "Sandbox",
    description: "Sandbox of the mainnet version.",
    nodesUrl: 'https://api-sandbox.cloudmos.io/v1/nodes/sandbox',
    chainId: "sandbox-01",
    chainRegistryName: "akash-sandbox",
    versionUrl: '',
    rpcEndpoint: "https://rpc.sandbox-01.aksh.pw:443",
    version: null, // Set asynchronously
    enabled: true,
    cloudmosAPIUrl:'https://api-sandbox.cloudmos.io/',
    basicAPIUrl:'https://api.sandbox-01.aksh.pw/'
  }
];

const selectedNetwork = atom(networks[0]);
const selectedAddress = atom('');
const selectedDeployment = atom('All')
const usdPrice = atom('1')
const costAnalysisSelection = atom(moment().startOf('year').format('YYYY-MM-DD'))
const resourceAnalysisSelection = atom('cpu')
const resourceTimeSelection = atom(moment().startOf('year').format('YYYY-MM-DD'))
const billingTableTimeSelection = atom(moment().startOf('year').format('YYYY-MM-DD'))
const billingChartTimeSelection = atom(moment().startOf('year').format('YYYY-MM-DD'))
const count = atom(1)

export default {
  selectedNetwork,
  selectedAddress,
  selectedDeployment,
  usdPrice,
  costAnalysisSelection,
  resourceAnalysisSelection,
  resourceTimeSelection,
  billingTableTimeSelection,
  billingChartTimeSelection,
  count
};