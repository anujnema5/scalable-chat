import http from 'http'
import { SocketService } from './service/socket';

const init = async () => {
    const httpServer = http.createServer();
    const socketService = new SocketService();

    socketService.io.attach(httpServer)
    socketService.initListner();

    httpServer.listen(8000, () => {
        console.log("SERVER ESTABLISHED")
    })
}

init();