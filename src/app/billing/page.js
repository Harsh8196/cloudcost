"use client"
import { useState,useEffect } from "react";
import { NoDeployments, LoadingContainer } from "@/component/Loading"
import dynamic from "next/dynamic"
import networkStore, { networks } from '@/utils/networkStore'
import { useAtom } from "jotai";
import { deploymentList } from '@/db/deployments'
import moment from "moment";

export default function Billing() {

  const BillingTable= dynamic(() => import("../../component/ui/BillingTable",{ ssr: false }))
  const ConsolidatedTable= dynamic(() => import("../../component/ui/ConsolidatedTable",{ ssr: false }))
  const MonthlyInvoiceSummary = dynamic(() => import("../../component/ui/MonthlyInvoiceSummary",{ ssr: false }))

  const [isLoading, setIsLoading] = useState(false)
  const [noDeployments,setNoDeployments] = useState(false)
  const [status,setStatus] = useState('false')
  const [selectedNetworkId, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
  const [owner, setOwner] = useAtom(networkStore.selectedAddress)
  const [billingTableTimeSelection,setBillingTableTimeSelection] = useAtom(networkStore.billingTableTimeSelection)
  const [billingChartTimeSelection,setBillingChartTimeSelection] = useAtom(networkStore.billingChartTimeSelection)


  useEffect(() => {
    //console.log(selectedNetworkId.id, owner)
    if (selectedNetworkId.id !== '' && owner !== '') {
      init()
    }
  }, [selectedNetworkId, owner])

  const init = async () => {
    setIsLoading(false)
    setNoDeployments(false)
    await deploymentList()
    const selectedNetwork = networks.find((network) => network.id === window.localStorage.getItem('selectedNetworkId'))
    const owner = window.localStorage.getItem('accountAddress')
    const basicAPIUrl = selectedNetwork.basicAPIUrl;
    const leaseList = await fetch(basicAPIUrl + 'akash/market/v1beta4/leases/list?filters.owner=' + owner)
    const result = await leaseList.json()
    //console.log(result)
    if(result.leases.length > 0 ) {
      setNoDeployments(true)
    }else {
      setNoDeployments(false)
    }
    setIsLoading(true)
  }

  const TableTimeOptions  = () => {
    const thisMonth = moment().startOf('month').format('YYYY-MM-DD')
    const lastThreeMonth = moment().add(-3,'month').startOf('month').format('YYYY-MM-DD')
    const thisYear = moment().startOf('year').format('YYYY-MM-DD')
    const options = [{"id":'This Month',"value":thisMonth},{"id":'Last Three Month',"value":lastThreeMonth},{"id":'This Year',"value":thisYear}]
    return(
      options.map((i,index) => 
        <option key={index} value={i.value} selected={billingTableTimeSelection === i.value?1:0}>{i.id}</option>
      )

    )
  }

  const ChartTimeOptions  = () => {
    const thisMonth = moment().startOf('month').format('YYYY-MM-DD')
    const lastThreeMonth = moment().add(-3,'month').startOf('month').format('YYYY-MM-DD')
    const thisYear = moment().startOf('year').format('YYYY-MM-DD')
    const options = [{"id":'This Month',"value":thisMonth},{"id":'Last Three Month',"value":lastThreeMonth},{"id":'This Year',"value":thisYear}]
    return(
      options.map((i,index) => 
        <option key={index} value={i.value} selected={billingChartTimeSelection === i.value?1:0}>{i.id}</option>
      )

    )
  }

  const onTableTimeSelectionChange = async (e) => {
    setBillingTableTimeSelection(e.target.value)
    //console.log(e.target.value)
  }

  const onChartTimeSelectionChange = async (e) => {
    setBillingChartTimeSelection(e.target.value)
    //console.log(e.target.value)
  }

  const onClickExport = (e) => {
    e.preventDefault()
    window.alert("Not Implemented. We will add this feature in next release.")
  }

  return (
    <div>
      <NoDeployments isLoading={!isLoading || noDeployments}/>
      <LoadingContainer isLoading={isLoading}/>
      <div className="m-2" hidden={!noDeployments}>
        <div className="row mt-3">
          <div className="mb-3 mb-sm-0">
            <div className="card shadow rounded-4 border-white">
              <div className="row g-0 mt-2 align-items-center">
                <div className="col-md-9">
                  <span className="card-title ms-3">Billing Information</span>
                </div>
                <div className="col-md-3">
                  <div className="me-3">
                    <select className="form-select" onChange={onTableTimeSelectionChange}>
                      <TableTimeOptions/>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row g-0 mt-3 align-items-center mb-3">
                <div className="col-md-8">
                  <div className="card rounded-4 me-1 ms-3 table-card-border p-2" style={{"height":"210px"}}>
                    <div className="table-responsive">
                      <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th scope="col" className="table-header-text">Deployment</th>
                            <th scope="col" className="table-header-text">Monthly Cost</th>
                            <th scope="col" className="table-header-text">Monthly Usage</th>
                            <th scope="col" className="table-header-text">Status</th>
                            <th scope="col" className="table-header-text">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                         <BillingTable/>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card rounded-4 me-1 ms-3 table-card-border p-2 me-3">
                    <div className="card-title-consolidated">Consolidated Invoice</div>
                    <div className="table-responsive">
                      <table className="table table-borderless">
                        <ConsolidatedTable/>
                      </table>
                    </div>
                    <button type="button" className="btn btn-cc mt-2" onClick={onClickExport}>Export Invoice</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
              <div className="mb-3 mb-sm-0">
                <div className="card shadow rounded-4 border-white">
                  <div className="row g-0 mt-2 align-items-center">
                    <div className="col-md-9">
                      <span className="card-title ms-3">Billing History</span>
                    </div>
                    <div className="col-md-3">
                      <div className="me-3">
                        <select className="form-select" onChange={onChartTimeSelectionChange}>
                        <ChartTimeOptions/>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ "height": "350px" }}>
                    <MonthlyInvoiceSummary />
                  </div>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
}