// src/app/api/cases/[caseId]/documents/[requirementId]/submissions/[submissionId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockCases } from '@/lib/mock-data';

interface RouteParams {
  params: Promise<{
    caseId: string;
    requirementId: string;
    submissionId: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { caseId, requirementId, submissionId } = await params;
    const { newStatus, commentText } = await request.json();
    
    // In production, this would update the database
    // For now, we'll find and update the mock data
    const caseToUpdate = mockCases.find(c => c.caseId === caseId);
    if (!caseToUpdate) {
      return NextResponse.json(
        { error: `Case ${caseId} not found` },
        { status: 404 }
      );
    }
    
    // Mock implementation - update submission status
    const updatedCase = {
      ...caseToUpdate,
      documentLinks: caseToUpdate.documentLinks.map(link => {
        if (link.requirementId === requirementId) {
          return {
            ...link,
            submissions: link.submissions.map(submission => {
              if (submission.submissionId === submissionId) {
                const updatedSubmission = {
                  ...submission,
                  status: newStatus
                };
                
                // Add comment if provided
                if (commentText) {
                  updatedSubmission.comments = [
                    ...submission.comments,
                    {
                      commentId: `C-${Date.now()}`,
                      author: 'Current User', // In real app, get from auth
                      authorRole: 'RM' as const, // In real app, get from auth
                      timestamp: new Date().toISOString(),
                      text: commentText,
                      isInternal: false, // Add the required isInternal field
                      attachments: []
                    }
                  ];
                }
                
                // Update approval timestamps based on status
                if (newStatus === 'Pending Compliance Verification') {
                  updatedSubmission.checkerReviewedAt = new Date().toISOString();
                  updatedSubmission.checkerReviewedBy = 'Current User';
                } else if (newStatus === 'Verified') {
                  updatedSubmission.complianceReviewedAt = new Date().toISOString();
                  updatedSubmission.complianceReviewedBy = 'Current User';
                }
                
                return updatedSubmission;
              }
              return submission;
            })
          };
        }
        return link;
      }),
      activities: [
        ...caseToUpdate.activities,
        {
          id: `ACT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Current User',
          actorRole: 'RM' as const,
          actorId: 'U001',
          action: `Document submission updated`,
          actionType: 'Update' as const,
          entityType: 'Document' as const,
          entityId: submissionId,
          details: `Submission ${submissionId} status changed to ${newStatus}`
        }
      ]
    };
    
    return NextResponse.json(updatedCase);
  } catch (err) {
    console.error('Failed to update submission:', err);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}