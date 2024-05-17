import { deploymentsTable, deploymentshistoryTable } from "@/db/db.config"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"
import moment, { duration } from "moment"
import { useLiveQuery } from "dexie-react-hooks"

export default function ConsolidatedTable() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [tableTimeSelection, setTableTimeSelection] = useAtom(networkStore.billingTableTimeSelection)
    const [usdPrice, setUSDPrice] = useAtom(networkStore.usdPrice)

    let totalDeployment = 0
    let totalDuration = 0
    let totalDeploymentCost = 0

    let distinctMonth = [], deploymentHistory = [], deployments = [], tableData = [], keys = []
    let selectedStartMonth = moment(tableTimeSelection)
    let thisMonth = moment().startOf('month')
    // console.log(selectedNetwork.id,owner,selectedDeployment,tableTimeSelection)
    if (selectedNetwork.id !== '' && owner !== '' && tableTimeSelection) {

        deployments = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id }).toArray())
        deploymentHistory = useLiveQuery(() => deploymentshistoryTable.where({ "owner": owner, "network": selectedNetwork.id }).and(element => { return moment(element.start_date) >= moment(tableTimeSelection) }).toArray())

        // console.log(deployments)
        // console.log(deploymentHistory)
        while (selectedStartMonth.isBefore(thisMonth.add(1, 'day'))) {
            distinctMonth.push(moment(selectedStartMonth).startOf('month').format('YYYY-MM-DD'));
            selectedStartMonth.add(1, 'month').startOf('month')
        }

        if (deployments?.length > 0 && distinctMonth.length > 0 && deploymentHistory?.length > 0) {

            totalDeployment = deployments.length

            for (var i = 0; i < deployments.length; i++) {
                let deployment = deployments[i]
                let totalCost = 0
                let duration = 0

                for (var j = 0; j < distinctMonth.length; j++) {
                    let filteredHistory = deploymentHistory.filter(element => { return (element.start_date === distinctMonth[j] && element.dseq === deployment.dseq) })
                    if (filteredHistory.length > 0) {
                        if (deployment.state === "active") {
                            let start_date = moment(deployment.created_at)
                            let end_date = moment().utc()
                            duration = start_date.isBefore(moment(distinctMonth[j])) ? end_date.diff(moment(distinctMonth[j]), "minute") : end_date.diff(moment(start_date), 'minute')
                            totalCost += (duration * deployment.rate * parseFloat(deployment.monthlyCostUDenom)) || 0
                            //duration += start_date.isBefore(moment(distinctMonth[j])) ? end_date.diff(moment(distinctMonth[j]), "minute") : end_date.diff(moment(start_date), 'minute')
                        } else {
                            totalCost += parseFloat(deployment.withdrawn) || 0
                            duration += moment(deployment.closed_at).diff(moment(deployment.created_at), 'minute')
                        }
                    }

                    //parseFloat((totalCost/1000000) * usdPrice).toFixed(3)
                }
                if (duration > 0) {
                    totalDuration += duration
                    //console.log('totalCost',totalCost)
                    totalDeploymentCost += totalCost
                }

            }
        }
    }
    return (
        <tbody>
            <tr>
                <td> Deployment</td>
                <td> {totalDeployment}</td>
            </tr>
            <tr>
                <td>Monthly Usage</td>
                <td> { parseFloat(totalDuration/60).toFixed(2)} Hr</td>
            </tr>
            <tr>
                <td>Monthly Cost</td>
                <td> {parseFloat((totalDeploymentCost/1000000) * usdPrice).toFixed(3)} $</td>
            </tr>
        </tbody>
    )
}