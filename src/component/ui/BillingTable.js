import { deploymentsTable, deploymentshistoryTable } from "@/db/db.config"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"
import moment, { duration } from "moment"
import { useLiveQuery } from "dexie-react-hooks"

export default function CostAnalysisChart() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [tableTimeSelection, setTableTimeSelection] = useAtom(networkStore.billingTableTimeSelection)
    const [usdPrice, setUSDPrice] = useAtom(networkStore.usdPrice)

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

        if (deploymentHistory?.length > 0 && distinctMonth.length > 0) {

            for (var i = 0; i < deployments.length; i++) {
                let deployment = deployments[i]
                let rawData = {}
                let totalCost = 0
                let duration = 0

                for (var j = 0; j < distinctMonth.length; j++) {
                    let filteredHistory = deploymentHistory.filter(element => { return (element.start_date === distinctMonth[j] && element.dseq === deployment.dseq) })
                    if (filteredHistory.length > 0) {
                        if (deployment.state === "active") {
                            let start_date = moment(deployment.created_at)
                            let end_date = moment().utc()
                            duration = start_date.isBefore(moment(distinctMonth[j])) ? end_date.diff(moment(distinctMonth[j]), "minute") : end_date.diff(moment(start_date), 'minute')
                            totalCost += duration * deployment.rate * parseFloat(deployment.monthlyCostUDenom)
                            //duration += start_date.isBefore(moment(distinctMonth[j])) ? end_date.diff(moment(distinctMonth[j]), "minute") : end_date.diff(moment(start_date), 'minute')
                        } else {
                            totalCost += deployment.withdrawn
                            duration += moment(deployment.closed_at).diff(moment(deployment.created_at), 'minute')
                        }
                    }

                    //parseFloat((totalCost/1000000) * usdPrice).toFixed(3)
                }
                if (duration > 0) {
                    rawData["name"] = 'id-' + deployment.dseq
                    rawData["monthlyCost"] = parseFloat((parseFloat(deployment.totalMonthlyCostUDenom) / 1000000) * usdPrice).toFixed(2) + ' $'
                    rawData["status"] = deployment.state
                    rawData["totalDuration"] = parseFloat(duration / 60).toFixed(2)
                    rawData["totalCost"] = parseFloat((totalCost / 1000000) * usdPrice).toFixed(3)
                    // console.log(rawData)
                    tableData.push(rawData)
                }

            }
        }
    }
    return (
        tableData.map((i, index) => {
            return (
                <tr key={index}>
                    <td> {i["name"]}</td>
                    <td> {i["monthlyCost"]}</td>
                    <td>{i["totalDuration"]} Hr</td>
                    <td>{i["status"]}</td>
                    <td>{i["totalCost"]} $</td>
                </tr>
            )
        })
    )
}