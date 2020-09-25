import { Logger } from "ts-log-debug";

const getLogger = (name: string) => {
  const log = new Logger(name);
  log.appenders.set("std-log", { type: "stdout" });
  log.level = "info";
  return log;
};

export default getLogger;
