import { CronJob } from "cron";
import getLogger from "./logger";
import { Server } from "./server";
import { IndexerService } from "./services/indexerService";
const log = getLogger("main");

function setupCronJobs(): CronJob {
  return new CronJob({
    cronTime: "* * * * * *",
    onTick: IndexerService.loopBlocks,
    start: true,
    runOnInit: false,
  });
}

new Server()
  .start()
  .then(() => {
    log.info("Starting API");
    setupCronJobs();
  })
  .catch((err) => {
    log.error(err);
  });
