import { Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { MqttClient } from '@nestjs/microservices/external/mqtt-client.interface';

@Controller('data')
export class DataController {
  constructor(@Inject('MQTT_CLIENT') private client: MqttClient) {}

  @MessagePattern('hello')
  tempFunction(@Ctx() context: MqttContext, @Payload() data) {
    this.client.publish('hello', 'tadaaaa');
  }
}
