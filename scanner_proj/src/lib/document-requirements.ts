// src/lib/document-requirements.ts

import { DocumentRequirement } from '@/lib/types';

interface DocumentRequirementsTemplate {
  individualTemplates: {
    [key: string]: DocumentRequirement[];
  };
  entityTemplates: {
    [key: string]: DocumentRequirement[];
  };
  bankFormTemplates: {
    corporateMandatory: string[];
    individualStakeholder: string[];
    corporateOptional: string[];
  };
  accountOpeningForms: DocumentRequirement[];
  riskBasedDocuments: {
    [key: string]: DocumentRequirement[];
  };
  entityRoleMapping: {
    [key: string]: string[];
  };
}

export const documentRequirementsTemplate: DocumentRequirementsTemplate = {
  individualTemplates: {
    'Singaporean/PR': [
      { 
        name: 'Identity Document / NRIC / Birth Certificate', 
        category: 'Identity',
        required: true 
      }
    ],
    Foreigner: [
      { 
        name: 'Passport', 
        category: 'Identity',
        required: true, 
        validityMonths: 6 
      },
      { 
        name: 'Work Permit / Employment Pass', 
        category: 'Legal',
        required: true, 
        description: '(Only if employed in SG)' 
      },
      { 
        name: 'Proof of Residential Address', 
        category: 'Address',
        required: true, 
        validityMonths: 3, 
        description: '(Needed if address not on ID)' 
      }
    ]
  },
  
  entityTemplates: {
    'Individual Account': [],
    'Non-Listed Company': [
      { 
        name: 'ARCA / Questnet Search', 
        category: 'Corporate',
        required: true, 
        validityMonths: 1 
      },
      { 
        name: 'Certificate of Incorporation', 
        category: 'Corporate',
        required: true 
      },
      { 
        name: 'Memorandum & Articles of Association', 
        category: 'Corporate',
        required: true 
      }
    ],
    'Partnership': [
      { 
        name: 'Certificate of Partnership', 
        category: 'Corporate',
        required: true 
      },
      { 
        name: 'Partnership Deed / Agreement', 
        category: 'Legal',
        required: true 
      },
      { 
        name: 'ARCA / Questnet Search', 
        category: 'Corporate',
        required: true, 
        validityMonths: 1 
      }
    ],
    'Trust': [
      { 
        name: 'Declaration of Trusts / Registration', 
        category: 'Legal',
        required: true 
      },
      { 
        name: 'Trust Deed or Indenture of Trust', 
        category: 'Legal',
        required: true, 
        description: '(Sighted & CTC by bank officer)' 
      },
      { 
        name: 'Trustee Resolution', 
        category: 'Corporate',
        required: true, 
        validityMonths: 2 
      }
    ],
    // Add other entity types as needed
  },
  
  bankFormTemplates: {
    corporateMandatory: [
      'Signature Card',
      'Board Resolutions',
      'Account Application Form',
      'Declaration of Beneficial Owner(s) Form',
      'KYC Form'
    ],
    individualStakeholder: [
      'Signature Card',
      'Account Application Form',
      'Mandate Form',
      'FATCA & CRS Supplemental Form (Individuals)'
    ],
    corporateOptional: [
      'Cheque Book Requisition Form'
    ]
  },
  
  accountOpeningForms: [
    { 
      name: 'Account Application Form', 
      category: 'Other',
      required: true 
    },
    { 
      name: 'Signature Card', 
      category: 'Other',
      required: true 
    }
  ],
  
  riskBasedDocuments: {
    High: [
      { 
        name: 'Source of Wealth Declaration', 
        category: 'Financial',
        required: true 
      },
      { 
        name: 'GM Approval Memo', 
        category: 'Other',
        required: true 
      }
    ],
    Medium: [],
    Low: []
  },
  
  entityRoleMapping: {
    'Individual Account': ['Primary Holder'],
    'Non-Listed Company': [
      'Director',
      'Top Executive',
      'Authorised Signatory',
      'Beneficial Owner',
      'Power of Attorney'
    ],
    'Partnership': [
      'Partner',
      'Manager (LLP)',
      'Authorised Signatory',
      'Beneficial Owner'
    ],
    'Trust': [
      'Trustee',
      'Settlor',
      'Protector',
      'Authorised Signatory',
      'Beneficiary',
      'Ultimate Controller'
    ]
  }
};