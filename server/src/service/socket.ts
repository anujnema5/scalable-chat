import 'dotenv/config'
import { Redis } from "ioredis";
import { Server, Socket } from "socket.io"
import db from './prisma';
import {produceMessage} from './kafka'

const pub = new Redis({
    host: process.env.HOST,
    port: 23481,
    username: 'default',
    password: process.env.AIVEN_PASSWORD
});

const sub = new Redis({
    host: process.env.HOST,
    port: 23481,
    username: 'default',
    password: process.env.AIVEN_PASSWORD
});

export class SocketService {
    private _io: Server;

    constructor() {
        console.log("Init socket connection");
        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: "*"
            }
        });

        sub.subscribe('MESSAGES')
    }

    public initListner() {
        const io = this.io

        io.on("connect", (socket: Socket) => {
            console.log("new socket connected ", socket.id);

            socket.on('event:message', async ({ message }: { message: string }) => {
                // NOW, PUBLISH THE MESSAGE TO THE REDIS
                await pub.publish('MESSAGES', JSON.stringify({ message }))
            })
        })

        sub.on('message', async (channel, message) => {
            if (channel === 'MESSAGES') {
                io.emit('message', message)
                await produceMessage(message);
                console.log("Messages prodcued to kafka broker")
            }
        })
    }

    get io() {
        return this._io
    }
}