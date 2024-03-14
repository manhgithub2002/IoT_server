import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Data } from './data.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Data) private dataRepository: Repository<Data>,
    @InjectQueue('sensor-data') private storeDataQueue: Queue,
  ) {}

  async storeDataInCache(data) {
    await this.storeDataQueue.add('insert', data);

    // console.log(data);
  }

  async insertDataToDB(data: Data[], numOfData: number) {
    try {
      await this.dataRepository.save(data);
      console.log('store saved successfully: ' + numOfData + 'records');
    } catch (error) {
      console.log(error);
    }
  }

  async getDataFromRedis() {
    const completedJobs = await this.storeDataQueue.getCompleted();
    const resultData = completedJobs.map((job) => job.returnvalue);

    return resultData;
  }

  // @Cron(CronExpression.EVERY_5_SECONDS, { name: 'insert_data_to_DB' })
  // async insertDataToDaB() {
  //   // const completedJobs = await this.storeDataQueue.getCompleted();

  //   // if (completedJobs.length > 0) {
  //   //   const dataToInsert = completedJobs.map((job) => job.returnvalue as Data);
  //   //   await this.dataService.insertDataToDB(dataToInsert);

  //   //   // Clear completed jobs from the queue
  //   // }
  //   // await this.storeDataQueue.clean(0, 'completed');
  //   console.log('delete Data');
  // }
}
