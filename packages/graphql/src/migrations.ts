import {
  MigrationExecutionPlanFragment,
  MigrationOpportunityFragment,
  MigrationPreviewFragment,
} from './fragments/migrations';
import { graphql, type RequestOf } from './graphql';

export const MigrationOpportunitiesQuery = graphql(
  `query MigrationOpportunities($request: MigrationOpportunitiesRequest!) {
    value: migrationOpportunities(request: $request) {
      ...MigrationOpportunity
    }
  }`,
  [MigrationOpportunityFragment],
);
export type MigrationOpportunitiesRequest = RequestOf<
  typeof MigrationOpportunitiesQuery
>;

export const MigrationBorrowPreviewQuery = graphql(
  `query MigrationBorrowPreview($request: MigrationBorrowPreviewRequest!) {
    value: migrationBorrowPreview(request: $request) {
      ...MigrationPreview
    }
  }`,
  [MigrationPreviewFragment],
);
export type MigrationBorrowPreviewRequest = RequestOf<
  typeof MigrationBorrowPreviewQuery
>;

export const MigrationEarnPreviewQuery = graphql(
  `query MigrationEarnPreview($request: MigrationEarnPreviewRequest!) {
    value: migrationEarnPreview(request: $request) {
      ...MigrationPreview
    }
  }`,
  [MigrationPreviewFragment],
);
export type MigrationEarnPreviewRequest = RequestOf<
  typeof MigrationEarnPreviewQuery
>;

export const MigratePositionQuery = graphql(
  `query MigratePosition($request: MigratePositionRequest!) {
    value: migratePosition(request: $request) {
      ...MigrationExecutionPlan
    }
  }`,
  [MigrationExecutionPlanFragment],
);
export type MigratePositionRequest = RequestOf<typeof MigratePositionQuery>;

export type MigratePositionSelection = ReturnType<
  typeof graphql.scalar<'MigratePositionSelection'>
>;
export type MigrateBorrowPositionInput = ReturnType<
  typeof graphql.scalar<'MigrateBorrowPositionInput'>
>;
export type MigrateEarnPositionInput = ReturnType<
  typeof graphql.scalar<'MigrateEarnPositionInput'>
>;
export type MigrationSignedPlanInput = ReturnType<
  typeof graphql.scalar<'MigrationSignedPlanInput'>
>;
