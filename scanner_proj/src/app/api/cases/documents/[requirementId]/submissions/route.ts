// src/app/api/cases/documents/[requirementId]/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mockCases } from '@/lib/mock-data';
import { Case, Submission } from '@/lib/types';

// Define proper types for route params
interface RouteParams {
  requirementId: string;
}

// Reuse the same store instance
class CaseStore {
  private cases: Case[] = [...mockCases];

  findCase(caseId: string) {
    return this.cases.find(c => c.caseId === caseId);
  }

  addSubmission(caseId: string, requirementId: string, submission: Submission) {
    const caseIndex = this.cases.findIndex(c => c.caseId === caseId);
    if (caseIndex === -1) return null;

    const linkIndex = this.cases[caseIndex].documentLinks.findIndex(
      l => l.requirementId === requirementId
    );

    if (linkIndex > -1) {
      // Add to existing link
      this.cases[caseIndex].documentLinks[linkIndex].submissions.push(submission);
    } else {
      // Create new link with required properties
      this.cases[caseIndex].documentLinks.push({
        linkId: `LNK-${Date.now()}`,
        requirementId,
        requirementType: 'Standard', // Default to Standard type
        isMandatory: true, // Default to mandatory
        submissions: [submission]
      });
    }

    return this.cases[caseIndex];
  }
}

const caseStore = new CaseStore();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { requirementId } = await params;
  const body = await request.json();
  const { caseId, ...submissionData } = body;

  if (!caseId) {
    return NextResponse.json({ error: 'caseId is required in request body' }, { status: 400 });
  }

  // In production, proxy to Spring Boot
  if (process.env.NODE_ENV === 'production' && process.env.SPRING_API_URL) {
    try {
      const response = await fetch(
        `${process.env.SPRING_API_URL}/cases/${caseId}/documents/${requirementId}/submissions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        }
      );
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to add submission' }, { status: 400 });
      }
      return NextResponse.json(await response.json());
    } catch (error) {
      console.error('Failed to add submission in Spring Boot:', error);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
  }

  // Development mock
  const newSubmission: Submission = {
    ...submissionData,
    submissionId: `SUB-${Date.now()}`,
    submissionMethod: submissionData.submissionMethod || 'Upload' // Ensure submissionMethod is set
  };

  const updatedCase = caseStore.addSubmission(caseId, requirementId, newSubmission);
  if (!updatedCase) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  return NextResponse.json(updatedCase);
}