import { costbreakdownTable } from "@/db/db.config"
import { useLiveQuery } from "dexie-react-hooks"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"

export default function CostBreakDownList() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [selectedDeployment, setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
    const [usdPrice,setUSDPrice] = useAtom(networkStore.usdPrice)
    let costBreakDownList = []
    //console.log(selectedNetwork,owner)
    if (selectedNetwork.id !== '' && owner !== '' && selectedDeployment) {
        if (selectedDeployment === 'All') {
            let create_deployment_total = 0
            let create_bid_total = 0
            let create_lease_total = 0
            let close_bid_total = 0
            let close_deployment_total = 0
            let costBreakDown = useLiveQuery(() => costbreakdownTable.where({ "owner": owner, "network": selectedNetwork.id }).toArray(),[selectedDeployment])
            // console.log(costBreakDown)
            for(var i=0 ; i < costBreakDown?.length ; i++) {
                create_deployment_total += costBreakDown[i]["Create Deployment"]
                create_bid_total += costBreakDown[i]["Create Bid"]
                create_lease_total += costBreakDown[i]["Create Lease"]
                close_bid_total += costBreakDown[i]["Close Bid"]
                close_deployment_total += costBreakDown[i]["Close Deployment"]
            }
            costBreakDownList.push({
                "Create Deployment": create_deployment_total,
                "Create Bid": create_bid_total,
                "Create Lease": create_lease_total,
                "Close Deployment": close_deployment_total,
                "Close Bid": close_bid_total
            })
        } else {
            costBreakDownList = useLiveQuery(() => costbreakdownTable.where({ "owner": owner, "network": selectedNetwork.id, "dseq": selectedDeployment }).toArray(),[selectedDeployment])
        }

    }

    return (
        costBreakDownList?.map((element, index) => {
            return (
                <div className="card-body" key={index}>
                    <div className="row g-0 mt-3 align-items-center">
                        <div className="col-md-1">
                            <i className="bi bi-plus-circle-fill c-icon fs-2"></i>
                        </div>
                        <div className="col-md-10 ms-1">
                            <div className="card-title-cb ms-3">Create Deployment</div>
                            <div className="card-text-cb ms-3">Fee: {element["Create Deployment"]/1000000} AKT | { parseFloat((element["Create Deployment"]/1000000) * usdPrice).toFixed(3)} $</div>
                        </div>
                    </div>
                    <hr />
                    <div className="row g-0 mt-3 align-items-center">
                        <div className="col-md-1">
                            <i className="bi bi-pencil-fill c-icon fs-2"></i>
                        </div>
                        <div className="col-md-10  ms-1">
                            <div className="card-title-cb ms-3">Create Bid</div>
                            <div className="card-text-cb ms-3">Fee: {element["Create Bid"]/1000000} AKT | {parseFloat((element["Create Bid"]/1000000) * usdPrice).toFixed(4)} $</div>
                        </div>
                    </div>
                    <hr />
                    <div className="row g-0 mt-3 align-items-center">
                        <div className="col-md-1">
                            <i className="bi bi-cloud-check-fill c-icon fs-2"></i>
                        </div>
                        <div className="col-md-10  ms-1">
                            <div className="card-title-cb ms-3">Create Lease</div>
                            <div className="card-text-cb ms-3">Fee: {element["Create Lease"]/1000000} AKT | {parseFloat((element["Create Lease"]/1000000) * usdPrice).toFixed(4)} $</div>
                        </div>
                    </div>
                    <hr />
                    <div className="row g-0 mt-3 align-items-center">
                        <div className="col-md-1">
                            <i className="bi bi-x-circle-fill c-icon fs-2"></i>
                        </div>
                        <div className="col-md-10  ms-1">
                            <div className="card-title-cb ms-3">Close Bid</div>
                            <div className="card-text-cb ms-3">Fee: {element["Close Bid"]/1000000} AKT | {parseFloat((element["Close Bid"]/1000000) * usdPrice).toFixed(4)} $</div>
                        </div>
                    </div>
                    <hr />
                    <div className="row g-0 mt-3 align-items-center">
                        <div className="col-md-1">
                            <i className="bi bi-bag-x-fill c-icon fs-2"></i>
                        </div>
                        <div className="col-md-10  ms-1">
                            <div className="card-title-cb ms-3">Close Deployment</div>
                            <div className="card-text-cb ms-3">Fee: {element["Close Deployment"]/1000000} AKT | {parseFloat((element["Close Deployment"]/1000000) * usdPrice).toFixed(4)} $</div>
                        </div>
                    </div>
                </div>
            )
        })
    )
}