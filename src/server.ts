import { createConnection } from "typeorm";

import {
  GlobalAcceptMimesMiddleware,
  ServerLoader,
  ServerSettings,
} from "@tsed/common";
import "@tsed/swagger";
import "@tsed/typeorm";
import config from "config";
import lodash from "lodash";

import { NotFoundMiddelware } from "./middlewares/notFound";

import bodyParser = require("body-parser");
import compression = require("compression");
import cors = require("cors");
import helmet = require("helmet");

const rootDir = __dirname;
const connectionOptions = lodash.cloneDeep(config.get<any>("db"));
console.log("connectionOptions", connectionOptions);

@ServerSettings({
  rootDir,
  acceptMimes: ["application/json", "text/html"],
  httpPort: process.env.API_DOCKER_PORT || 6001,
  httpsPort: false,
  mount: {
    "/v1": `${rootDir}/controllers/**/*.ts`,
  },
  componentsScan: [`${rootDir}/middlewares/**/*.ts`],
  swagger: config.get<Boolean>("swagger.ui")
    ? [
      {
        path: "/api",
        spec: {
          info: {
            title: "Cosmos GoZ API",
            version: "0.0.1",
          },
        },
      },
    ]
    : undefined,
  typeorm: [connectionOptions],
})
export class Server extends ServerLoader {
  public $beforeRoutesInit(): void {
    this.use(GlobalAcceptMimesMiddleware)
      .use(compression())
      .use(cors())
      .use(helmet())
      .use(bodyParser.urlencoded({ extended: true }))
      .use(bodyParser.json());
    const TEN_MINUTES = 10 * 60 * 1000;
    this.httpServer.setTimeout(TEN_MINUTES);
    this.httpsServer.setTimeout(TEN_MINUTES);
  }

  public async $afterRoutesInit() {
    this.use(NotFoundMiddelware);
    await createConnection(connectionOptions);
  }
}
