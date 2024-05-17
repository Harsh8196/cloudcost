import { deploymentsTable, deploymentshistoryTable } from "@/db/db.config"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"
import moment from "moment"
import { useLiveQuery } from "dexie-react-hooks"
import { ResponsivePie } from '@nivo/pie'

export default function ResourceAnalysisChart() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [selectedDeployment, setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
    const [usdPrice, setUSDPrice] = useAtom(networkStore.usdPrice)

    let deployments = [] ,chartData = []
    let hidden = true

    // console.log(selectedNetwork.id,owner,selectedDeployment,resourceTimeSelection)
    if (selectedNetwork.id !== '' && owner !== '' && selectedDeployment) {
        if (selectedDeployment === 'All') {
            deployments = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id}).toArray())
        } else {
            deployments = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id,"dseq": selectedDeployment }).toArray())
        }
        if(deployments?.length > 0 ){
            for(var i=0; i<deployments.length; i++){
                let rawData = {}
                
                if(deployments[i].state === "active" && selectedDeployment !== 'All') {
                    let start_date = moment(deployments[i].created_at)
                    let end_date = moment().utc()
                    let duration = end_date.diff(start_date,'minute') 
                    let total_cost = duration * deployments[i].rate * parseFloat(deployments[i].monthlyCostUDenom)
                    chartData.push({
                        "id":'balance',
                        "lable":'balance',
                        "value":parseFloat(((deployments[i].balance - total_cost)/1000000) * usdPrice).toFixed(3)
                    })
                    chartData.push({
                        "id":'spent',
                        "lable":'spent',
                        "value":parseFloat(((total_cost)/1000000) * usdPrice).toFixed(3)
                    })
                    hidden = true
                } else if(deployments[i].state === "closed" && selectedDeployment !== 'All') {
                    hidden = false
                }
                else {
                    rawData["id"] = deployments[i].dseq
                    rawData["lable"] = deployments[i].dseq
                    rawData["value"] = parseFloat(((deployments[i].balance)/1000000) * usdPrice).toFixed(3)
                    hidden = true
                }
                
                chartData.push(rawData)
            } 
        }
    }
    return (
        <div>
            <div hidden={!hidden} style={{ "height": "360px" }}>
        <ResponsivePie
        data={chartData}
        margin={{ top: 0, right: 70, bottom: 0, left: 70 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: 'nivo' }}
        borderWidth={1}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.2
                ]
            ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    2
                ]
            ]
        }}
    />
    </div>
    <div hidden={hidden}>
        <div className="d-flex justify-content-center align-items-center" style={{ "height": "360px" }}>
        <span>Deployment is closed</span>
        </div>
        
    </div>
    </div>
    )
}