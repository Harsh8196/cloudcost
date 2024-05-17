import { deploymentsTable, deploymentshistoryTable } from "@/db/db.config"
import { useAtom } from "jotai"
import networkStore from "@/utils/networkStore"
import moment from "moment"
import { useLiveQuery } from "dexie-react-hooks"
import { ResponsiveBar } from '@nivo/bar'

export default function ResourceAnalysisChart() {
    const [selectedNetwork, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
    const [owner, setOwner] = useAtom(networkStore.selectedAddress)
    const [selectedDeployment, setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
    const [resourceTimeSelection,setCostAnalysisSelection] = useAtom(networkStore.resourceTimeSelection)
    const [resourceSelection,setResourceSelection] = useAtom(networkStore.resourceAnalysisSelection)
    const [usdPrice, setUSDPrice] = useAtom(networkStore.usdPrice)

    let distinctMonth = [], deploymentHistory = [] , deployments = [],chartData = [],keys = []
    let selectedStartMonth = moment(resourceTimeSelection)
    let thisMonth = moment().startOf('month')
    // console.log(selectedNetwork.id,owner,selectedDeployment,resourceTimeSelection)
    if (selectedNetwork.id !== '' && owner !== '' && selectedDeployment && resourceTimeSelection) {
        if (selectedDeployment === 'All') {
            deploymentHistory = useLiveQuery(() => deploymentshistoryTable.where({ "owner": owner, "network": selectedNetwork.id}).and(element => {return moment(element.start_date) >= moment(resourceTimeSelection)}).toArray())
        } else {
            deploymentHistory = useLiveQuery(() => deploymentshistoryTable.where({ "owner": owner, "network": selectedNetwork.id,"dseq": selectedDeployment }).and(element => {return moment(element.start_date) >= moment(resourceTimeSelection)}).toArray())
        }
        while(selectedStartMonth.isBefore(thisMonth.add(1,'day'))){
            distinctMonth.push(moment(selectedStartMonth).startOf('month').format('YYYY-MM-DD'));
            selectedStartMonth.add(1,'month').startOf('month')
        }

        if(deploymentHistory?.length > 0 && distinctMonth.length > 0){
            
            for(var i=0; i<distinctMonth.length; i++){
                let filteredHistory = deploymentHistory.filter(element => {return element.start_date === distinctMonth[i]})
                let rawData = {}
                rawData["month"] = moment(distinctMonth[i]).format('MMM')
                for(var j=0; j<filteredHistory.length; j++){
                    
                    let name = filteredHistory[j].dseq
                    if(resourceSelection === 'cpu'){
                        rawData[name] = parseFloat(filteredHistory[j].cpu/1000).toFixed(3)
                    } else if(resourceSelection === 'gpu'){
                        rawData[name] = parseFloat(filteredHistory[j].gpu/1000).toFixed(3)
                    }else if(resourceSelection === 'storage'){
                        rawData[name] = parseFloat(filteredHistory[j].memory/1000000).toFixed(3)
                    }else if(resourceSelection === 'memory'){
                        rawData[name] = parseFloat(filteredHistory[j].storage/1000000).toFixed(3)
                    }
                    
                    keys.indexOf(filteredHistory[j].dseq) === -1? keys.push(filteredHistory[j].dseq):console.log("Exists")
                }
                chartData.push(rawData)
            } 
        }
    }
    return (
        <ResponsiveBar
        data={chartData}
        keys={keys}
        indexBy="month"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: '#38bcb2',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: '#eed312',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Month',
            legendPosition: 'middle',
            legendOffset: 32,
            truncateTickAt: 0
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: resourceSelection,
            legendPosition: 'middle',
            legendOffset: -40,
            truncateTickAt: 0
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
    />
    )
}