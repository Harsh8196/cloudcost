import { NextResponse } from "next/server";

// To handle a GET request to /api
export async function POST(req,res) {
    // Do whatever you want
    const data = await req.json();
    let constBreakDown = {}
    //console.log(data)
    const response = await fetch(data.cloudmosAPIUrl+'v1/deployment/'+data.owner+'/'+data.dseq)
    const result = await response.json()
    for(var i = 0; i < result.events.length; i++) {
      let element = result.events[i]
      const eventResponse = await fetch(data.cloudmosAPIUrl+'v1/transactions/'+element.txHash)
      const event = await eventResponse.json()
      const id = element.type.replace('/', '')
      constBreakDown[id] = event.fee
    }
      
    return NextResponse.json({ "deployment": result,"constBreakdown": constBreakDown }, { status: 200 });
  }