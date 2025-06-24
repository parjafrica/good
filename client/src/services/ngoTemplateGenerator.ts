interface NGODetails {
  name: string;
  mission: string;
  vision: string;
  sector: string;
  country: string;
  registrationNumber?: string;
  address: string;
  website?: string;
  email: string;
  phone: string;
  foundedYear: number;
  legalStructure: 'nonprofit' | 'ngo' | 'charity' | 'foundation' | 'social_enterprise';
  boardMembers: Array<{
    name: string;
    position: string;
    background: string;
  }>;
  keyStaff: Array<{
    name: string;
    position: string;
    qualifications: string;
  }>;
  targetBeneficiaries: string;
  geographicScope: string;
  annualBudget?: number;
  fundingSources: string[];
}

interface BrandAssets {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
  brandGuidelines: string;
}

interface DocumentTemplate {
  id: string;
  title: string;
  type: 'policy' | 'procedure' | 'governance' | 'compliance' | 'operational';
  content: string;
  lastUpdated: Date;
  version: string;
  approvedBy?: string;
}

class NGOTemplateGenerator {
  private documentTemplates: Map<string, DocumentTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Initialize all standard NGO document templates
    const templates = [
      'anti-money-laundering',
      'anti-sexual-harassment',
      'financial-management',
      'procurement-asset-management',
      'human-resource-recruitment',
      'conflict-of-interest',
      'fraud-bribery-corruption',
      'whistleblower-protection',
      'code-of-conduct',
      'data-protection',
      'risk-management',
      'governance-board-charter',
      'internal-control',
      'banking-cash-handling',
      'donor-compliance',
      'document-retention'
    ];

    templates.forEach(templateId => {
      this.documentTemplates.set(templateId, this.createTemplate(templateId));
    });
  }

  async generateNGOPackage(ngoDetails: NGODetails): Promise<{
    brandAssets: BrandAssets;
    documents: DocumentTemplate[];
    website: string;
    logoVariations: string[];
    mockups: string[];
  }> {
    console.log('Generating comprehensive NGO package for:', ngoDetails.name);

    // Generate brand assets
    const brandAssets = await this.generateBrandAssets(ngoDetails);

    // Generate all policy documents
    const documents = await this.generateAllDocuments(ngoDetails);

    // Generate website mockup
    const website = await this.generateWebsiteMockup(ngoDetails, brandAssets);

    // Generate logo variations
    const logoVariations = await this.generateLogoVariations(ngoDetails, brandAssets);

    // Generate mockups
    const mockups = await this.generateMockups(ngoDetails, brandAssets);

    return {
      brandAssets,
      documents,
      website,
      logoVariations,
      mockups
    };
  }

  private async generateBrandAssets(ngoDetails: NGODetails): Promise<BrandAssets> {
    // Generate color palette based on sector
    const colorPalettes = {
      'Education': { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
      'Health': { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444' },
      'Environment': { primary: '#16a34a', secondary: '#15803d', accent: '#22c55e' },
      'Human Rights': { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
      'Economic Development': { primary: '#ea580c', secondary: '#c2410c', accent: '#f97316' },
      'default': { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8' }
    };

    const colors = colorPalettes[ngoDetails.sector as keyof typeof colorPalettes] || colorPalettes.default;

    return {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      logoUrl: await this.generateLogo(ngoDetails, colors),
      fontFamily: 'Inter, system-ui, sans-serif',
      brandGuidelines: this.generateBrandGuidelines(ngoDetails, colors)
    };
  }

  private async generateLogo(ngoDetails: NGODetails, colors: any): Promise<string> {
    // Generate SVG logo based on organization name and sector
    const initials = ngoDetails.name.split(' ').map(word => word[0]).join('').slice(0, 3);
    
    const logoSvg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#logoGradient)" />
        <text x="100" y="115" font-family="Inter, sans-serif" font-size="48" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
        <circle cx="100" cy="100" r="90" fill="none" stroke="${colors.secondary}" stroke-width="4" />
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(logoSvg)}`;
  }

  private generateBrandGuidelines(ngoDetails: NGODetails, colors: any): string {
    return `
# ${ngoDetails.name} Brand Guidelines

## Mission Statement
${ngoDetails.mission}

## Vision Statement
${ngoDetails.vision}

## Color Palette
- **Primary Color**: ${colors.primary}
- **Secondary Color**: ${colors.secondary}
- **Accent Color**: ${colors.accent}

## Typography
- **Primary Font**: Inter (headings and body text)
- **Secondary Font**: System fonts as fallback

## Logo Usage
- Minimum size: 32px height
- Clear space: 1/2 logo height on all sides
- Use on light backgrounds primarily
- Maintain aspect ratio at all times

## Voice & Tone
- Professional yet approachable
- Empathetic and inspiring
- Clear and accessible language
- Focus on impact and outcomes

## Applications
- Website headers and footers
- Business cards and letterheads
- Proposal documents
- Social media profiles
- Signage and banners
`;
  }

  private async generateAllDocuments(ngoDetails: NGODetails): Promise<DocumentTemplate[]> {
    const documents: DocumentTemplate[] = [];

    for (const [templateId, template] of this.documentTemplates) {
      const customizedDocument = await this.customizeDocument(template, ngoDetails);
      documents.push(customizedDocument);
    }

    return documents;
  }

  private createTemplate(templateId: string): DocumentTemplate {
    const templates = {
      'anti-money-laundering': {
        title: 'Anti-Money Laundering (AML) and Counter-Terrorism Financing Policy',
        type: 'compliance' as const,
        content: this.getAMLTemplate()
      },
      'anti-sexual-harassment': {
        title: 'Anti-Sexual Harassment Policy',
        type: 'policy' as const,
        content: this.getAntiHarassmentTemplate()
      },
      'financial-management': {
        title: 'Financial Management Policy',
        type: 'policy' as const,
        content: this.getFinancialManagementTemplate()
      },
      'procurement-asset-management': {
        title: 'Procurement and Asset Management Policy',
        type: 'operational' as const,
        content: this.getProcurementTemplate()
      },
      'human-resource-recruitment': {
        title: 'Human Resource and Recruitment Policy',
        type: 'policy' as const,
        content: this.getHRTemplate()
      },
      'conflict-of-interest': {
        title: 'Conflict of Interest Policy',
        type: 'governance' as const,
        content: this.getConflictOfInterestTemplate()
      },
      'fraud-bribery-corruption': {
        title: 'Fraud, Bribery and Corruption Policy',
        type: 'compliance' as const,
        content: this.getFraudTemplate()
      },
      'whistleblower-protection': {
        title: 'Whistleblower Protection Policy',
        type: 'governance' as const,
        content: this.getWhistleblowerTemplate()
      },
      'code-of-conduct': {
        title: 'Code of Conduct and Ethics',
        type: 'governance' as const,
        content: this.getCodeOfConductTemplate()
      },
      'data-protection': {
        title: 'Data Protection and Confidentiality Policy',
        type: 'compliance' as const,
        content: this.getDataProtectionTemplate()
      },
      'risk-management': {
        title: 'Risk Management Framework',
        type: 'governance' as const,
        content: this.getRiskManagementTemplate()
      },
      'governance-board-charter': {
        title: 'Governance and Board Charter',
        type: 'governance' as const,
        content: this.getBoardCharterTemplate()
      },
      'internal-control': {
        title: 'Internal Control Framework',
        type: 'operational' as const,
        content: this.getInternalControlTemplate()
      },
      'banking-cash-handling': {
        title: 'Banking and Cash Handling Procedures',
        type: 'procedure' as const,
        content: this.getBankingTemplate()
      },
      'donor-compliance': {
        title: 'Donor Compliance and Grant Management Policy',
        type: 'compliance' as const,
        content: this.getDonorComplianceTemplate()
      },
      'document-retention': {
        title: 'Document Retention and Archiving Policy',
        type: 'operational' as const,
        content: this.getDocumentRetentionTemplate()
      }
    };

    const template = templates[templateId as keyof typeof templates];
    
    return {
      id: templateId,
      title: template.title,
      type: template.type,
      content: template.content,
      lastUpdated: new Date(),
      version: '1.0',
      approvedBy: 'Board of Directors'
    };
  }

  private async customizeDocument(template: DocumentTemplate, ngoDetails: NGODetails): Promise<DocumentTemplate> {
    let customizedContent = template.content;

    // Replace placeholders with actual NGO details
    const replacements = {
      '[ORGANIZATION_NAME]': ngoDetails.name,
      '[ORGANIZATION_MISSION]': ngoDetails.mission,
      '[ORGANIZATION_ADDRESS]': ngoDetails.address,
      '[ORGANIZATION_EMAIL]': ngoDetails.email,
      '[ORGANIZATION_PHONE]': ngoDetails.phone,
      '[ORGANIZATION_WEBSITE]': ngoDetails.website || 'www.example.org',
      '[ORGANIZATION_COUNTRY]': ngoDetails.country,
      '[ORGANIZATION_SECTOR]': ngoDetails.sector,
      '[CURRENT_DATE]': new Date().toLocaleDateString(),
      '[CURRENT_YEAR]': new Date().getFullYear().toString(),
      '[BOARD_CHAIR]': ngoDetails.boardMembers[0]?.name || 'Board Chairperson',
      '[EXECUTIVE_DIRECTOR]': ngoDetails.keyStaff.find(staff => staff.position.toLowerCase().includes('director'))?.name || 'Executive Director'
    };

    for (const [placeholder, replacement] of Object.entries(replacements)) {
      customizedContent = customizedContent.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return {
      ...template,
      content: customizedContent
    };
  }

  private async generateWebsiteMockup(ngoDetails: NGODetails, brandAssets: BrandAssets): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ngoDetails.name} - ${ngoDetails.sector} Organization</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${brandAssets.fontFamily}; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        header { background: linear-gradient(135deg, ${brandAssets.primaryColor}, ${brandAssets.accentColor}); color: white; padding: 1rem 0; }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        nav ul { display: flex; list-style: none; gap: 2rem; }
        nav a { color: white; text-decoration: none; }
        
        .hero { background: ${brandAssets.primaryColor}; color: white; padding: 4rem 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .btn { background: ${brandAssets.accentColor}; color: white; padding: 1rem 2rem; border: none; border-radius: 5px; font-size: 1rem; cursor: pointer; }
        
        .section { padding: 4rem 0; }
        .section:nth-child(even) { background: #f8f9fa; }
        .section h2 { text-align: center; margin-bottom: 2rem; color: ${brandAssets.primaryColor}; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        
        footer { background: #333; color: white; padding: 2rem 0; text-align: center; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo">${ngoDetails.name}</div>
                <nav>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#programs">Programs</a></li>
                        <li><a href="#impact">Impact</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <h1>Transforming Lives Through ${ngoDetails.sector}</h1>
            <p>${ngoDetails.mission}</p>
            <button class="btn">Get Involved</button>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <h2>Our Impact</h2>
            <div class="grid">
                <div class="card">
                    <h3>Our Mission</h3>
                    <p>${ngoDetails.mission}</p>
                </div>
                <div class="card">
                    <h3>Our Vision</h3>
                    <p>${ngoDetails.vision}</p>
                </div>
                <div class="card">
                    <h3>Our Reach</h3>
                    <p>Serving communities across ${ngoDetails.geographicScope} with focus on ${ngoDetails.targetBeneficiaries}.</p>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${ngoDetails.name}. All rights reserved.</p>
            <p>${ngoDetails.address} | ${ngoDetails.email} | ${ngoDetails.phone}</p>
        </div>
    </footer>
</body>
</html>
    `;
  }

  private async generateLogoVariations(ngoDetails: NGODetails, brandAssets: BrandAssets): Promise<string[]> {
    const variations = [];
    const initials = ngoDetails.name.split(' ').map(word => word[0]).join('').slice(0, 3);

    // Horizontal logo
    const horizontalLogo = `
      <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="${brandAssets.primaryColor}" />
        <text x="50" y="58" font-family="Inter, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
        <text x="110" y="35" font-family="Inter, sans-serif" font-size="18" font-weight="bold" 
              fill="${brandAssets.primaryColor}">${ngoDetails.name}</text>
        <text x="110" y="55" font-family="Inter, sans-serif" font-size="12" 
              fill="${brandAssets.secondaryColor}">${ngoDetails.sector} Organization</text>
      </svg>
    `;

    // Monogram logo
    const monogramLogo = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="${brandAssets.primaryColor}" />
        <text x="50" y="60" font-family="Inter, sans-serif" font-size="32" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `;

    // Text-only logo
    const textLogo = `
      <svg width="250" height="60" viewBox="0 0 250 60" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="35" font-family="Inter, sans-serif" font-size="24" font-weight="bold" 
              fill="${brandAssets.primaryColor}">${ngoDetails.name}</text>
        <text x="0" y="55" font-family="Inter, sans-serif" font-size="12" 
              fill="${brandAssets.secondaryColor}">${ngoDetails.sector.toUpperCase()}</text>
      </svg>
    `;

    variations.push(
      `data:image/svg+xml;base64,${btoa(horizontalLogo)}`,
      `data:image/svg+xml;base64,${btoa(monogramLogo)}`,
      `data:image/svg+xml;base64,${btoa(textLogo)}`
    );

    return variations;
  }

  private async generateMockups(ngoDetails: NGODetails, brandAssets: BrandAssets): Promise<string[]> {
    // Generate mockups for business cards, letterheads, etc.
    const mockups = [];

    // Business card mockup
    const businessCard = `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="white" stroke="#ddd" stroke-width="1" />
        <rect x="0" y="0" width="350" height="60" fill="${brandAssets.primaryColor}" />
        <text x="20" y="35" font-family="Inter, sans-serif" font-size="18" font-weight="bold" 
              fill="white">${ngoDetails.name}</text>
        <text x="20" y="90" font-family="Inter, sans-serif" font-size="14" font-weight="bold" 
              fill="${brandAssets.primaryColor}">Executive Director</text>
        <text x="20" y="110" font-family="Inter, sans-serif" font-size="12" 
              fill="#666">${ngoDetails.email}</text>
        <text x="20" y="130" font-family="Inter, sans-serif" font-size="12" 
              fill="#666">${ngoDetails.phone}</text>
        <text x="20" y="150" font-family="Inter, sans-serif" font-size="12" 
              fill="#666">${ngoDetails.website || 'www.example.org'}</text>
      </svg>
    `;

    mockups.push(`data:image/svg+xml;base64,${btoa(businessCard)}`);

    return mockups;
  }

  // Document template methods
  private getAMLTemplate(): string {
    return `
# Anti-Money Laundering (AML) and Counter-Terrorism Financing Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0
**Approved By:** [BOARD_CHAIR]

## 1. PURPOSE AND SCOPE

This Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) Policy establishes [ORGANIZATION_NAME]'s commitment to preventing money laundering and terrorism financing activities. This policy applies to all staff, volunteers, board members, and partners.

## 2. POLICY STATEMENT

[ORGANIZATION_NAME] is committed to:
- Preventing the use of our organization for money laundering or terrorism financing
- Complying with all applicable AML/CTF laws and regulations
- Implementing robust due diligence procedures
- Maintaining accurate records and reporting suspicious activities

## 3. DEFINITIONS

**Money Laundering:** The process of making illegally obtained money appear legitimate.
**Terrorism Financing:** The provision of funds or financial services for terrorist purposes.
**Beneficial Owner:** The natural person who ultimately owns or controls a legal entity.

## 4. DUE DILIGENCE PROCEDURES

### 4.1 Donor Due Diligence
- Verify identity of all donors contributing over $1,000
- Screen donors against sanctions lists
- Assess source of funds for large donations
- Document due diligence procedures

### 4.2 Partner Due Diligence
- Conduct background checks on all implementing partners
- Verify legal status and registration
- Assess reputation and track record
- Monitor ongoing relationships

## 5. RECORD KEEPING

- Maintain records for minimum 7 years
- Document all transactions over $1,000
- Keep copies of identification documents
- Maintain audit trail for all financial transactions

## 6. REPORTING REQUIREMENTS

### 6.1 Suspicious Activity Reporting
Staff must immediately report:
- Unusual transaction patterns
- Requests for anonymity
- Transactions involving sanctioned entities
- Any suspicious donor behavior

### 6.2 Reporting Process
1. Report to Compliance Officer within 24 hours
2. Document all relevant information
3. File reports with relevant authorities as required
4. Maintain confidentiality

## 7. TRAINING AND AWARENESS

- Annual AML/CTF training for all staff
- Specialized training for finance team
- Regular updates on regulatory changes
- Documentation of training completion

## 8. COMPLIANCE MONITORING

- Regular internal audits
- External compliance reviews
- Continuous monitoring of transactions
- Annual policy review and updates

## 9. SANCTIONS COMPLIANCE

- Screen all donors, partners, and beneficiaries against sanctions lists
- Use automated screening tools where possible
- Maintain updated sanctions databases
- Document screening procedures

## 10. CONSEQUENCES OF NON-COMPLIANCE

Violations of this policy may result in:
- Disciplinary action up to termination
- Legal prosecution
- Regulatory sanctions
- Reputational damage

## 11. POLICY REVIEW

This policy will be reviewed annually and updated as necessary to reflect changes in regulations and best practices.

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
**Next Review Date:** [CURRENT_DATE + 1 year]
`;
  }

  private getAntiHarassmentTemplate(): string {
    return `
# Anti-Sexual Harassment Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0
**Approved By:** [BOARD_CHAIR]

## 1. PURPOSE

[ORGANIZATION_NAME] is committed to providing a safe, respectful, and harassment-free environment for all employees, volunteers, beneficiaries, and stakeholders. This policy prohibits sexual harassment in all its forms.

## 2. SCOPE

This policy applies to:
- All employees and volunteers
- Board members and consultants
- Partners and contractors
- All work-related activities and locations

## 3. DEFINITION OF SEXUAL HARASSMENT

Sexual harassment includes:
- Unwelcome sexual advances
- Requests for sexual favors
- Verbal or physical conduct of a sexual nature
- Creating a hostile work environment
- Quid pro quo harassment

### Examples Include:
- Inappropriate touching or physical contact
- Sexual comments, jokes, or innuendos
- Display of sexually explicit materials
- Unwanted romantic advances
- Sexual assault or coercion

## 4. PROHIBITED CONDUCT

The following behaviors are strictly prohibited:
- Any form of sexual harassment
- Retaliation against complainants
- Creating intimidating environments
- Abuse of power for sexual purposes
- Failure to report known incidents

## 5. REPORTING PROCEDURES

### 5.1 How to Report
Incidents can be reported to:
- Direct supervisor
- Human Resources Manager
- Executive Director
- External hotline: [PHONE NUMBER]
- Anonymous reporting system

### 5.2 Reporting Timeline
- Report incidents as soon as possible
- No time limit for reporting
- Immediate reporting for serious incidents

## 6. INVESTIGATION PROCESS

### 6.1 Initial Response
- Acknowledge receipt within 24 hours
- Ensure complainant safety
- Preserve evidence
- Maintain confidentiality

### 6.2 Investigation Steps
1. Assign trained investigator
2. Interview complainant and witnesses
3. Interview accused party
4. Gather relevant evidence
5. Document findings
6. Determine appropriate action

### 6.3 Timeline
- Complete investigation within 30 days
- Provide updates to complainant
- Document all steps taken

## 7. DISCIPLINARY MEASURES

Violations may result in:
- Verbal or written warning
- Mandatory training
- Suspension without pay
- Termination of employment
- Legal action

## 8. SUPPORT SERVICES

[ORGANIZATION_NAME] provides:
- Counseling services
- Employee assistance programs
- Flexible work arrangements
- Legal support information
- Medical assistance referrals

## 9. PREVENTION MEASURES

### 9.1 Training
- Mandatory harassment prevention training
- Annual refresher sessions
- Leadership training programs
- Bystander intervention training

### 9.2 Awareness
- Regular communication campaigns
- Policy distribution and acknowledgment
- Clear reporting procedures
- Safe space initiatives

## 10. NON-RETALIATION

[ORGANIZATION_NAME] prohibits retaliation against:
- Individuals who report harassment
- Witnesses who participate in investigations
- Those who support complainants
- Anyone who opposes harassment

## 11. CONFIDENTIALITY

- Information shared on need-to-know basis
- Protect privacy of all parties
- Secure storage of investigation records
- Professional discretion required

## 12. EXTERNAL RESOURCES

- National Sexual Assault Hotline: 1-800-656-4673
- Local law enforcement
- Legal aid organizations
- Counseling services

## 13. POLICY ACKNOWLEDGMENT

All staff must:
- Read and understand this policy
- Sign acknowledgment form
- Attend required training
- Report violations

**Contact Information:**
HR Manager: [ORGANIZATION_EMAIL]
Executive Director: [ORGANIZATION_EMAIL]
Anonymous Hotline: [ORGANIZATION_PHONE]

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
**Next Review Date:** [CURRENT_DATE + 1 year]
`;
  }

  private getFinancialManagementTemplate(): string {
    return `
# Financial Management Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0
**Approved By:** [BOARD_CHAIR]

## 1. PURPOSE

This Financial Management Policy establishes the framework for sound financial management practices at [ORGANIZATION_NAME] to ensure accountability, transparency, and compliance with donor requirements and legal obligations.

## 2. SCOPE

This policy applies to all financial activities including:
- Budget planning and management
- Revenue recognition and management
- Expenditure authorization and control
- Financial reporting and monitoring
- Asset management and protection

## 3. FINANCIAL MANAGEMENT PRINCIPLES

### 3.1 Core Principles
- **Accountability:** Clear responsibility for financial decisions
- **Transparency:** Open and honest financial reporting
- **Stewardship:** Responsible use of resources
- **Compliance:** Adherence to laws and donor requirements
- **Efficiency:** Optimal use of resources for mission achievement

## 4. ORGANIZATIONAL STRUCTURE

### 4.1 Board of Directors
- Ultimate financial oversight responsibility
- Approve annual budgets and major expenditures
- Review quarterly financial reports
- Ensure adequate internal controls

### 4.2 Finance Committee
- Detailed review of financial performance
- Recommend financial policies
- Oversee audit process
- Monitor compliance

### 4.3 Executive Director
- Day-to-day financial management
- Ensure policy compliance
- Authorize expenditures within limits
- Report to Board regularly

### 4.4 Finance Manager
- Maintain accounting records
- Prepare financial reports
- Implement internal controls
- Manage cash flow

## 5. BUDGETING PROCESS

### 5.1 Annual Budget
- Prepare comprehensive annual budget
- Align with strategic plan
- Include all revenue sources and expenses
- Board approval required

### 5.2 Budget Monitoring
- Monthly budget vs. actual reports
- Quarterly variance analysis
- Corrective action for significant variances
- Budget revisions as needed

## 6. REVENUE MANAGEMENT

### 6.1 Revenue Recognition
- Follow applicable accounting standards
- Recognize revenue when earned
- Properly classify restricted vs. unrestricted funds
- Document donor restrictions

### 6.2 Grant Management
- Maintain grant tracking system
- Monitor compliance with grant terms
- Submit required reports timely
- Ensure proper fund utilization

## 7. EXPENDITURE CONTROLS

### 7.1 Authorization Limits
- Executive Director: Up to $5,000
- Finance Manager: Up to $1,000
- Department Heads: Up to $500
- Board approval: Over $5,000

### 7.2 Procurement Process
- Competitive bidding for purchases over $2,500
- Written quotes for purchases over $1,000
- Purchase orders for all procurements
- Receiving verification required

### 7.3 Expense Documentation
- Original receipts required
- Proper coding to budget categories
- Supervisor approval
- Supporting documentation

## 8. CASH MANAGEMENT

### 8.1 Cash Flow Management
- Monthly cash flow projections
- Maintain adequate operating reserves
- Monitor collection of receivables
- Optimize investment returns

### 8.2 Banking Procedures
- Segregation of duties
- Dual signatures for checks over $1,000
- Monthly bank reconciliations
- Secure check storage

## 9. INTERNAL CONTROLS

### 9.1 Segregation of Duties
- Separate authorization, recording, and custody
- No single person controls entire transaction
- Regular rotation of responsibilities
- Independent verification

### 9.2 Documentation Requirements
- Maintain complete audit trail
- Secure storage of financial records
- Backup procedures for electronic records
- Retention policy compliance

## 10. FINANCIAL REPORTING

### 10.1 Internal Reporting
- Monthly financial statements
- Quarterly board reports
- Annual financial report
- Grant-specific reporting

### 10.2 External Reporting
- Annual audit by independent CPA
- Regulatory filings as required
- Donor reports per agreements
- Public disclosure requirements

## 11. ASSET MANAGEMENT

### 11.1 Fixed Assets
- Maintain asset register
- Annual physical inventory
- Proper depreciation methods
- Insurance coverage

### 11.2 Inventory Management
- Periodic inventory counts
- Proper valuation methods
- Security measures
- Disposal procedures

## 12. RISK MANAGEMENT

### 12.1 Financial Risks
- Credit risk assessment
- Fraud prevention measures
- Insurance coverage review
- Contingency planning

### 12.2 Compliance Risks
- Regular compliance monitoring
- Staff training programs
- Policy updates
- External reviews

## 13. AUDIT AND REVIEW

### 13.1 External Audit
- Annual independent audit
- Audit committee oversight
- Management letter responses
- Implementation of recommendations

### 13.2 Internal Review
- Quarterly internal reviews
- Compliance monitoring
- Process improvements
- Staff feedback

## 14. TRAINING AND DEVELOPMENT

- Financial management training for staff
- Regular policy updates
- Professional development opportunities
- Cross-training programs

## 15. POLICY COMPLIANCE

Violations of this policy may result in:
- Corrective action plans
- Additional training requirements
- Disciplinary measures
- Termination of employment

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
**Next Review Date:** [CURRENT_DATE + 1 year]
`;
  }

  // Additional template methods would continue here...
  private getProcurementTemplate(): string {
    return `
# Procurement and Asset Management Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. PURPOSE
This policy establishes procedures for procurement and asset management to ensure transparency, accountability, and value for money in all purchasing decisions.

## 2. PROCUREMENT PRINCIPLES
- Transparency and fairness
- Value for money
- Competitive processes
- Ethical conduct
- Environmental responsibility

## 3. PROCUREMENT THRESHOLDS
- Under $500: Direct purchase
- $500-$2,500: Three written quotes
- Over $2,500: Formal tender process
- Over $10,000: Board approval required

## 4. ASSET MANAGEMENT
- Asset registration and tagging
- Regular inventory audits
- Maintenance schedules
- Disposal procedures
- Insurance requirements

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getHRTemplate(): string {
    return `
# Human Resource and Recruitment Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. PURPOSE
This policy outlines fair and transparent recruitment practices and human resource management procedures.

## 2. RECRUITMENT PROCESS
- Job analysis and description
- Advertisement and outreach
- Application screening
- Interview process
- Reference checks
- Selection and appointment

## 3. EQUAL OPPORTUNITY
[ORGANIZATION_NAME] is an equal opportunity employer committed to diversity and inclusion.

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getConflictOfInterestTemplate(): string {
    return `
# Conflict of Interest Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. PURPOSE
This policy identifies and manages conflicts of interest to maintain integrity and public trust.

## 2. DEFINITION
A conflict of interest occurs when personal interests interfere with organizational duties.

## 3. DISCLOSURE REQUIREMENTS
- Annual disclosure statements
- Immediate disclosure of new conflicts
- Documentation and review process

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getFraudTemplate(): string {
    return `
# Fraud, Bribery and Corruption Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. ZERO TOLERANCE
[ORGANIZATION_NAME] has zero tolerance for fraud, bribery, and corruption.

## 2. PREVENTION MEASURES
- Strong internal controls
- Regular monitoring
- Staff training
- Clear reporting procedures

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getWhistleblowerTemplate(): string {
    return `
# Whistleblower Protection Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. PURPOSE
This policy protects individuals who report wrongdoing in good faith.

## 2. PROTECTION MEASURES
- Confidentiality protection
- Non-retaliation guarantee
- Anonymous reporting options
- Investigation procedures

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getCodeOfConductTemplate(): string {
    return `
# Code of Conduct and Ethics

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. ETHICAL STANDARDS
All staff must maintain the highest ethical standards in all activities.

## 2. PROFESSIONAL CONDUCT
- Respect and dignity
- Honesty and integrity
- Confidentiality
- Professional competence

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getDataProtectionTemplate(): string {
    return `
# Data Protection and Confidentiality Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. DATA PROTECTION PRINCIPLES
- Lawful and fair processing
- Purpose limitation
- Data minimization
- Accuracy
- Storage limitation
- Security

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getRiskManagementTemplate(): string {
    return `
# Risk Management Framework

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. RISK MANAGEMENT APPROACH
Systematic identification, assessment, and management of risks.

## 2. RISK CATEGORIES
- Strategic risks
- Operational risks
- Financial risks
- Compliance risks
- Reputational risks

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getBoardCharterTemplate(): string {
    return `
# Governance and Board Charter

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. BOARD COMPOSITION
- Minimum 5, maximum 12 members
- Diverse skills and experience
- Term limits and rotation
- Independence requirements

## 2. BOARD RESPONSIBILITIES
- Strategic oversight
- Financial oversight
- Risk management
- CEO evaluation

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getInternalControlTemplate(): string {
    return `
# Internal Control Framework

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. CONTROL ENVIRONMENT
- Tone at the top
- Organizational structure
- Competence and integrity
- Board oversight

## 2. CONTROL ACTIVITIES
- Authorization procedures
- Segregation of duties
- Documentation requirements
- Physical safeguards

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getBankingTemplate(): string {
    return `
# Banking and Cash Handling Procedures

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. BANKING PROCEDURES
- Authorized signatories
- Dual signature requirements
- Bank reconciliations
- Online banking security

## 2. CASH HANDLING
- Daily cash counts
- Secure storage
- Deposit procedures
- Petty cash management

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getDonorComplianceTemplate(): string {
    return `
# Donor Compliance and Grant Management Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. GRANT MANAGEMENT
- Pre-award procedures
- Award acceptance
- Implementation monitoring
- Reporting requirements
- Close-out procedures

## 2. COMPLIANCE MONITORING
- Regular compliance reviews
- Corrective action procedures
- Documentation requirements
- Audit preparation

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  private getDocumentRetentionTemplate(): string {
    return `
# Document Retention and Archiving Policy

**Organization:** [ORGANIZATION_NAME]
**Effective Date:** [CURRENT_DATE]
**Version:** 1.0

## 1. RETENTION SCHEDULE
- Financial records: 7 years
- Personnel files: 7 years after termination
- Board minutes: Permanent
- Grant files: 7 years after completion

## 2. ARCHIVING PROCEDURES
- Electronic storage systems
- Physical storage requirements
- Access controls
- Disposal procedures

**Approved by:** [BOARD_CHAIR]
**Date:** [CURRENT_DATE]
`;
  }

  async downloadDocument(documentId: string, format: 'docx' | 'pdf' = 'docx'): Promise<Blob> {
    const template = this.documentTemplates.get(documentId);
    if (!template) {
      throw new Error('Document template not found');
    }

    // In production, this would generate actual DOCX/PDF files
    // For now, return the content as a text blob
    const blob = new Blob([template.content], { 
      type: format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf' 
    });
    
    return blob;
  }

  getAvailableTemplates(): Array<{ id: string; title: string; type: string }> {
    return Array.from(this.documentTemplates.values()).map(template => ({
      id: template.id,
      title: template.title,
      type: template.type
    }));
  }
}

export const ngoTemplateGenerator = new NGOTemplateGenerator();
export type { NGODetails, BrandAssets, DocumentTemplate };