"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
require("dotenv/config");
const ioredis_1 = require("ioredis");
const socket_io_1 = require("socket.io");
const pub = new ioredis_1.Redis({
    host: process.env.HOST,
    port: 23481,
    username: 'default',
    password: process.env.AIVEN_PASSWORD
});
const sub = new ioredis_1.Redis({
    host: process.env.HOST,
    port: 23481,
    username: 'default',
    password: process.env.AIVEN_PASSWORD
});
class SocketService {
    constructor() {
        console.log("Init socket connection");
        this._io = new socket_io_1.Server({
            cors: {
                allowedHeaders: ['*'],
                origin: "*"
            }
        });
        sub.subscribe('MESSAGES');
    }
    initListner() {
        const io = this.io;
        io.on("connect", (socket) => {
            console.log("new socket connected ", socket.id);
            socket.on('event:message', (_a) => __awaiter(this, [_a], void 0, function* ({ message }) {
                // NOW, PUBLISH THE MESSAGE TO THE REDIS
                console.log(message);
                yield pub.publish('MESSAGES', JSON.stringify({ message }));
            }));
        });
        sub.on('message', (channel, message) => {
            if (channel === 'MESSAGES') {
                io.emit('message', message);
            }
        });
    }
    get io() {
        return this._io;
    }
}
exports.SocketService = SocketService;
