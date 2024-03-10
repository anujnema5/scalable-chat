'use client'

import { useSocket } from "@/context/SocketProvider";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [textMsg, setTextMsg] = useState<string>('');
  const { message, sendMessage } = useSocket();

  const handleMessage = ()=> {
    if(!textMsg) throw new Error('Please write something');
    sendMessage(textMsg);
    setTextMsg('')
  }

  return (
    <main className="flex flex-col gap-4 p-10">
      <ul className="">
        {message?.map((msg: string) => (
          <li key={msg} className="text-gray-100">{msg}</li>
        ))}
      </ul>

      <div className="input flex flex-col items-start gap-4 w-52">
        <input type="text" className="rounded-lg px-3 py-2 text-gray-800" placeholder="Enter your message" value={textMsg} onChange={(e) => setTextMsg(e.target.value)} />
        <button onClick={handleMessage} className="bg-blue-600 px-2 py-1 rounded-lg">Send Message</button>
      </div>

    </main>
  );
}
