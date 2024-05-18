import { useSelectedChain } from "@/context/CustomChainProvider/CustomChainProvider";
import { useEffect, useState } from "react";

export function NoDeployments({isLoading,status}) {
    return (
        <div className='row loading-container' hidden={isLoading}>
            <div className="d-flex justify-content-center align-items-center flex-column">
                <span> {status}</span>
            </div>
        </div>
    )
}

export function LoadingContainer({isLoading}) {
    const [statusText,setStatusText] = useState('')
    const { status,username,address,message,connect,disconnect,openView} = useSelectedChain();
    useEffect(()=>{
        //console.log('Staus',status)
        if(status === 'Disconnected') {
            setStatusText('Please Connect Walllet')
        } else {
            setStatusText(' Please Wait we are Loading Data')
        }
    },[status])
    return (
        <div className='row loading-container' hidden={isLoading}>
            <div className="d-flex justify-content-center align-items-center flex-column">
                <span>{statusText}</span>
                <div className="spinner-border loading-spiner" role="status" hidden={isLoading}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
}