import * as num from '../numberOperation';

const testNumber = 12345.678901234;
const testNumber2 = 1486.4;

const variables = [
  [0, 12346.0, 12346.0, 12345.0],
  [1, 12345.7, 12345.7, 12345.6],
  [2, 12345.68, 12345.68, 12345.67],
  [3, 12345.679, 12345.679, 12345.678],
  [4, 12345.6789, 12345.679, 12345.6789],
  [5, 12345.6789, 12345.67891, 12345.6789],
  [6, 12345.678901, 12345.678902, 12345.678901],
  [7, 12345.6789012, 12345.6789013, 12345.6789012],
  [8, 12345.67890123, 12345.67890124, 12345.67890123],
];

const variables2 = [
  [0, 1486.0, 1487.0, 1486.0],
  [-1, 1490.0, 1490.0, 1480.0],
  [-2, 1500.0, 1500.0, 1400.0],
  [-3, 1000.0, 2000.0, 1000.0],
];

test('Round Test', () => {
  variables.forEach((array) => {
    expect(num.toHalfAdjust(testNumber, array[0])).toBe(array[1]);
  });
  variables2.forEach((array) => {
    expect(num.toHalfAdjust(testNumber2, array[0])).toBe(array[1]);
  });
});

test('RoundUp Test', () => {
  variables.forEach((array) => {
    expect(num.toRoundUp(testNumber, array[0])).toBe(array[2]);
  });
  variables2.forEach((array) => {
    expect(num.toRoundUp(testNumber2, array[0])).toBe(array[2]);
  });
});

test('RoundDown Test', () => {
  variables.forEach((array) => {
    expect(num.toRoundDown(testNumber, array[0])).toBe(array[3]);
  });
  variables2.forEach((array) => {
    expect(num.toRoundDown(testNumber2, array[0])).toBe(array[3]);
  });
});
