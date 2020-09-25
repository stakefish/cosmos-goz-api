import { Property } from "@tsed/common";
import { HeroState, HeroType } from "../services/heroStateMachine";

export class HeroListResponse {
  @Property()
  public count: number;

  @Property()
  public pageNumber: number;

  @Property()
  public pageTotal: number;

  @Property()
  public limit: number;

  @Property()
  public heroes: HeroDao[];
}

export class HeroDao {
  @Property()
  public state: HeroState;

  @Property()
  public type: HeroType;

  @Property()
  public address: string;

  @Property()
  public lastActive: number;

  @Property()
  public age: number;
}
