import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MqttService } from './mqtt/mqtt.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Data } from './data/data.entity';
import { DataService } from './data/data.service';

@WebSocketGateway({ cors: true })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly mqttService: MqttService,
    private readonly eventEmiter: EventEmitter2,
    private readonly dataService: DataService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleEmitSoket({ data, event, to }) {
    if (to) {
      this.server.to(to).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }
  @SubscribeMessage('message')
  async handleMessage(client: Socket, @MessageBody() data) {
    console.log('message', data);
  }

  @SubscribeMessage('control')
  async handleDevice(client: Socket, @MessageBody() data) {
    const handleData = JSON.parse(data.toString());
    if (handleData.fan) {
      handleData.fan === 'on'
        ? this.mqttService.mqtt.publish('fan', 'on')
        : this.mqttService.mqtt.publish('fan', 'off');
    } else {
      handleData.led === 'on'
        ? this.mqttService.mqtt.publish('led', 'on')
        : this.mqttService.mqtt.publish('led', 'off');
    }
  }

  afterInit(socket: Socket) {
    console.log('EventGateway initialized');
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
  }

  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);

    this.mqttService.mqtt.on('message', (topic, message) => {
      if (topic === 'sensor') {
        //emit event to save data to DB
        // this.eventEmiter.emit('data.insert', message.toString());
        //send data to client over websocket
        this.handleEmitSoket({
          data: message.toString(),
          event: 'sensor',
          to: null,
        });
      } else if (topic === 'led') {
        this.handleEmitSoket({
          data: message.toString(),
          event: 'led',
          to: null,
        });
      } else if (topic === 'fan') {
        this.handleEmitSoket({
          data: message.toString(),
          event: 'fan',
          to: null,
        });
      } else if (topic === 'warning') {
        this.handleEmitSoket({
          data: message.toString(),
          event: 'warning',
          to: null,
        });
      }
    });
  }

  // @OnEvent('data.insert', { async: true })
  // async handleDataInsrtEvent(payload: Data) {
  //   // console.log(payload.toString());

  //   await this.dataService.storeDataInCache(payload);
  // }
}
