export default interface Student {
  id: string;
  name: string;
  main: MainInstrument;
  castings: Casting[];
  lesson?: FivePMStartLesson | TwoPMStartLesson;
}

export interface Casting {
  songID: string;
  inst: CastingInst;
}

export interface SongCasting {
  inst: CastingInst;
  studentName: string;
}

export const ALL_INSTRUMENTS = ['Guitar', 'Bass', 'Drums', 'Keys', 'Vocals'] as const;
type InstrumentTuple = typeof ALL_INSTRUMENTS;
export type MainInstrument = InstrumentTuple[number];

export const ALL_CAST_INST = ['gtr1', 'gtr2', 'gtr3', 'bass', 'drums', 'keys1', 'keys2', 'keys3', 'vox', 'bgVox1', 'bgVox2', 'bgVox3'] as const;
type CastInstTuple = typeof ALL_CAST_INST;
export type CastingInst = CastInstTuple[number];

export const FIVE_PM_LESSONS = ['5:00', '5:45', '6:30', '7:15'] as const;
type FivePMLessonTuple = typeof FIVE_PM_LESSONS;
export type FivePMStartLesson = FivePMLessonTuple[number];

export const TWO_PM_LESSONS = ['2:00', '2:45', '3:30', '4:15'] as const;
type TwoPMLessonTuple = typeof TWO_PM_LESSONS;
export type TwoPMStartLesson = TwoPMLessonTuple[number];
