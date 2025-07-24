// src/lib/mock-data.ts

import { Case, Party, Document, User } from './types';

export const mockUsers: User[] = [
  { 
    id: 'U001', 
    name: 'Jane Doe', 
    email: 'jane.doe@example.com',
    role: 'RM',
    isActive: true
  },
  { 
    id: 'U002', 
    name: 'John Smith', 
    email: 'john.smith@example.com',
    role: 'Checker',
    isActive: true
  },
  { 
    id: 'U004', 
    name: 'Mary Anne', 
    email: 'mary.anne@example.com',
    role: 'Compliance',
    isActive: true
  },
  { 
    id: 'U003', 
    name: 'George Chan', 
    email: 'george.chan@example.com',
    role: 'GM',
    isActive: true
  },
];

export const mockParties: Party[] = [
  { 
    partyId: 'P001', 
    name: 'John Tan',
    type: 'Individual',
    residencyStatus: 'Singaporean/PR', 
    isPEP: false,
    isSanctioned: false,
    riskFactors: [],
    address: {
      line1: '123 Main Street',
      city: 'Singapore',
      postalCode: '123456',
      country: 'SG'
    },
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System'
  },
  { 
    partyId: 'P002', 
    name: 'Michael Lim',
    type: 'Individual',
    residencyStatus: 'Singaporean/PR', 
    isPEP: false,
    isSanctioned: false,
    riskFactors: [],
    address: {
      line1: '456 Orchard Road',
      city: 'Singapore',
      postalCode: '238888',
      country: 'SG'
    },
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System'
  },
  { 
    partyId: 'P003', 
    name: 'Sarah Chen',
    type: 'Individual',
    residencyStatus: 'Foreigner', 
    isPEP: false,
    isSanctioned: false,
    riskFactors: [],
    address: {
      line1: '789 Marina Bay',
      city: 'Singapore',
      postalCode: '018956',
      country: 'SG'
    },
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System'
  },
  { 
    partyId: 'P004', 
    name: 'David Lim',
    type: 'Individual',
    residencyStatus: 'Singaporean/PR', 
    isPEP: false,
    isSanctioned: false,
    riskFactors: [],
    address: {
      line1: '321 Bukit Timah Road',
      city: 'Singapore',
      postalCode: '259770',
      country: 'SG'
    },
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System'
  },
  { 
    partyId: 'P005', 
    name: 'Jessica Tan',
    type: 'Individual',
    residencyStatus: 'Singaporean/PR', 
    isPEP: false,
    isSanctioned: false,
    riskFactors: [],
    address: {
      line1: '654 East Coast Road',
      city: 'Singapore',
      postalCode: '429123',
      country: 'SG'
    },
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System'
  },
  { 
    partyId: 'P006', 
    name: 'Robert Wang',
    type: 'Individual',
    residencyStatus: 'Foreigner', 
    isPEP: true,
    isSanctioned: false,
    riskFactors: ['PEP', 'Foreign National'],
    address: {
      line1: '987 Sentosa Cove',
      city: 'Singapore',
      postalCode: '098297',
      country: 'SG'
    },
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'System'
  },
];

export const mockDocuments: Document[] = [
  { 
    docId: 'DOC001', 
    ownerPartyId: 'P001', 
    docType: 'Identity Document / NRIC / Birth Certificate',
    category: 'Identity',
    fileName: 'john_tan_nric.pdf',
    fileSize: 2048000,
    mimeType: 'application/pdf',
    isVerified: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Jane Doe'
  },
  { 
    docId: 'DOC002', 
    ownerPartyId: 'P004', 
    docType: 'Identity Document / NRIC / Birth Certificate',
    category: 'Identity',
    fileName: 'david_lim_nric.pdf',
    fileSize: 1536000,
    mimeType: 'application/pdf',
    isVerified: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Jane Doe'
  },
  { 
    docId: 'DOC003', 
    ownerPartyId: 'P005', 
    docType: 'Identity Document / NRIC / Birth Certificate',
    category: 'Identity',
    fileName: 'jessica_tan_nric.pdf',
    fileSize: 1792000,
    mimeType: 'application/pdf',
    isVerified: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Jane Doe'
  },
  { 
    docId: 'DOC004', 
    ownerPartyId: 'P006', 
    docType: 'Passport',
    category: 'Identity',
    fileName: 'robert_wang_passport.pdf',
    fileSize: 3072000,
    mimeType: 'application/pdf',
    isVerified: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Jane Doe'
  },
];

export const mockCases: Case[] = [
  {
    caseId: 'CASE-2025-001',
    status: 'Draft',
    riskLevel: 'Medium',
    priority: 'Normal',
    assignedTo: 'Jane Doe',
    entityData: {
      entityName: 'TechStart Innovations Pte Ltd',
      entityType: 'Non-Listed Company',
      taxId: '202412345A',
      registeredAddress: {
        line1: '71 Ayer Rajah Crescent',
        line2: '#02-18',
        city: 'Singapore',
        postalCode: '139951',
        country: 'SG'
      }
    },
    relatedPartyLinks: [
      { 
        partyId: 'P001', 
        relationshipType: 'Director',
        isPrimary: true
      }
    ],
    accounts: [],
    accountApprovalSnapshots: [],
    activities: [
      {
        id: 'A1',
        timestamp: new Date().toISOString(),
        actor: 'System',
        actorRole: 'Admin',
        actorId: 'SYSTEM',
        action: 'Case Created',
        actionType: 'Create',
        entityType: 'Case',
        entityId: 'CASE-2025-001'
      }
    ],
    documentLinks: [
      {
        linkId: 'LNK-INIT-1',
        requirementId: 'req-party-P001-0',
        requirementType: 'Standard',
        isMandatory: true,
        submissions: [
          {
            submissionId: 'SUB-INIT-1',
            masterDocId: 'DOC001',
            status: 'Verified',
            submittedAt: new Date().toISOString(),
            submittedBy: 'Jane Doe',
            submissionMethod: 'Upload',
            comments: [],
            complianceReviewedAt: new Date().toISOString(),
            complianceReviewedBy: 'Mary Anne'
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    caseId: 'CASE-2025-002',
    status: 'Pending Checker Review',
    riskLevel: 'Low',
    priority: 'Normal',
    assignedTo: 'John Smith',
    entityData: {
      entityName: 'Lim & Tan Legal Associates',
      entityType: 'Partnership',
      taxId: 'T12PF3456G',
      registeredAddress: {
        line1: '1 Raffles Place',
        line2: '#44-01',
        city: 'Singapore',
        postalCode: '048616',
        country: 'SG'
      }
    },
    relatedPartyLinks: [
      { 
        partyId: 'P004', 
        relationshipType: 'Partner',
        isPrimary: true
      },
      { 
        partyId: 'P005', 
        relationshipType: 'Partner',
        isPrimary: true
      }
    ],
    accounts: [],
    accountApprovalSnapshots: [],
    activities: [
      {
        id: 'A1',
        timestamp: new Date().toISOString(),
        actor: 'System',
        actorRole: 'Admin',
        actorId: 'SYSTEM',
        action: 'Case Created',
        actionType: 'Create',
        entityType: 'Case',
        entityId: 'CASE-2025-002'
      }
    ],
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    caseId: 'CASE-2025-003',
    status: 'Pending Compliance Review',
    riskLevel: 'High',
    priority: 'High',
    assignedTo: 'Susan Wong',
    entityData: {
      entityName: 'Global Wealth Trust',
      entityType: 'Trust',
      taxId: 'TRST98765B',
      registeredAddress: {
        line1: '8 Marina Blvd',
        city: 'Singapore',
        postalCode: '018981',
        country: 'SG'
      }
    },
    relatedPartyLinks: [
      { 
        partyId: 'P006', 
        relationshipType: 'Settlor',
        isPrimary: true
      }
    ],
    accounts: [],
    accountApprovalSnapshots: [],
    activities: [
      {
        id: 'A1',
        timestamp: new Date().toISOString(),
        actor: 'System',
        actorRole: 'Admin',
        actorId: 'SYSTEM',
        action: 'Case Created',
        actionType: 'Create',
        entityType: 'Case',
        entityId: 'CASE-2025-003'
      }
    ],
    documentLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];