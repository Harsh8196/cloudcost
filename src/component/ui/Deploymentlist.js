import { deploymentsTable } from "@/db/db.config"
import { useLiveQuery } from "dexie-react-hooks"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"

export default function Deploymentlist(){
    const [selectedNetwork,setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner,setOwner] = useAtom(networkStore.selectedAddress)
    const [selectedDeployment,setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
    let deployments = []
    //console.log(selectedNetwork,owner)
    if(selectedNetwork.id !== '' && owner !== ''){
        deployments = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id }).toArray())
        //console.log(deployments)
    }
    
    return(
        deployments?.map((element,index) => {
            return (
                <option key={index} value={element.dseq} selected={selectedDeployment === element.dseq?1:0}>dseq-{element.dseq}</option>
            )
        })
    )
}