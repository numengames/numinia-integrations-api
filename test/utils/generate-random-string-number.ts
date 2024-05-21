import { faker } from '@faker-js/faker';

export default (length: number): string => {
  let result = '';

  for (let i = 0; i < length; i++) {
    result += faker.number.int({ min: 0, max: 9 }).toString();
  }

  return result;
};
