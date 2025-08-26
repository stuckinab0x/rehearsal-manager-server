import { instAndFullNames } from './models/song';

export const createInputs = (count: number) => Array.from(new Array(count).keys()).map(x => ({ value: '', id: x }));

export function getFullInstName(inst: string) {
  return instAndFullNames.find(x => x[1] === inst)?.[0] as string;
}
