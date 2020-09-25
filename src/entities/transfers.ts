import { Property, Required } from "@tsed/common";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("transfers")
export class Transfer {
  @PrimaryColumn()
  @Index()
  @Property()
  @Required()
  public hash: string;

  @PrimaryColumn()
  @Index()
  @Property()
  @Required()
  public sequence: number;

  @Column()
  @Property()
  @Required()
  public height: number;

  @Column()
  @Property()
  @Required()
  public sender: string;

  @Column()
  @Property()
  @Index()
  @Required()
  public receiver: string;

  @Column()
  @Property()
  @Required()
  public amount: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
