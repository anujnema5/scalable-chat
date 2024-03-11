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
exports.startMessageConsumer = exports.produceMessage = exports.createProducers = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const kafkajs_1 = require("kafkajs");
const prisma_1 = __importDefault(require("./prisma"));
/** KAFKA BROKER */
const kafka = new kafkajs_1.Kafka({
    brokers: ['scalable-chat-anujnemacoding-10fa.a.aivencloud.com:23494'],
    clientId: 'scalable-chat',
    ssl: {
        ca: [fs_1.default.readFileSync(path_1.default.resolve('src/service/ca.pem'), 'utf-8')]
    },
    sasl: {
        username: 'avnadmin',
        password: 'AVNS_0dZT6ShEh78xVHS0Ah-',
        mechanism: 'plain'
    },
});
let producer = null;
const createProducers = () => __awaiter(void 0, void 0, void 0, function* () {
    if (producer)
        return producer;
    const _producer = kafka.producer();
    yield _producer.connect();
    producer = _producer;
    return producer;
});
exports.createProducers = createProducers;
const produceMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const producer = yield (0, exports.createProducers)();
    yield producer.send({
        messages: [{ key: `messages-${Date.now()}`, value: message }],
        topic: "MESSAGES"
    });
});
exports.produceMessage = produceMessage;
const startMessageConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    const consumer = kafka.consumer({
        groupId: 'default'
    });
    yield consumer.connect();
    yield consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
    yield consumer.run({
        autoCommit: true,
        eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ message, pause }) {
            var _b;
            console.log(`New message recieved ...`);
            if (!message.value)
                return;
            try {
                yield prisma_1.default.message.create({
                    data: {
                        text: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString()
                    }
                });
            }
            catch (error) {
                console.log('Something is wrong or database is down');
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: 'MESSAGES' }]);
                }, 60 * 1000);
            }
        })
    });
});
exports.startMessageConsumer = startMessageConsumer;
exports.default = kafka;
