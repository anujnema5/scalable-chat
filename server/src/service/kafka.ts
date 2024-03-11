import { Message, Prisma } from "@prisma/client";
import fs from 'fs'
import path from 'path'
import { Kafka, Producer } from "kafkajs";
import db from "./prisma";

/** KAFKA BROKER */
const kafka = new Kafka({
    brokers: ['scalable-chat-anujnemacoding-10fa.a.aivencloud.com:23494'],
    clientId: 'scalable-chat',

    ssl: {
        ca: [fs.readFileSync(path.resolve('src/service/ca.pem'), 'utf-8')]
    },

    sasl: {
        username: 'avnadmin',
        password: 'AVNS_0dZT6ShEh78xVHS0Ah-',
        mechanism: 'plain'
    },
})

let producer: null | Producer = null

export const createProducers = async () => {
    if (producer) return producer

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer

    return producer;
}

export const produceMessage = async (message: string) => {
    const producer = await createProducers();
    await producer.send({
        messages: [{ key: `messages-${Date.now()}`, value: message }],
        topic: "MESSAGES"
    })
}

export const startMessageConsumer = async () => {
    const consumer = kafka.consumer({
        groupId: 'default'
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "MESSAGES" , fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            console.log(`New message recieved ...`)

            if (!message.value) return
            try {
                await db.message.create({
                    data: {
                        text: message.value?.toString()
                    }
                })
            } catch (error) {
                console.log('Something is wrong or database is down')
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: 'MESSAGES' }])
                }, 60 * 1000)
            }
        }
    })
}

export default kafka