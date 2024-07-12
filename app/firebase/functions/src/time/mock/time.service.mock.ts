import { instance, mock, when } from 'ts-mockito';

import { logger } from '../../instances/logger';
import { TimeService } from '../time.service';

let time = Date.now();

export interface TimeMock extends TimeService {
  set(date: number): void;
  forward(delta: number): void;
}

/**
 * TwitterService mock that publish and fetches posts without really
 * hitting the API
 */
export const getTimeMock = (
  timeService: TimeService,
  type: 'mock' | 'real'
) => {
  if (type === 'real') {
    return timeService;
  }

  const Mocked = mock(TimeService);

  when(Mocked.now()).thenCall((): number => {
    logger.debug(`get time ${time}`);
    return time;
  });

  const _instance = instance(Mocked) as TimeMock;

  _instance.set = (_time: number) => {
    logger.debug(`set time ${_time}`);
    time = _time;
  };

  _instance.forward = (_delta: number) => {
    time = time + _delta;
  };

  return _instance;
};
