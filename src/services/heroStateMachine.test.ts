import {
  HeroEventType,
  HeroState,
  HeroStateMachine,
  HeroType,
  Timing,
} from "./heroStateMachine";

test("initial state", () => {
  const m = new HeroStateMachine();
  expect(m.currentState.type).toBe(HeroType.EGG);
  expect(m.currentState.state).toBe(HeroState.NORMAL);
  expect(m.currentState.height).toBe(0);
});

test("egg stay as an egg", () => {
  const m = new HeroStateMachine();
  m.stepToHeight(100000);
  expect(m.currentState.type).toBe(HeroType.EGG);
  expect(m.currentState.state).toBe(HeroState.NORMAL);
});

test("egg transforms", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.FEED, height: 100000 });
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.BIRTH);
});

test("baby birth", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.PLAY, height: 100 });
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.stepToHeight(100 + Timing.BIRTH_TO_NORMAL - 1);
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.stepToHeight(100 + Timing.BIRTH_TO_NORMAL);
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.NORMAL);
});

test("baby first hungry", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.CLEAN, height: 100 });
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.stepToHeight(100 + Timing.BIRTH_TO_NORMAL);
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.NORMAL);

  m.stepToHeight(100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY);
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.HUNGRY);
});

test("baby first feeding", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.CLEAN, height: 100 });
  expect(m.currentState.type).toBe(HeroType.BABY);
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: 100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);
});

test("baby first post feeding happiness", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.CLEAN, height: 100 });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: 100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  m.stepToHeight(100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY + 5);
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  m.stepToHeight(
    100 +
      Timing.BIRTH_TO_NORMAL +
      Timing.FIRST_HUNGRY +
      Timing.FEED_CLEAN_PLAY_DURATION
  );
  expect(m.currentState.state).toBe(HeroState.HAPPY);

  m.stepToHeight(
    100 +
      Timing.BIRTH_TO_NORMAL +
      Timing.FIRST_HUNGRY +
      Timing.FEED_CLEAN_PLAY_DURATION +
      5
  );
  expect(m.currentState.state).toBe(HeroState.HAPPY);
});

test("baby happy goes to normal", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.CLEAN, height: 100 });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: 100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  m.stepToHeight(
    100 +
      Timing.BIRTH_TO_NORMAL +
      Timing.FIRST_HUNGRY +
      Timing.FEED_CLEAN_PLAY_DURATION +
      Timing.HAPPY_DURATION
  );
  expect(m.currentState.state).toBe(HeroState.NORMAL);

  m.stepToHeight(
    100 +
      Timing.BIRTH_TO_NORMAL +
      Timing.FIRST_HUNGRY +
      Timing.FEED_CLEAN_PLAY_DURATION +
      Timing.HAPPY_DURATION +
      5
  );
  expect(m.currentState.state).toBe(HeroState.NORMAL);
});

test("baby hungry accept no other actions", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.CLEAN, height: 100 });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.PLAY,
    height: 100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY);

  m.step({
    type: HeroEventType.CLEAN,
    height: 100 + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY + 5,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY);
});

test("baby gets bored and recovers", () => {
  const m = new HeroStateMachine();
  const starting = 100;

  m.step({ type: HeroEventType.CLEAN, height: starting });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: starting + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  let height =
    starting +
    Timing.BIRTH_TO_NORMAL +
    Timing.FIRST_HUNGRY +
    Timing.FEED_CLEAN_PLAY_DURATION +
    Timing.HAPPY_DURATION +
    Timing.NORMAL_TO_BORED;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.BORED);

  m.step({ type: HeroEventType.PLAY, height });
  expect(m.currentState.state).toBe(HeroState.BORED_PLAY);
  m.stepToHeight(height + 5);
  expect(m.currentState.state).toBe(HeroState.BORED_PLAY);

  height += Timing.FEED_CLEAN_PLAY_DURATION + Timing.HAPPY_DURATION;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.NORMAL);
});

test("baby gets poopy and recovers", () => {
  const m = new HeroStateMachine();
  const starting = 102;

  m.step({ type: HeroEventType.CLEAN, height: starting });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: starting + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  let height =
    starting +
    Timing.BIRTH_TO_NORMAL +
    Timing.FIRST_HUNGRY +
    Timing.FEED_CLEAN_PLAY_DURATION +
    Timing.HAPPY_DURATION +
    Timing.NORMAL_TO_POO;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.POO);

  m.step({ type: HeroEventType.CLEAN, height });
  expect(m.currentState.state).toBe(HeroState.POO_CLEAN);
  m.stepToHeight(height + 5);
  expect(m.currentState.state).toBe(HeroState.POO_CLEAN);

  height += Timing.FEED_CLEAN_PLAY_DURATION + Timing.HAPPY_DURATION;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.NORMAL);
});

test("baby gets hungry and recovers", () => {
  const m = new HeroStateMachine();
  const starting = 101;

  m.step({ type: HeroEventType.CLEAN, height: starting });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: starting + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  let height =
    starting +
    Timing.BIRTH_TO_NORMAL +
    Timing.FIRST_HUNGRY +
    Timing.FEED_CLEAN_PLAY_DURATION +
    Timing.HAPPY_DURATION +
    Timing.NORMAL_TO_POO;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.HUNGRY);

  m.step({ type: HeroEventType.FEED, height });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);
  m.stepToHeight(height + 5);
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  height += Timing.FEED_CLEAN_PLAY_DURATION + Timing.HAPPY_DURATION;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.NORMAL);
});

test("baby expires due to hungry no feeding", () => {
  const m = new HeroStateMachine();
  m.step({ type: HeroEventType.CLEAN, height: 100 });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.stepToHeight(Timing.DEAD_BY_HUNGER * 2);
  expect(m.currentState.state).toBe(HeroState.DEAD);
});

test("baby expires due to poopy no cleaning", () => {
  const m = new HeroStateMachine();
  const starting = 102;

  m.step({ type: HeroEventType.CLEAN, height: starting });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  m.step({
    type: HeroEventType.FEED,
    height: starting + Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY,
  });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  let height =
    starting +
    Timing.BIRTH_TO_NORMAL +
    Timing.FIRST_HUNGRY +
    Timing.FEED_CLEAN_PLAY_DURATION +
    Timing.HAPPY_DURATION +
    Timing.NORMAL_TO_POO;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.POO);

  height += Timing.DEAD_BY_POO;
  m.stepToHeight(height);
  expect(m.currentState.state).toBe(HeroState.DEAD);
});

test("baby transforms to jellyfish", () => {
  const m = new HeroStateMachine();
  let height = 102;

  m.step({ type: HeroEventType.CLEAN, height });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  height += Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY;
  m.step({ type: HeroEventType.FEED, height });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  for (let i = 0; i < Timing.TRANFORM_TX_NUM - 1; i++) {
    expect(m.currentState.type).toBe(HeroType.BABY);

    height += 1;
    m.step({ type: HeroEventType.FEED, height });
  }
  expect(m.currentState.type).toBe(HeroType.JELLYFISH);
});

test("baby transforms to crab", () => {
  const m = new HeroStateMachine();
  let height = 102;

  m.step({ type: HeroEventType.CLEAN, height });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  height += Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY;
  m.step({ type: HeroEventType.FEED, height });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  for (let i = 0; i < Timing.TRANFORM_TX_NUM + 1; i++) {
    expect(m.currentState.type).toBe(HeroType.BABY);

    height += 1;
    m.step({ type: HeroEventType.CLEAN, height });
    expect(m.currentState.numClean).toBe(i + 1);
  }
  expect(m.currentState.type).toBe(HeroType.CRAB);
});

test.skip("baby transforms to seahorse", () => {
  const m = new HeroStateMachine();
  let height = 102;

  m.step({ type: HeroEventType.CLEAN, height });
  expect(m.currentState.state).toBe(HeroState.BIRTH);

  height += Timing.BIRTH_TO_NORMAL + Timing.FIRST_HUNGRY;
  m.step({ type: HeroEventType.FEED, height });
  expect(m.currentState.state).toBe(HeroState.HUNGRY_FEED);

  for (let i = 0; i < Timing.TRANFORM_TX_NUM + 1; i++) {
    expect(m.currentState.type).toBe(HeroType.BABY);

    height += 1;
    m.step({ type: HeroEventType.PLAY, height });
    expect(m.currentState.numPlay).toBe(i + 1);
  }
  expect(m.currentState.type).toBe(HeroType.SEAHORSE);
});
