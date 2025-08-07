import { CastingInst } from './student';

export default interface Song {
  id: number;
  name: string;
  artist?: string;
  color: string;
}

export interface CastSong extends Song {
  cast: Record<CastingInst, string | undefined>;
}

export const initialCasting = { gtr1: '', gtr2: '', gtr3: '', bass: '', drums: '', keys1: '', keys2: '', keys3: '', vox: '', bgVox1: '', bgVox2: '', bgVox3: '' };

export const instAndFullNames: [string, CastingInst][] = [
  ['Guitar 1', 'gtr1'],
  ['Guitar 2', 'gtr2'],
  ['Guitar 3', 'gtr3'],
  ['Bass', 'bass'],
  ['Drums', 'drums'],
  ['Keys 1', 'keys1'],
  ['Keys 2', 'keys2'],
  ['Keys 3', 'keys3'],
  ['Lead Vox', 'vox'],
  ['BG Vox 1', 'bgVox1'],
  ['BG Vox 2', 'bgVox2'],
  ['Extras', 'bgVox3'],
];
