import { IsNotEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Data extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  temp: number;

  @Column()
  @IsNotEmpty()
  hum: number;

  @Column()
  @IsNotEmpty()
  light: number;
}
