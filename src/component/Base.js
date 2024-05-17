"use client"
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { usePathname } from 'next/navigation'
import { useSelectedChain } from "@/context/CustomChainProvider/CustomChainProvider";
import { useAtom,atom } from 'jotai'
import networkStore,{networks} from '@/utils/networkStore'



function Base({ children }) {
    const pathName = usePathname()
    const { status,username,address,message,connect,disconnect,openView} = useSelectedChain();
    const [selectedChain,setSelectedChain] = useAtom(networkStore.selectedNetwork)
    const [walletText,setWalletText] = useState('')
    const [selectedAddress,setSelectedAddress] = useAtom(networkStore.selectedAddress)
    const [usdPrice,setUSDPrice] = useAtom(networkStore.usdPrice)

    useEffect(()=>{
        const chain = window.localStorage.getItem('selectedNetworkId')
        if (!chain) {
            window.localStorage.setItem('selectedNetworkId','mainnet')
        }
        setSelectedChain(networks.find(n => n.id === window.localStorage.getItem('selectedNetworkId')) || networks[0])

    },[selectedChain])

    useEffect(()=>{
        console.log('Staus',status)
        if(status === 'Disconnected') {
            setWalletText('Connect Walllet')
        } else if(status === 'Connected') {
            setWalletText('Connected')
        } else {
            setWalletText('Connect Walllet')
        }
    },[status])

    useEffect(()=>{
        if(address !== undefined){
            window.localStorage.setItem('accountAddress',address)
            setSelectedAddress(address)
        } else {
            window.localStorage.setItem('accountAddress','')
            setSelectedAddress('')
        }
        getUSDPrice()
    },[address])

    async function getUSDPrice(){
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=akash-network&vs_currencies=usd")
        const result = await response.json()
        setUSDPrice(result["akash-network"]["usd"])
    }


    const onChainSelectionChange = function(e){
        setSelectedChain(e.target.value)
        window.localStorage.setItem('selectedNetworkId',e.target.value)
        setSelectedChain(networks.find(n => n.id === e.target.value) || networks[0]);
    }

    return (
        <main>
            <div className="row flex-nowrap">
                <nav className="d-flex flex-column flex-shrink-0 p-3 nav-bgcolor nav-sidebar" >
                    <Link href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                        <i className="bi pe-none me-2" width="40" height="32"></i>
                        <span className="fs-4">Cloud Cost</span>
                    </Link>
                    <hr />
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li>
                            <Link href="/" className={"nav-link" + (pathName === "/" ?" active" : "")}>
                                <i className="bi bi-grid-fill me-2" width="16" height="16"></i>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/billing" className={"nav-link" + (pathName === "/billing" ?" active" : "")}>
                                <i className="bi bi-credit-card-fill me-2" width="16" height="16"></i>
                                Billing
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className='page-container'>
                    <div className='nav-bgcolor nav-topbar d-flex justify-content-end'>
                        {/* <div className='d-flex'> */}
                            <div className='d-flex col-4 m-2 align-items-center'>
                            <select className="form-select m-2" onChange={onChainSelectionChange}>
                            <option value='mainnet' selected={selectedChain.id == 'mainnet'}>Mainnet</option>
                            <option value='sandbox' selected={selectedChain.id == 'sandbox'}>Sandbox</option>
                            </select>
                            <button type="button" className="btn btn-outline-cc m-2" onClick={connect}>
                            <i className="bi bi-wallet me-2" width="16" height="16"></i>
                            {walletText}
                            </button>
                            {/* <div className="dropdown border-top">
                                <Link href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="https://github.com/mdo.png" alt="mdo" width="24" height="24" className="rounded-circle"/>
                                </Link>
                                <ul className="dropdown-menu text-small shadow">
                                    <li><a className="dropdown-item" href="#">Disconnect</a></li>
                                </ul>
                            </div> */}
                            </div>
                        {/* </div> */}
                    </div>
                    <div className='container-fluid'>
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Base