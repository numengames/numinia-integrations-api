import supertest from 'supertest';

import { server } from '../../../../src/server';

describe('MonitRoutes', () => {
  const path = '/api/v1/monit/health';

  test('it should response a status code 200', async () => {
    await supertest(server.app).get(path).expect(200);
  });
});
