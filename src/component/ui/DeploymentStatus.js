import { deploymentsTable } from "@/db/db.config"
import { useLiveQuery } from "dexie-react-hooks"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"
import { useState } from "react"

export default function DeploymentStatus() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [selectedDeployment, setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
    // const [status,setStatus] = useState('')

    let deploymentList = []
    //console.log(selectedNetwork,owner)
    if (selectedNetwork.id !== '' && owner !== '' && selectedDeployment) {
        if (selectedDeployment !== 'All') {
            deploymentList = useLiveQuery(() => deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id, "dseq": selectedDeployment }).toArray(), [])
            // if(deploymentList?.length > 0) {
            //     setStatus(deploymentList[0].state === "closed"? "Closed":"Active" )
            // } 
        }
    }

    return (
        deploymentList?.map((element, index) => {
            return (
                <>
                    <label htmlFor="deploymentStatus" className="col-sm-2 col-form-label">Deployment Status</label>
                    <div className="col-sm-2">

                        <span className="fw-bold">{element.state ==="closed" ? "Closed":"Active"}</span>
                    </div>
                </>
            )
        })
    )
}