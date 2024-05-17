"use client"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react";
import { NoDeployments, LoadingContainer } from "@/component/Loading"
import { deploymentList, sendCount } from '@/db/deployments'
import networkStore, { networks } from '@/utils/networkStore'
import { useAtom } from "jotai";
import moment from "moment";

export default function Home() {

  const DeploymentOptionList = dynamic(() => import("../component/ui/Deploymentlist"), { ssr: false })
  const CostBreakDownList = dynamic(() => import("../component/ui/CostBreakDown"),{ ssr: false })
  const DeploymentStatus = dynamic(() => import("../component/ui/DeploymentStatus"),{ ssr: false })
  const CardDetails = dynamic(() => import("../component/ui/CardDetails"),{ ssr: false })
  const CostAnalysisChart = dynamic(() => import("../component/ui/CostAnalysisChart"),{ ssr: false })
  const ResourceAnalysisChart = dynamic(() => import("../component/ui/ResourceAnalysisChart",{ ssr: false }))
  const AccountBalanceChart = dynamic(() => import("../component/ui/AccountBalanceChart",{ ssr: false }))

  const [isLoading, setIsLoading] = useState(false)
  const [noDeployments,setNoDeployments] = useState(false)
  const [status,setStatus] = useState('')
  const [selectedNetworkId, setSelectedNetworkId] = useAtom(networkStore.selectedNetwork)
  const [owner, setOwner] = useAtom(networkStore.selectedAddress)
  const [selectedDeployment, setSelectedDeployment] = useAtom(networkStore.selectedDeployment)
  const [costAnalysisSelection, setCostAnalysisSelection] = useAtom(networkStore.costAnalysisSelection)
  const [resourceAnalysisSelection, setResourceAnalysisSelection] = useAtom(networkStore.resourceAnalysisSelection)
  const [resourceTimeSelection, setResourceTimeSelection] = useAtom(networkStore.resourceTimeSelection)
  


  useEffect(() => {
    //console.log(selectedNetworkId.id, owner)
    if (selectedNetworkId.id !== '' && owner !== '') {
      init()
    }
  }, [selectedNetworkId, owner])


  const init = async () => {
    setIsLoading(false)
    setNoDeployments(false)
    try{
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
        setStatus('Ops! No active deployments.')
      }
      setIsLoading(true)
    } catch{
      setIsLoading(true)
      setNoDeployments(false)
      setStatus('Ops! Something went wrong.')
    }

  }

  const onDeploymentSelectionChange = async (e) => {
    setSelectedDeployment(e.target.value)
    //console.log('Selection Change', e.target.value)
  }

  const TimeDurationAnalysisOptions  = () => {
    const thisMonth = moment().startOf('month').format('YYYY-MM-DD')
    const lastThreeMonth = moment().add(-3,'month').startOf('month').format('YYYY-MM-DD')
    const thisYear = moment().startOf('year').format('YYYY-MM-DD')
    const options = [{"id":'This Month',"value":thisMonth},{"id":'Last Three Month',"value":lastThreeMonth},{"id":'This Year',"value":thisYear}]
    return(
      options.map((i,index) => 
        <option key={index} value={i.value} selected={costAnalysisSelection === i.value?1:0}>{i.id}</option>
      )

    )
  }
  const TimeDurationResourceOptions  = () => {
    const thisMonth = moment().startOf('month').format('YYYY-MM-DD')
    const lastThreeMonth = moment().add(-3,'month').startOf('month').format('YYYY-MM-DD')
    const thisYear = moment().startOf('year').format('YYYY-MM-DD')
    const options = [{"id":'This Month',"value":thisMonth},{"id":'Last Three Month',"value":lastThreeMonth},{"id":'This Year',"value":thisYear}]
    return(
      options.map((i,index) => 
        <option key={index} value={i.value} selected={resourceTimeSelection === i.value?1:0}>{i.id}</option>
      )

    )
  }

  const ResourceOptions  = () => {
    const options = [{"id":'CPU',"value":'cpu'},{"id":'GPU',"value":'gpu'},{"id":'Memory',"value":'memory'},{"id":'Storage',"value":'storage'}]
    return(
      options.map((i,index) => 
        <option key={index} value={i.value} selected={resourceAnalysisSelection === i.value?1:0}>{i.id}</option>
      )

    )
  }

  const onConstAnalysisSelectionChange = async (e) => {
    setCostAnalysisSelection(e.target.value)
    //console.log(e.target.value)
  }

  const onResourceAnalysisSelectionChange = async (e) => {
    setResourceAnalysisSelection(e.target.value)
    //console.log(e.target.value)
  }

  const onResourceTimeSelectionChange = async (e) => {
    setResourceTimeSelection(e.target.value)
    //console.log(e.target.value)
  }

  return (
    <div>
      <NoDeployments isLoading={!isLoading || noDeployments} status={status}/>
      <LoadingContainer isLoading={isLoading}/>
      <div className="m-2" hidden={!noDeployments}>
        <div className="mb-3 row align-items-center">
          <label htmlFor="deploymentlist" className="col-sm-3 col-form-label">Select Deployment</label>
          <div className="col-sm-4">
            <select className="form-select" onChange={onDeploymentSelectionChange}>
              <option value='All'>ALL</option>
              <DeploymentOptionList />
              {/* <DeploymentList/> */}
            </select>
          </div>
          <DeploymentStatus/>
        </div>
        <hr />
        <div className="row">
          <div className="col-sm-9">
            <CardDetails/>
            <div className="row mt-3">
              <div className="mb-3 mb-sm-0">
                <div className="card shadow rounded-4 border-white">
                  <div className="row g-0 mt-2 align-items-center">
                    <div className="col-md-9">
                      <span className="card-title ms-3">Cost Analysis</span>
                    </div>
                    <div className="col-md-3">
                      <div className="me-3">
                        <select className="form-select" onChange={onConstAnalysisSelectionChange}>
                          <TimeDurationAnalysisOptions/>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ "height": "350px" }}>
                  <CostAnalysisChart/>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="mb-3 mb-sm-0">
                <div className="card shadow rounded-4 border-white">
                  <div className="row g-0 mt-2 align-items-center">
                    <div className="col-md-6">
                      <span className="card-title ms-3">Resource Analysis</span>
                    </div>
                    <div className="col-md-3">
                      <div className="me-3">
                        <select className="form-select" onChange={onResourceAnalysisSelectionChange}>
                          <ResourceOptions/>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="me-3">
                        <select className="form-select" onChange={onResourceTimeSelectionChange}>
                        <TimeDurationResourceOptions/>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ "height": "350px" }}>
                    <ResourceAnalysisChart/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="row">
              <div className="mb-3 mb-sm-0">
                <div className="card shadow rounded-4 border-white" style={{ "height": "520px" }}>
                  <div className="row g-0 mt-3 align-items-center">
                    <div className="col-md-10">
                      <span className="card-title ms-3">Cost Breakdown</span>
                    </div>
                  </div>
                  <CostBreakDownList />
                </div>
              </div>
            </div>
            <div className="row mt-3">
              <div className="mb-3 mb-sm-0">
                <div className="card shadow rounded-4 border-white">
                  <div className="row g-0 mt-3 align-items-center">
                    <div className="col-md-10">
                      <span className="card-title ms-3">Account Balance ($)</span>
                    </div>
                  </div>
                  <div style={{ "height": "360px" }}>
                    <AccountBalanceChart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
