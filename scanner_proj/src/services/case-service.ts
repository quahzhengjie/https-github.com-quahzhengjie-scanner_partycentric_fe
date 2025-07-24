// src/services/case-service.ts

import { ApiClient } from '@/lib/api-client';
import { Case, Submission, DocumentStatus, AccountStatus, EntityType } from '@/lib/types';

export class CaseService {

  
  static async getCases(): Promise<Case[]> {
    return ApiClient.cases.getAll();
  }
  
  static async getCase(caseId: string): Promise<Case> {
    return ApiClient.cases.getById(caseId);
  }
  
  static async createCase(entityName: string, entityType: EntityType): Promise<Case> {
    return ApiClient.cases.create({ entityName, entityType });
  }
  
  static async updateCase(caseId: string, updates: Partial<Case>): Promise<Case> {
    return ApiClient.cases.update(caseId, updates);
  }
  
  static async submitForReview(caseId: string): Promise<Case> {
    return ApiClient.cases.updateStatus(caseId, 'Pending Checker Review');
  }

  // Add these methods:
static async bulkSubmitForReview(caseIds: string[]): Promise<{ succeeded: string[], failed: string[] }> {
  return ApiClient.cases.bulkSubmitForReview(caseIds);
}

static async bulkAssign(caseIds: string[], assignedTo: string): Promise<{ succeeded: string[], failed: string[] }> {
  return ApiClient.cases.bulkAssign(caseIds, assignedTo);
}
  
  static async addSubmission(
    caseId: string,
    requirementId: string,
    submission: Omit<Submission, 'submissionId'>
  ): Promise<Case> {
    return ApiClient.cases.addSubmission(caseId, requirementId, submission);
  }
  
  static async updateSubmission(
    caseId: string,
    requirementId: string,
    submissionId: string,
    newStatus: DocumentStatus,
    commentText?: string
  ): Promise<Case> {
    return ApiClient.cases.updateSubmission(
      caseId,
      requirementId,
      submissionId,
      { newStatus, commentText }
    );
  }
  
  static async updateAccountStatus(
    caseId: string,
    accountId: string,
    status: AccountStatus
  ): Promise<Case> {
    return ApiClient.cases.updateAccountStatus(caseId, accountId, status);
  }
}

