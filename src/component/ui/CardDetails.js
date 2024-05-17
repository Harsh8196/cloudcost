import { deploymentsTable, deploymentshistoryTable } from "@/db/db.config"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"
import moment from "moment"
import { useLiveQuery } from "dexie-react-hooks"

export default function CardDetails() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [selectedDeployment, setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
    const [usdPrice, setUSDPrice] = useAtom(networkStore.usdPrice)

    let deployments = [], deploymentHistory = []
    let totalTodayPrice = 0
    let totalMonthToDatePrice = 0
    let totalBillingPrice = 0
    let startOfMonth = moment().startOf('month')

    //console.log(selectedNetwork,owner)
    if (selectedNetwork.id !== '' && owner !== '' && selectedDeployment) {
        if (selectedDeployment === 'All') {
            deployments = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id }).toArray())
            deploymentHistory = useLiveQuery(() => deploymentshistoryTable.where({ "owner": owner, "network": selectedNetwork.id, "start_date": startOfMonth.format('YYYY-MM-DD') }).toArray())
        } else {
            deployments = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id, "dseq": selectedDeployment }).toArray())
            deploymentHistory = useLiveQuery(() => deploymentshistoryTable.where({ "owner": owner, "network": selectedNetwork.id, "start_date": startOfMonth.format('YYYY-MM-DD'), "dseq": selectedDeployment }).toArray())
        }
        // console.log(deployments)
        // console.log(deploymentHistory)

        for (var i = 0; i < deployments?.length; i++) {
            let deployment = deployments[i]
            let created_at = moment(deployment.created_at)
            let closed_at = moment(deployment.closed_at || moment().utc())
            let rate = deployment.rate
            let monthlyCostUDenom = deployment.monthlyCostUDenom
            // console.log(closed_at)
            if (deployment.state === "active") {
                let startOfDay = moment().startOf('day')
                let durationForToday = created_at.isBefore(startOfDay) ? closed_at.diff(startOfDay, "minute") : closed_at.diff(created_at, "minute")
                let durationForMonth = created_at.isBefore(startOfMonth) ? closed_at.diff(startOfMonth, "minute") : closed_at.diff(created_at, "minute")
                let priceForToday = durationForToday * parseFloat(monthlyCostUDenom) * rate
                let priceForMonth = durationForMonth * parseFloat(monthlyCostUDenom) * rate
                let durationTotal = closed_at.diff(created_at, "minute")
                let totalCost = durationTotal * parseFloat(monthlyCostUDenom) * rate
                totalTodayPrice += priceForToday
                totalMonthToDatePrice += priceForMonth
                totalBillingPrice += totalCost
            } else {
                if(deploymentHistory?.length > 0) {
                    const historyDetails = deploymentHistory.filter(i => {
                        return i.dseq === deployment.dseq
                    })
                    // console.log(historyDetails)
                    totalMonthToDatePrice += (historyDetails[0]?.total_cost || 0)
                }
                totalBillingPrice += (parseFloat(deployment.withdrawn) || 0)
                
            }
            // console.log("dseq" + deployment.dseq,totalTodayPrice,totalMonthToDatePrice,totalBillingPrice)
        }

    }
    return (
        <div className="row justify-content-between">
              <div className="mb-3 mb-sm-0 card-home">
                <div className="card shadow rounded-4 border-white">
                  <div className="card-body">
                    <span className="card-title-cc">Today</span>
                    <p className="card-text-cc mt-1">{ totalTodayPrice === 0 ? '0':parseFloat((totalTodayPrice/1000000) * usdPrice).toFixed(3)} $</p>
                  </div>
                </div>
              </div>
              <div className="mb-3 mb-sm-0 card-home">
                <div className="card shadow rounded-4 border-white">
                  <div className="card-body">
                    <span className="card-title-cc">Month To Date</span>
                    <p className="card-text-cc mt-1">{  totalMonthToDatePrice === 0 ? '0': parseFloat((totalMonthToDatePrice/1000000) * usdPrice).toFixed(3)} $</p>
                  </div>
                </div>
              </div>
              <div className="mb-3 mb-sm-0 card-home">
                <div className="card shadow rounded-4 border-white">
                  <div className="card-body">
                    <span className="card-title-cc">Total Billing</span>
                    <p className="card-text-cc mt-1">{  totalBillingPrice === 0 ? '0': parseFloat((totalBillingPrice/1000000) * usdPrice).toFixed(3)} $</p>
                  </div>
                </div>
              </div>
            </div>
    )
}