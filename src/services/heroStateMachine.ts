import assert from "assert";
import getLogger from "../logger";
const log = getLogger("stats");
export enum HeroState {
  BIRTH = 0,
  NORMAL = 1,
  HUNGRY = 2,
  HUNGRY_FEED = 3,
  POO = 4,
  POO_CLEAN = 5,
  BORED = 6,
  BORED_PLAY = 7,
  HAPPY = 8,
  DEAD = 9,
}

export enum HeroType {
  EGG = 0,
  BABY = 1,
  JELLYFISH = 2,
  SEAHORSE = 3,
  CRAB = 4,
}

export class HeroEvent {
  public type: HeroEventType;
  public height: number;
}

export enum HeroEventType {
  IDLE = 0,
  FEED = 1,
  CLEAN = 2,
  PLAY = 3,
}

export class HeroStateStore {
  public state: HeroState;
  public type: HeroType;
  public height: number;
  public numFeed: number;
  public numPlay: number;
  public numClean: number;
}

export class Timing {
  public static readonly BIRTH_TO_NORMAL = 10;
  public static readonly FIRST_HUNGRY = 10;
  public static readonly FEED_CLEAN_PLAY_DURATION = 10;
  public static readonly HAPPY_DURATION = 100;
  public static readonly NORMAL_TO_HUNGRY = 1000;
  public static readonly NORMAL_TO_POO = 2000;
  public static readonly NORMAL_TO_BORED = 4000;
  public static readonly DEAD_BY_HUNGER = 50000;
  public static readonly DEAD_BY_POO = 200000;
  public static readonly TRANFORM_TX_NUM = 3;
}

export class HeroStateMachine {
  constructor(
    readonly initialState: HeroStateStore = {
      type: HeroType.EGG,
      height: 0,
      state: HeroState.NORMAL,
      numFeed: 0,
      numClean: 0,
      numPlay: 0,
    },
    public currentState = initialState
  ) {
    log.debug("New HeroStateMachine");
  }

  public step(event: HeroEvent) {
    assert(event.height >= this.currentState.height);
    assert(event.type !== HeroEventType.IDLE);

    const idleEvent: HeroEvent = {
      type: HeroEventType.IDLE,
      height: event.height,
    };
    // Always handle the idle event up until now first
    this.handleIdle(idleEvent);
    this.handleEvent(event);
  }

  public stepToHeight(height: number) {
    assert(height >= this.currentState.height);

    const idleEvent: HeroEvent = { type: HeroEventType.IDLE, height };
    this.handleIdle(idleEvent);
  }

  protected handleEvent(event: HeroEvent) {
    log.debug(
      `Handling ${HeroEventType[event.type]} event`,
      event.height,
      this.currentState.height
    );
    assert(event.height >= this.currentState.height);
    assert(event.type !== HeroEventType.IDLE);

    const newState: HeroStateStore = {
      state: this.currentState.state,
      type: this.currentState.type,
      numFeed: this.currentState.numFeed,
      numClean: this.currentState.numClean,
      numPlay: this.currentState.numPlay,
      height: event.height,
    };
    if (this.currentState.type === HeroType.EGG) {
      newState.type = HeroType.BABY;
      newState.state = HeroState.BIRTH;
    } else {
      switch (this.currentState.state) {
        case HeroState.BIRTH:
          newState.state = HeroState.NORMAL;
          break;
        case HeroState.NORMAL:
        case HeroState.HAPPY:
        case HeroState.POO_CLEAN:
        case HeroState.HUNGRY_FEED:
        case HeroState.BORED_PLAY:
          if (this.currentState.type === HeroType.BABY) {
            if (this.currentState.numClean >= Timing.TRANFORM_TX_NUM) {
              newState.type = HeroType.CRAB;
            } else if (this.currentState.numFeed >= Timing.TRANFORM_TX_NUM) {
              newState.type = HeroType.JELLYFISH;
            } else if (this.currentState.numPlay >= Timing.TRANFORM_TX_NUM) {
              newState.type = HeroType.SEAHORSE;
            }
          }
          switch (event.type) {
            case HeroEventType.CLEAN:
              newState.state = HeroState.POO_CLEAN;
              newState.numClean++;
              break;
            case HeroEventType.FEED:
              newState.state = HeroState.HUNGRY_FEED;
              newState.numFeed++;
              break;
            case HeroEventType.PLAY:
              newState.state = HeroState.BORED_PLAY;
              newState.numPlay++;
              break;
          }
        // eslint-disable no-fallthrough
        case HeroState.HUNGRY:
          if (event.type === HeroEventType.FEED) {
            newState.state = HeroState.HUNGRY_FEED;
            newState.numFeed++;
          }
          break;
        case HeroState.POO:
          if (event.type === HeroEventType.CLEAN) {
            newState.state = HeroState.POO_CLEAN;
            newState.numClean++;
          }
          break;
        case HeroState.BORED:
          if (event.type === HeroEventType.PLAY) {
            newState.state = HeroState.BORED_PLAY;
            newState.numPlay++;
          }
          break;
        default:
          break;
      }
    }

    this.currentState = newState;
  }

  protected handleIdle(event: HeroEvent) {
    log.debug(
      "Handling idle",
      event.height,
      this.currentState.height,
      HeroState[this.currentState.state]
    );

    assert(event.height >= this.currentState.height);
    assert(event.type === HeroEventType.IDLE);

    const newState: HeroStateStore = {
      state: this.currentState.state,
      type: this.currentState.type,
      numFeed: this.currentState.numFeed,
      numClean: this.currentState.numClean,
      numPlay: this.currentState.numPlay,
      height: this.currentState.height,
    };
    let idleTimeMin = 0;
    let newTargetState = this.currentState.state;
    // Egg can be idle for ever
    if (this.currentState.type !== HeroType.EGG) {
      switch (this.currentState.state) {
        case HeroState.BIRTH:
          idleTimeMin = Timing.BIRTH_TO_NORMAL;
          newTargetState = HeroState.NORMAL;
          break;
        case HeroState.NORMAL:
          if (this.currentState.numFeed === 0) {
            newTargetState = HeroState.HUNGRY;
            idleTimeMin = Timing.FIRST_HUNGRY;
          } else {
            switch (this.currentState.height % 3) {
              case 0:
                newTargetState = HeroState.HUNGRY;
                idleTimeMin = Timing.NORMAL_TO_HUNGRY;
                break;
              case 1:
                newTargetState = HeroState.POO;
                idleTimeMin = Timing.NORMAL_TO_POO;
                break;
              case 2:
                newTargetState = HeroState.BORED;
                idleTimeMin = Timing.NORMAL_TO_BORED;
                break;
            }
          }
          break;
        case HeroState.HUNGRY_FEED:
        case HeroState.POO_CLEAN:
        case HeroState.BORED_PLAY:
          idleTimeMin = Timing.FEED_CLEAN_PLAY_DURATION;
          newTargetState = HeroState.HAPPY;
          break;
        case HeroState.HAPPY:
          idleTimeMin = Timing.HAPPY_DURATION;
          newTargetState = HeroState.NORMAL;
          break;
        case HeroState.HUNGRY:
          newTargetState = HeroState.DEAD;
          idleTimeMin = Timing.DEAD_BY_HUNGER;
          break;
        case HeroState.POO:
          newTargetState = HeroState.DEAD;
          idleTimeMin = Timing.DEAD_BY_POO;
          break;
        default:
          break;
      }
    }

    if (idleTimeMin === 0) {
      newState.height = event.height;
      this.currentState = newState;
    } else {
      const idleTime = event.height - this.currentState.height;
      if (idleTime >= idleTimeMin) {
        log.debug(`idleTime ${idleTime} idleTimeMin ${idleTimeMin}`);
        newState.state = newTargetState;
        newState.height += idleTimeMin;
        this.currentState = newState;

        // Continue to handle idle events until exhaust all
        this.handleIdle(event);
      }
    }
  }
}
