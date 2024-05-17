import Dexie from "dexie";

const database = new Dexie("cloudCostDB");

database.version(1).stores({
  deployments: '++id, [owner+network+dseq],state,monthlyCostUDenom,created_at,closed_at',//balance,withdrawn
  deploymentshistory:'++id,[owner+network+start_date+dseq],[owner+network+dseq]',//total_minutes,total_cost,name,cpu,memory,storage,gpu
  costbreakdown:'++id,[owner+network+dseq]'//create_deployment,create_bid,create_lease,close_bid,close_deployment
});

export const deploymentsTable = database.table('deployments');
export const deploymentshistoryTable = database.table('deploymentshistory');
export const  costbreakdownTable = database.table('costbreakdown');

export default database;