import { getRepository } from "typeorm";
import { HeroDao } from "../daos/heroDao";
import { Block } from "../entities/blocks";
import { Transfer } from "../entities/transfers";
import getLogger from "../logger";
import { HeroEvent, HeroEventType, HeroStateMachine } from "./heroStateMachine";
const log = getLogger("hero");

export class HeroService {
  public static getEventTypeFromCoin(coin: any) {
    const denom = coin.denom.split("/"); // Example {"amount":"1","denom":"transfer/rxuqalyejx/play"}
    switch (denom[2]) {
      case "play":
        return HeroEventType.PLAY;
      case "clean":
        return HeroEventType.CLEAN;
      case "feed":
        return HeroEventType.FEED;
    }

    return HeroEventType.IDLE;
  }

  public static async calculateState(transfers: Transfer[]) {
    // Init state machine
    const sm = new HeroStateMachine();

    // Loop ibc transfers
    for (const transfer of transfers) {
      // Get amounts
      const coins = JSON.parse(transfer.amount);

      // Fire event for each amount
      for (const coin of coins) {
        const event: HeroEvent = {
          type: this.getEventTypeFromCoin(coin),
          height: transfer.height,
        };

        log.debug("Adding event", event);
        sm.step(event);
      }
    }

    // Step to current height
    const curBlock = await getRepository(Block).findOneOrFail({
      order: { height: "DESC" },
    });

    log.debug("Step to height", curBlock.height);
    sm.stepToHeight(curBlock.height);

    return sm.currentState;
  }

  // Calcualte age, must be ordered by height
  public static async caluclateAge(transfers: Transfer[]) {
    // Age for not initialized addresses is 0
    if (transfers.length === 0) {
      return 0;
    }

    const curBlock = await getRepository(Block).findOneOrFail({
      order: { height: "DESC" },
    });

    return curBlock.height - transfers[0].height;
  }

  public static async getHeroDao(address: string) {
    // Load transfers history for this address
    const transfers = await getRepository(Transfer).find({
      where: { receiver: address },
      order: { height: "ASC" },
    });
    log.debug("Calcualting state for", address);

    const state = await HeroService.calculateState(transfers);

    const h = new HeroDao();
    h.type = state.type;
    h.lastActive = state.height;
    h.state = state.state;
    h.address = address;
    h.age = await HeroService.caluclateAge(transfers);
    return h;
  }
}
