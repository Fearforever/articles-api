import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('article')
export class Article {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 100 })
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: number;
}