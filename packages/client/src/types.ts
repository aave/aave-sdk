export type ErrorResponse<T extends string> = {
  __typename: T;
  reason: string;
};
