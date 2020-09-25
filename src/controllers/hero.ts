import { Controller, Get, PathParams, QueryParams, Status } from "@tsed/common";
import { Name } from "@tsed/swagger";
import { HeroDao, HeroListResponse } from "../daos/heroDao";

import { HeroService } from "../services/heroService";
import { IndexerService } from "../services/indexerService";

@Name("Hero")
@Controller("/heroes")
export default class HeroController {
  @Get("/")
  @Status(200, { type: HeroListResponse })
  public async getAll(
  @QueryParams("page") page: number,
    @QueryParams("limit") limit: number
  ) {
    const serv = new IndexerService();
    return await serv.getAddresses(page, limit);
  }

  // TODO: Remove before deploy
  @Get("/debug")
  @Status(200)
  public async getHeight() {
    return await IndexerService.loopBlocks();
  }

  @Get("/:address")
  @Status(200, { type: HeroDao })
  public async get(@PathParams("address") address: string) {
    return await HeroService.getHeroDao(address);
  }
}
