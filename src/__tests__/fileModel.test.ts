import { expect, test } from 'vitest';
import { FileTransportInfo } from '../fileModel';

class TransportResult {
  index: number;
  inputBase: string;
  inputSourceDirectory: string;
  inputSourceName: string;
  inputDestinationDirectory: string;
  inputDestinationName: string;
  sourceFullBase: string;
  sourceFull: string;
  sourceDirectory: string;
  sourceName: string;
  destinationFull: string;
  destinationDirectory: string;
  destinationName: string;
  constructor(
    index: number,
    inputBase: string,
    inputSourceDirectory: string,
    inputSourceName: string,
    inputDestinationDirectory: string,
    inputDestinationName: string,
    sourceFullBase: string,
    sourceFull: string,
    sourceDirectory: string,
    sourceName: string,
    destinationFull: string,
    destinationDirectory: string,
    destinationName: string
  ) {
    this.index = index;
    this.inputBase = inputBase;
    this.inputSourceDirectory = inputSourceDirectory;
    this.inputSourceName = inputSourceName;
    this.inputDestinationDirectory = inputDestinationDirectory;
    this.inputDestinationName = inputDestinationName;
    this.sourceFullBase = sourceFullBase;
    this.sourceFull = sourceFull;
    this.sourceDirectory = sourceDirectory;
    this.sourceName = sourceName;
    this.destinationFull = destinationFull;
    this.destinationDirectory = destinationDirectory;
    this.destinationName = destinationName;
  }
}

const inputData: TransportResult[] = [
  new TransportResult(
    1,
    'base',
    'SDir',
    'Sname',
    'Ddir',
    'Dname',
    'base\\SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'Ddir\\Dname',
    'Ddir',
    'Dname'
  ),
  new TransportResult(
    2,
    'base',
    'SDir',
    'Sname',
    'Ddir',
    '',
    'base\\SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'Ddir\\Sname',
    'Ddir',
    'Sname'
  ),
  new TransportResult(
    3,
    'base',
    'SDir',
    'Sname',
    '',
    'Dname',
    'base\\SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'SDir\\Dname',
    'SDir',
    'Dname'
  ),
  new TransportResult(
    4,
    'base',
    'SDir',
    'Sname',
    '',
    '',
    'base\\SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'SDir\\Sname',
    'SDir',
    'Sname'
  ),
  new TransportResult(
    5,
    'base',
    'SDir',
    '',
    'Ddir',
    '',
    'base\\SDir',
    'SDir',
    'SDir',
    '',
    'Ddir',
    'Ddir',
    ''
  ),
  new TransportResult(
    6,
    'base',
    'SDir',
    '',
    '',
    '',
    'base\\SDir',
    'SDir',
    'SDir',
    '',
    'SDir',
    'SDir',
    ''
  ),
  new TransportResult(
    7,
    'base',
    '',
    '',
    '',
    '',
    'base',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    8,
    'base',
    '',
    '',
    'Ddir',
    '',
    'base',
    '',
    '',
    '',
    'Ddir',
    'Ddir',
    ''
  ),
  new TransportResult(
    9,
    'base',
    '',
    'Sname',
    'Ddir',
    'Dname',
    'base\\Sname',
    'Sname',
    '',
    'Sname',
    'Ddir\\Dname',
    'Ddir',
    'Dname'
  ),
  new TransportResult(
    10,
    'base',
    '',
    'Sname',
    'Ddir',
    '',
    'base\\Sname',
    'Sname',
    '',
    'Sname',
    'Ddir\\Sname',
    'Ddir',
    'Sname'
  ),
  new TransportResult(
    11,
    'base',
    '',
    'Sname',
    '',
    'Dname',
    'base\\Sname',
    'Sname',
    '',
    'Sname',
    'Dname',
    '',
    'Dname'
  ),
  new TransportResult(
    12,
    'base',
    '',
    'Sname',
    '',
    '',
    'base\\Sname',
    'Sname',
    '',
    'Sname',
    'Sname',
    '',
    'Sname'
  ),
  new TransportResult(
    13,
    '',
    'SDir',
    'Sname',
    'Ddir',
    'Dname',
    'SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'Ddir\\Dname',
    'Ddir',
    'Dname'
  ),
  new TransportResult(
    14,
    '',
    'SDir',
    'Sname',
    'Ddir',
    '',
    'SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'Ddir\\Sname',
    'Ddir',
    'Sname'
  ),
  new TransportResult(
    15,
    '',
    'SDir',
    'Sname',
    '',
    'Dname',
    'SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'SDir\\Dname',
    'SDir',
    'Dname'
  ),
  new TransportResult(
    16,
    '',
    'SDir',
    'Sname',
    '',
    '',
    'SDir\\Sname',
    'SDir\\Sname',
    'SDir',
    'Sname',
    'SDir\\Sname',
    'SDir',
    'Sname'
  ),
  new TransportResult(
    17,
    '',
    'SDir',
    '',
    'Ddir',
    '',
    'SDir',
    'SDir',
    'SDir',
    '',
    'Ddir',
    'Ddir',
    ''
  ),
  new TransportResult(
    18,
    '',
    'SDir',
    '',
    '',
    '',
    'SDir',
    'SDir',
    'SDir',
    '',
    'SDir',
    'SDir',
    ''
  ),
  new TransportResult(
    19,
    '',
    '',
    'Sname',
    'Ddir',
    'Dname',
    'Sname',
    'Sname',
    '',
    'Sname',
    'Ddir\\Dname',
    'Ddir',
    'Dname'
  ),
  new TransportResult(
    20,
    '',
    '',
    'Sname',
    'Ddir',
    '',
    'Sname',
    'Sname',
    '',
    'Sname',
    'Ddir\\Sname',
    'Ddir',
    'Sname'
  ),
  new TransportResult(
    21,
    '',
    '',
    'Sname',
    '',
    'Dname',
    'Sname',
    'Sname',
    '',
    'Sname',
    'Dname',
    '',
    'Dname'
  ),
  new TransportResult(
    22,
    '',
    '',
    'Sname',
    '',
    '',
    'Sname',
    'Sname',
    '',
    'Sname',
    'Sname',
    '',
    'Sname'
  ),
];

const createTransportInformation = (result: TransportResult) => {
  return new FileTransportInfo({
    basePath: result.inputBase,
    sourceFilename: result.inputSourceName,
    sourceFolderName: result.inputSourceDirectory,
    destinationFileName: result.inputDestinationName,
    destinationFolderName: result.inputDestinationDirectory,
  });
};
const compare = (expected: TransportResult, source: FileTransportInfo) => {
  expect(expected.sourceFullBase).toEqual(source.sourceFullNameWithBasePath);
  expect(expected.sourceFull).toEqual(source.sourceFullName);
  expect(expected.sourceDirectory).toEqual(source.sourceFolderName);
  expect(expected.sourceName).toEqual(source.sourceFileName);
  expect(expected.destinationFull).toEqual(source.destinationFullName);
  expect(expected.destinationDirectory).toEqual(source.destinationPath);
  expect(expected.destinationName).toEqual(source.destinationFileName);
};
test.each(inputData)('Case $result.index', (result) => {
  const info: FileTransportInfo = createTransportInformation(result);
  compare(result, info);
});

const invalidInputdata: TransportResult[] = [
  new TransportResult(
    1,
    'base',
    'SDir',
    '',
    'Ddir',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    2,
    'base',
    'SDir',
    '',
    '',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    3,
    'base',
    '',
    '',
    'Ddir',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    4,
    'base',
    '',
    '',
    '',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    5,
    '',
    'SDir',
    '',
    'Ddir',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    6,
    '',
    'SDir',
    '',
    '',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(
    7,
    '',
    '',
    '',
    'Ddir',
    'Dname',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ),
  new TransportResult(8, '', '', '', 'Ddir', '', '', '', '', '', '', '', ''),
  new TransportResult(9, '', '', '', '', 'Dname', '', '', '', '', '', '', ''),
];

test.each(invalidInputdata)('Invalid Case $result.index', (result) => {
  expect(() => {
    createTransportInformation(result);
  }).toThrow('Invalid Parameter');
});
