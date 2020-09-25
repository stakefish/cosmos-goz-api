import { Property, Required } from "@tsed/common";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("blocks")
export class Block {
  @PrimaryColumn()
  @Index()
  @Property()
  @Required()
  public height: number;

  @Column()
  @Index()
  @Property()
  @Required()
  public txNumber: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
