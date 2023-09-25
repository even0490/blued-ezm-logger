import Logger from '../src/index';

const logger = Logger({
  appName: 'blued-oversea-activity',
});

for (let index = 0; index < 10; index++) {
  logger.info({
    notice: `Context`,
  });
}
