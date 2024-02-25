import Dexie, { type Table } from 'dexie';

export interface ownedMsgs {
    id: string;
}

export class OwnDb extends Dexie {
  ownedMsgs!: Table<ownedMsgs>; 

  constructor() {
    super('lowent-own');
    this.version(1).stores({
      ownedMsgs: '&id'
    });
  }
}

export const ownDb = new OwnDb();
