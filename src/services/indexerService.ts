import axios from "axios";
import config from "config";
import { getConnection, getRepository } from "typeorm";
import { HeroDao, HeroListResponse } from "../daos/heroDao";
import { Block } from "../entities/blocks";
import { Transfer } from "../entities/transfers";
import getLogger from "../logger";
import { HeroState, HeroType } from "./heroStateMachine";
const log = getLogger("stats");

export class IndexerService {
  public static getAxios() {
    return axios.create({ baseURL: config.get<any>("tamagotchiApi") });
  }

  public static async getTxsInBlock(blockHeight: number) {
    const res = await IndexerService.getAxios().get(
      `/txs?tx.height=${blockHeight}`
    );
    return res.data.txs;
  }

  public static async getCurrentHeight() {
    const res = await IndexerService.getAxios().get("/blocks/latest");
    return res.data.block.header.height;
  }

  public static async loopBlocks() {
    let localHeight = 1;
    const latest = await getRepository(Block).findOne({
      order: { height: "DESC" },
    });

    if (latest) {
      localHeight = latest.height + 1;
    }

    const chainHeight = await IndexerService.getCurrentHeight();
    for (localHeight; localHeight < chainHeight; localHeight++) {
      const txs = await IndexerService.getTxsInBlock(localHeight);

      if (txs.length !== 0) {
        // Loop txs
        for (const tx of txs) {
          // Loop msgs and look for msg with type "ibc/channel/MsgPacket"

          for (const msg of tx.tx.value.msg) {
            if (msg.type === "ibc/channel/MsgPacket") {
              // Decode packet details
              const data = JSON.parse(
                Buffer.from(msg.value.packet.data, "base64").toString()
              );

              // check which kind of IBC packet we have
              if (data.type === "ibc/transfer/PacketDataTransfer") {
                // Save transfer in database
                const transfer = new Transfer();
                transfer.hash = tx.txhash;
                transfer.height = tx.height;
                transfer.sequence = msg.value.packet.sequence;
                transfer.amount = JSON.stringify(data.value.amount);
                transfer.sender = data.value.sender;
                transfer.receiver = data.value.receiver;
                await getRepository(Transfer).save(transfer);
              }
            }
          }
        }
      }

      // Save block
      try {
        const block = new Block();
        block.height = localHeight;
        block.txNumber = txs.length;
        await getRepository(Block).save(block);
        log.debug(`Block ${localHeight} parsed!`);
      } catch (e) {
        log.error("Block already parsed.. skipping");
      }
    }

    log.info(
      "🐠 All Tamagotchi updated! Local and remote height are in sync now."
    );
    return { done: true };
  }

  public async getAddresses(
    page: number,
    limit: number
  ): Promise<HeroListResponse> {
    if (page <= 0) {
      page = 1;
    }

    const curHeight = await IndexerService.getCurrentHeight();

    // todo: find a better wait to count total results
    const total = await getConnection()
      .createQueryBuilder()
      .select("t.receiver, max(t.height) max_height, min(t.height) min_height")
      .from("transfers", "t")
      .groupBy("t.receiver")
      .getRawMany();

    const addresses = await getConnection()
      .createQueryBuilder()
      .select(
        "t.receiver, max(t.height) max_height, min(t.height) min_height, max('t'.'updatedAt') last_active"
      )
      .from("transfers", "t")
      .orderBy("last_active", "DESC")
      .groupBy("t.receiver")
      .take(limit)
      .skip((page - 1) * limit)
      .getRawMany();

    const heroes = addresses.map((ad) => {
      const hero: HeroDao = {
        state: HeroState.BIRTH,
        type: HeroType.EGG,
        address: ad.receiver,
        lastActive: ad.last_active,
        age: curHeight - ad.min_height,
      };
      return hero;
    });

    const response: HeroListResponse = {
      pageNumber: page,
      pageTotal: Math.ceil(total.length / limit),
      count: total.length,
      limit,
      heroes,
    };

    return response;
  }
}
