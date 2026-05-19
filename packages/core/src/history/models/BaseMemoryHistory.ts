export interface BaseMemoryHistory<
  TAction extends 'add' | 'delete' | 'update',
  TPreviousValue extends string | null,
  TValue extends string | null,
> {
  action: TAction;
  createdAt: Date;
  id: string;
  memoryId: string;
  previousValue: TPreviousValue;
  value: TValue;
}
