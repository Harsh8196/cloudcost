import { deploymentsTable, costbreakdownTable, deploymentshistoryTable } from './db.config'
import {networks} from '@/utils/networkStore'
import moment from 'moment'

export const deploymentList = async () => {

    const selectedNetwork = networks.find((network) => network.id === window.localStorage.getItem('selectedNetworkId'))
    const owner = window.localStorage.getItem('accountAddress')
    const basicAPIUrl = selectedNetwork.basicAPIUrl;
    const cloudmosAPIUrl = selectedNetwork.cloudmosAPIUrl;
    let deploymentList = []
    let costBreakDownList = []
    let deploymentHistoryList = []

    if (selectedNetwork !== '' && owner !== '') {

        const leaseList = await fetch(basicAPIUrl + 'akash/market/v1beta4/leases/list?filters.owner=' + owner)
        const result = await leaseList.json()

        const listOfDseq = []
        const listOfDeseqFromDB = []

        for (var i = 0; i < result.leases.length; i++) {
            listOfDseq.push(result.leases[i].lease.lease_id.dseq)
        }

        // console.log(listOfDseq)

        const listOfDeseqFromDBResult = await deploymentsTable.where({ "owner": owner, "network": selectedNetwork.id }).toArray()

        for (var i = 0; i < listOfDeseqFromDBResult.length; i++) {
            listOfDeseqFromDB.push(listOfDeseqFromDBResult[i].dseq)
        }
        // console.log(listOfDeseqFromDB)

        const diffDseqList = listOfDseq.filter(x => !listOfDeseqFromDB.includes(x))

        // console.log(diffDseqList)

        const listOfDeployment = result.leases.filter(element => {
            return diffDseqList.includes(element.lease.lease_id.dseq)
        })
        // console.log(listOfDeployment)

        if (listOfDeployment.length > 0) {
            for (var i = 0; i < listOfDeployment.length; i++) {
                let element = listOfDeployment[i]
                //    }
                //    result.leases.forEach(async element => {
                const response = await fetch('api/deployment',
                    {
                        method: 'POST',
                        body: JSON.stringify({ "cloudmosAPIUrl": cloudmosAPIUrl, "owner": owner, "dseq": element.lease.lease_id.dseq })
                    }
                )
                const d_result = await response.json()
                // console.log(d_result)
                //'++id, [owner+network], dseq,state,monthlyCostUDenom,created_at,closed_at'//balance,withdrawn
                let createdHeight,closedHeight

                let start_date = moment(d_result.deployment.leases[0].createdDate)
                createdHeight = d_result.deployment.leases[0].createdHeight
                let end_date
                if (!d_result.deployment.leases[0].closedDate) {
                    end_date = moment().utc()
                    const latestBlockResponse = await fetch(basicAPIUrl + 'blocks/latest')
                    const latestBlock = await latestBlockResponse.json()
                    closedHeight = latestBlock.block.header.height
                } else {
                    end_date = moment(d_result.deployment.leases[0].closedDate)
                    closedHeight = d_result.deployment.leases[0].closedHeight
                }

                let diffHeight = closedHeight - createdHeight
                let totalMinutes = end_date.diff(start_date,'minute')
                let rate = diffHeight / totalMinutes

                while (start_date.isBefore(end_date)) {
                    let startOfMonth = moment(start_date).startOf("month")
                    let endOfMonth = moment(start_date).endOf("month")
                    let actStartDate, actEndDate

                    if (start_date > startOfMonth && start_date < endOfMonth) {
                        actStartDate = start_date
                    } else {
                        actStartDate = startOfMonth
                    }

                    if (end_date > startOfMonth && end_date < endOfMonth) {
                        actEndDate = end_date
                    } else {
                        actEndDate = endOfMonth
                    }
                    let durations = actEndDate.diff(actStartDate, "minutes")
                    
                    //'++id,[owner+network],dseq,start_date',//total_minutes,total_cost,name,cpu,memory,storage,gpu

                    deploymentHistoryList.push({
                        "owner":owner,
                        "network":selectedNetwork.id,
                        "dseq":element.lease.lease_id.dseq,
                        "start_date":startOfMonth.format("YYYY-MM-DD"),
                        "total_minutes":durations,
                        "total_cost":durations * parseFloat(element.lease.price.amount) * rate,
                        "name": "dSeq-"+element.lease.lease_id.dseq,
                        "cpu":d_result.deployment.leases[0].cpuUnits,
                        "memory":d_result.deployment.leases[0].memoryQuantity,
                        "storage":d_result.deployment.leases[0].storageQuantity,
                        "gpu":d_result.deployment.leases[0].gpuUnits
                    })

                    start_date.add(1, "month").startOf("month")
                }
                const attributes = d_result.deployment.leases[0].provider.attributes
                const region = attributes.filter(element => {return element.key === "region"})
                deploymentList.push({
                    "owner": owner,
                    "network": selectedNetwork.id,
                    "dseq": element.lease.lease_id.dseq,
                    "state": element.lease.state,
                    "monthlyCostUDenom": element.lease.price.amount,
                    "created_at": d_result.deployment.leases[0].createdDate,
                    "closed_at": d_result.deployment.leases[0].closedDate,
                    "balance": d_result.deployment.other.escrow_account.balance.amount,
                    "withdrawn":d_result.deployment.other.escrow_account.transferred.amount,
                    "rate": rate,
                    "totalMonthlyCostUDenom":d_result.deployment.totalMonthlyCostUDenom,
                    "region":region.value
                })

                // console.log(deploymentList)
                //'++id,[owner+network], dseq'//create_deployment,create_bid,create_lease,close_bid,close_deployment
                costBreakDownList.push({
                    "owner": owner,
                    "network": selectedNetwork.id,
                    "dseq": element.lease.lease_id.dseq,
                    "Create Deployment": parseInt(d_result.constBreakdown['akash.deployment.v1beta3.MsgCreateDeployment'] || 0),
                    "Create Bid": parseInt(d_result.constBreakdown['akash.market.v1beta4.MsgCreateBid'] || 0),
                    "Create Lease": parseInt(d_result.constBreakdown['akash.market.v1beta4.MsgCreateLease'] || 0),
                    "Close Bid": parseInt(d_result.constBreakdown['akash.market.v1beta4.MsgCloseBid'] || 0),
                    "Close Deployment": parseInt(d_result.constBreakdown['akash.deployment.v1beta3.MsgCloseDeployment'] || 0)
                })

            }

            deploymentsTable.bulkAdd(deploymentList)
            costbreakdownTable.bulkAdd(costBreakDownList)
            deploymentshistoryTable.bulkAdd(deploymentHistoryList)
        }
    }
}


