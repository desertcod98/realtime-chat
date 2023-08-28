"use client";

import { pusherClient } from "@/lib/pusher";
import { useEffect, useState } from "react";

export default function Testws(){

  const [counter, setCounter] = useState(0);

  function newTest(){
    setCounter(c => c+1);
    console.log()
  }

  useEffect(() => {
    pusherClient.subscribe('test');
    pusherClient.bind('test:new', newTest);
  }, []);
  

  return (
    <div>
      {counter}
    </div>
  )
}