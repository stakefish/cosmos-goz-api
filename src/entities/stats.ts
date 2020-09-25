import { Enum, Property, Required } from "@tsed/common";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("stats")
export class Stat {
  @PrimaryColumn()
  @Index()
  @Property()
  @Required()
  @Enum("cosmos", "iris", "kava", "tezos")
  public chain: "cosmos" | "iris" | "kava" | "tezos";

  @PrimaryColumn()
  @Index()
  @Property()
  @Required()
  public validator: string;

  @PrimaryColumn()
  @Index()
  @Property()
  @Required()
  public block: number;

  @Column()
  @Index()
  @Property()
  @Required()
  public blockTime: Date;

  @Column({
    type: "numeric",
    precision: 32,
    scale: 16,
  })
  @Property()
  public stakedAmount: number;

  @Column()
  @Property()
  public stakedAmountRank: number = 0;

  @Column({
    type: "numeric",
    precision: 17,
    scale: 16,
  })
  @Property()
  public stakedAmountPercent: number;

  @Column()
  @Property()
  public delegatorNum: number = 0;

  @Column()
  @Property()
  public delegatorNumRank: number = 0;

  @Column({
    type: "numeric",
    precision: 32,
    scale: 16,
    nullable: true,
  })
  @Property()
  public accountBalance: number = 0;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
