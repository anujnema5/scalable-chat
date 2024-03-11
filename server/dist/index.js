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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_1 = require("./service/socket");
const kafka_1 = require("./service/kafka");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, kafka_1.startMessageConsumer)();
    const httpServer = http_1.default.createServer();
    const socketService = new socket_1.SocketService();
    socketService.io.attach(httpServer);
    socketService.initListner();
    httpServer.listen(8000, () => {
        console.log("SERVER ESTABLISHED");
    });
});
init();
