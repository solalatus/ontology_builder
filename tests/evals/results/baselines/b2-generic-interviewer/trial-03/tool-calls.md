# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-08-05T10:21:42.931Z

### Turn 1 — user

I lead IT operations governance and major-incident management for the bank. I can walk you through how we structure services and technical dependencies, how we detect and manage incidents, who owns decisions, how recovery and emergency changes work, and how we handle evidence, communications, reviews, and regulatory-reporting workflows. Where would you like to start?

### Turn 1 — assistant

Let’s start with the core structure, because it will anchor everything else:

1. What are the main “things” you govern in IT operations—e.g., business services, IT services, applications, infrastructure components, vendors, teams?
2. How do you represent dependency: does a business service depend on IT services, which depend on applications/infrastructure, etc.?
3. For each service, what decision-relevant properties matter during an incident—criticality, RTO/RPO, customer impact threshold, regulatory importance, owner, support model?

Once we confirm that backbone, we can layer incidents, decision ownership, recovery actions, evidence, communications, post-incident reviews, and regulatory reporting onto it.
Let’s start with the core structure, because it will anchor everything else:

1. What are the main “things” you govern in IT operations—e.g., business services, IT services, applications, infrastructure components, vendors, teams?
2. How do you represent dependency: does a business service depend on IT services, which depend on applications/infrastructure, etc.?
3. For each service, what decision-relevant properties matter during an incident—criticality, RTO/RPO, customer impact threshold, regulatory importance, owner, support model?

Once we confirm that backbone, we can layer incidents, decision ownership, recovery actions, evidence, communications, post-incident reviews, and regulatory reporting onto it.

### Turn 2 — user

Sure, let’s lay out that foundational structure:  1. **Main Governance Areas**: In IT operations, we govern several key elements:    - **Business Services**: These are the capabilities delivered to our customers and are typically the highest level of service that we manage.    - **IT Services**: These are the technology capabilities that support the business services. They serve as the operational backbone.    - **Applications**: Software systems that provide operational functionality and are integral to the IT services we deliver.    - **Infrastructure Components**: These include the hardware, network devices, storage systems, and other physical or virtual resources that support our applications and IT services.    - **Vendors**: External organizations that provide services or support technology crucial for our operations.    - **Teams**: We have different cross-functional teams, including the IT Operations Team, Service Desk, Network Operations Centre, Security Operations Centre, Incident Response Team, and resolver groups, all of which play vital roles in maintaining and managing these services.  2. **Dependency Representation**: Yes, we represent dependency in a hierarchical way:    - A **Business Service** depends on one or more **IT Services**.     - Each **IT Service** is often built on various **Applications**, which in turn rely on **Infrastructure Components**.    - This structure allows us to visualize how incidents impacting one layer can have cascading effects on others.  3. **Decision-Relevant Properties**: For effective incident management, the following properties are crucial for each service:    - **Criticality**: How essential a service is to business operations, often classified by tiers (e.g., critical, important, standard).    - **Recovery Time Objective (RTO)** and **Recovery Point Objective (RPO)**: Metrics that define the maximum acceptable downtime and data loss for each service.    - **Customer Impact Threshold**: Defines the point at which an incident starts to affect customers or operations.    - **Regulatory Importance**: Understanding any compliance requirements or implications tied to the service and its data.    - **Owner**: The individual responsible for overseeing the service, typically a service owner or business owner.    - **Support Model**: Outlined channels and responsibilities for support and resolution of incidents affecting the service.  Once we have this framework solidified, we can delve into how incidents occur within this structure and the associated processes for management and recovery. Would you like to move on to incidents and decision ownership next?

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Business Service:\n    meaning: Customer-facing or business capability that is the highest level of service governed by IT operations.\n    properties:\n      criticality:\n        type: text\n        allowed: [critical, important, standard]\n      RTO:\n        type: number\n        unit: hours\n      RPO:\n        type: number\n        unit: hours\n      customerImpactThreshold:\n        type: text\n      regulatoryImportance:\n        type: text\n      owner:\n        type: text\n      supportModel:\n        type: text\n  IT Service:\n    meaning: Technology capability that supports one or more business services and forms part of the operational backbone.\n    properties:\n      criticality:\n        type: text\n        allowed: [critical, important, standard]\n      RTO:\n        type: number\n        unit: hours\n      RPO:\n        type: number\n        unit: hours\n      customerImpactThreshold:\n        type: text\n      regulatoryImportance:\n        type: text\n      owner:\n        type: text\n      supportModel:\n        type: text\n  Application:\n    meaning: Software system that provides operational functionality and supports IT services.\n  Infrastructure Component:\n    meaning: Hardware, network device, storage system, or physical or virtual resource that supports applications and IT services.\n    aliases: [hardware, network device, storage system, physical resource, virtual resource]\n  Vendor:\n    meaning: External organization providing services or technology support crucial for operations.\n  Team:\n    meaning: Cross-functional or specialist group involved in maintaining and managing services.\n    aliases: [IT Operations Team, Service Desk, Network Operations Centre, Security Operations Centre, Incident Response Team, resolver group]\nrelationships:\n  - name: dependsOn\n    from: Business Service\n    to: IT Service\n    meaning: A business service depends on one or more IT services.\n  - name: builtOn\n    from: IT Service\n    to: Application\n    meaning: An IT service is built on one or more applications.\n  - name: reliesOn\n    from: Application\n    to: Infrastructure Component\n    meaning: An application relies on one or more infrastructure components."
}
```

### Turn 2 — tool

Applied. Added 9, updated 0 existing item(s).

### Turn 2 — assistant

Got it — I’ve captured the foundational service and dependency structure:

- **Business Service** depends on **IT Service**
- **IT Service** is built on **Application**
- **Application** relies on **Infrastructure Component**
- **Vendor** and **Team** are also governed operational entities
- For services, key decision properties include **criticality**, **RTO**, **RPO**, **customer impact threshold**, **regulatory importance**, **owner**, and **support model**

Yes, let’s move on to **incidents and decision ownership**.

A few questions to model that correctly:

1. What are the main incident types or severity levels you use? For example: major incident, cyber incident, operational incident, Sev1/Sev2?
2. What determines incident severity — customer impact, service criticality, duration, regulatory impact, financial loss, security impact?
3. Which roles or teams own decisions during an incident? For example: incident commander, major incident manager, service owner, technology owner, business owner, communications lead, risk/compliance.
4. How do incidents relate to the service model — does an incident impact a Business Service directly, or is it usually linked to an Application/Infrastructure Component and then assessed through dependencies?
5. Are there formal actions like “declare major incident,” “escalate,” “invoke recovery plan,” or “approve emergency change” that require specific preconditions?

### Turn 3 — user

Great summary of the framework! Now, let’s delve into incidents and decision ownership:  1. **Main Incident Types and Severity Levels**: We classify incidents into several categories, primarily focusing on:    - **Major Incident**: Incidents that require enhanced coordination due to significant business or regulatory impacts; they typically trigger a formal command structure.    - **Cybersecurity Incident**: Incidents that involve malicious, unauthorized activities impacting the bank’s infrastructure or data.    - **Operational Incident**: General incidents affecting the normal operations of services.    - I also reference severity levels, commonly known as Sev1 (critical), Sev2 (high), Sev3 (medium), and Sev4 (low), to prioritize and categorize incidents based on their urgency and impact.  2. **Determining Incident Severity**: Several factors influence severity, such as:    - **Customer Impact**: The degree to which customers are affected.    - **Service Criticality**: How essential the impacted service is to business operations.    - **Duration**: The expected time to resolution.    - **Regulatory Impact**: Potential implications for compliance and reporting.    - **Financial Loss**: Estimated financial costs associated with the incident.    - **Security Impact**: The extent of threat to data integrity, confidentiality, and availability.  3. **Roles Owning Decisions During an Incident**: Several key roles contribute to decision-making, including:    - **Incident Commander**: Provides overall command and coordination during incidents, especially major incidents.    - **Major Incident Manager**: Focuses on managing the processes and teams involved in a major incident.    - **Service Owner**: Responsible for the service being impacted and decisions regarding service restoration.    - **Technology Owner**: Oversees the specific technology components involved in the incident.    - **Business Owner**: Makes decisions about business priorities and impacts.    - **Communications Lead**: Manages internal and external communications.    - **Risk and Compliance Teams**: Involved in assessing regulatory implications and compliance measures.  4. **Incident Impact and Service Model**: An incident can directly impact a **Business Service**, but often, it's linked to an **Application** or **Infrastructure Component**. Once identified, the relationships and dependencies allow us to assess the broader effects on the business service and determine the appropriate response.  5. **Formal Actions and Preconditions**: Yes, specific actions during incidents require defined preconditions:    - **Declare Major Incident**: Preconditions include incident severity, impacted services identified, and an assigned incident commander.    - **Escalate**: This may occur based on severity, duration, or if additional resources are needed.    - **Invoke Recovery Plan**: This requires the service’s recovery plan to apply, with available recovery environments and acceptable recovery points.    - **Approve Emergency Change**: Linked to active incidents, preconditions include documented implementation and backout plans, identified affected configuration items, and risk acceptance.  With this understanding of incidents and decision ownership, we can elaborate on recovery actions, evidence management, communication practices, post-incident reviews, and regulatory reporting next. What would you like to explore next?

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: An event disrupting or threatening normal operation of services, applications, infrastructure, data, or customers.\n    properties:\n      incidentType:\n        type: text\n        allowed: [Major Incident, Cybersecurity Incident, Operational Incident]\n      severity:\n        type: text\n        allowed: [Sev1, Sev2, Sev3, Sev4]\n      customerImpact:\n        type: text\n      duration:\n        type: number\n        unit: hours\n      regulatoryImpact:\n        type: text\n      financialLoss:\n        type: number\n      securityImpact:\n        type: text\n  Role:\n    meaning: Named decision or coordination responsibility used during incident management.\n    aliases: [Incident Commander, Major Incident Manager, Service Owner, Technology Owner, Business Owner, Communications Lead, Risk and Compliance Team]\n  Recovery Plan:\n    meaning: Documented plan for restoring a service within acceptable recovery objectives.\n    properties:\n      recoveryEnvironmentAvailable:\n        type: boolean\n      acceptableRecoveryPoint:\n        type: boolean\n  Emergency Change:\n    meaning: Urgent change made to restore service or mitigate active incident impact.\n    properties:\n      implementationPlanDocumented:\n        type: boolean\n      backoutPlanDocumented:\n        type: boolean\n      affectedConfigurationItemsIdentified:\n        type: boolean\n      riskAccepted:\n        type: boolean\nrelationships:\n  - name: impacts\n    from: Incident\n    to: Business Service\n    meaning: An incident directly affects a business service.\n  - name: linkedTo\n    from: Incident\n    to: Application\n    meaning: An incident is linked to an application as the suspected or actual affected layer.\n  - name: linkedTo\n    from: Incident\n    to: Infrastructure Component\n    meaning: An incident is linked to an infrastructure component as the suspected or actual affected layer.\n  - name: hasDecisionRole\n    from: Incident\n    to: Role\n    meaning: A role has decision-making, coordination, communication, or compliance responsibility during the incident.\n  - name: appliesTo\n    from: Recovery Plan\n    to: Business Service\n    meaning: A recovery plan applies to a business service.\n  - name: addresses\n    from: Emergency Change\n    to: Incident\n    meaning: An emergency change is raised to restore service or mitigate an active incident.\nrules:\n  declareMajorIncidentPreconditions:\n    conditions:\n      - Incident severity warrants enhanced coordination.\n      - Impacted services are identified.\n      - An Incident Commander is assigned.\n  escalatePreconditions:\n    conditions:\n      - Escalation is required by severity, duration, or need for additional resources.\n  invokeRecoveryPlanPreconditions:\n    conditions:\n      - The service's recovery plan applies.\n      - Recovery environments are available.\n      - Recovery points are acceptable.\n  approveEmergencyChangePreconditions:\n    conditions:\n      - Emergency change is linked to an active incident.\n      - Implementation plan is documented.\n      - Backout plan is documented.\n      - Affected configuration items are identified.\n      - Risk acceptance is recorded.\nactions:\n  declareMajorIncident:\n    input: Incident\n    preconditions: [declareMajorIncidentPreconditions]\n  escalate:\n    input: Incident\n    preconditions: [escalatePreconditions]\n  invokeRecoveryPlan:\n    input: Recovery Plan\n    preconditions: [invokeRecoveryPlanPreconditions]\n  approveEmergencyChange:\n    input: Emergency Change\n    preconditions: [approveEmergencyChangePreconditions]"
}
```

### Turn 3 — tool

Applied. Added 18, updated 0 existing item(s).

### Turn 3 — assistant

Excellent — I’ve added the incident layer:

- **Incident** with type, severity, and severity drivers like customer, regulatory, financial, and security impact
- Incident types: **Major Incident**, **Cybersecurity Incident**, **Operational Incident**
- Severity levels: **Sev1–Sev4**
- Decision **Role**, including Incident Commander, Major Incident Manager, Service Owner, Technology Owner, Business Owner, Communications Lead, and Risk/Compliance
- Incident relationships to impacted **Business Services**, affected **Applications**, and **Infrastructure Components**
- Formal actions:
  - **Declare Major Incident**
  - **Escalate**
  - **Invoke Recovery Plan**
  - **Approve Emergency Change**

Next, I’d suggest we cover **recovery and emergency change** in more detail, because that will connect operational decisions to restoration.

A few focused questions:

1. What are the main types of recovery action you use? For example: failover, rollback, restart, restore from backup, traffic reroute, capacity scale-up, vendor intervention, security containment.
2. Does a recovery action target a **Business Service**, **IT Service**, **Application**, or **Infrastructure Component**, or all of these depending on the situation?
3. Who can authorize recovery actions? Is it always the Incident Commander, or do Service Owner, Technology Owner, Business Owner, or Risk/Compliance have approval rights in certain cases?
4. How do you decide between recovery versus emergency change? For example, is a scripted failover considered recovery, while a production configuration fix is an emergency change?
5. What evidence must be captured for recovery actions and emergency changes?

### Turn 4 — user

Let's discuss the recovery actions and emergency changes in detail:  1. **Main Types of Recovery Actions**: We utilize several types of recovery actions depending on the nature of the incident, including:    - **Failover**: Transitioning workload to a backup environment to maintain service availability.    - **Rollback**: Reverting to a previous stable state after a change that caused an issue.    - **Restart**: Rebooting applications or services to clear faults and restore functionality.    - **Restore from Backup**: Recovering data or system states from backups to get the service back online.    - **Traffic Reroute**: Redirecting user traffic to alternative resources or systems to avoid impacted areas.    - **Capacity Scale-Up**: Increasing resource allocation (CPU, memory, etc.) in response to demand spikes.    - **Vendor Intervention**: Requesting direct support from third-party vendors for specialized assistance.    - **Security Containment**: Steps taken to isolate affected systems to prevent further damage or breaches.  2. **Targets of Recovery Actions**: Recovery actions can target multiple layers, including:    - **Business Service**: When the overall service delivery is compromised.    - **IT Service**: For issues confined to specific technology capabilities.    - **Application**: Focused actions to restore an application's functionality.    - **Infrastructure Component**: Actions directed at hardware or network elements to resolve lower-level issues.    - The specific target depends on the impact and depth of the incident.  3. **Authorization of Recovery Actions**: While the **Incident Commander** typically has overarching authority, other roles can also approve actions:    - **Service Owner**: Often authorizes actions directly impacting their service.    - **Technology Owner**: May need to approve specific technical recovery procedures.    - **Business Owner**: Can provide approval for business-critical recovery steps.    - **Risk/Compliance**: May need to sign off on any recovery actions that have compliance implications or affect regulatory obligations.  4. **Deciding Between Recovery versus Emergency Change**: The distinction often comes down to:    - **Recovery**: Typically involves restoring services to their previous state using pre-existing procedures. For example, a scripted failover to a DR site counts as recovery.    - **Emergency Change**: Involves making modifications to address an issue that wasn't part of the original configuration. For instance, applying a production fix to correct a misconfiguration would be deemed an emergency change.    - Generally, if the action reverts or restores to an earlier functional state, it's recovery; if it involves altering configurations or applying updates, it's an emergency change.  5. **Evidence Capture for Recovery Actions and Emergency Changes**: Key evidence that we capture includes:    - For **Recovery Actions**:      - Action taken, including timestamps and responsible personnel.      - Outcomes and verification results after the recovery step (e.g., service health indicators).      - Logs or evidence confirming restored functionality (such as application response).    - For **Emergency Changes**:      - Change records including planned implementation and backout plans.      - Approval documentation from relevant authorities.      - Post-implementation verification results showing the effects on the service.      - Detailed logs showing the timing and steps taken during the change.  With this framework on recovery actions and emergency changes clarified, we can layer in the aspects of evidence, communications, post-incident reviews, and regulatory reporting. What area would you like to explore next?

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Recovery Action:\n    meaning: Action taken during an incident to restore service using pre-existing procedures or previous functional states.\n    properties:\n      actionType:\n        type: text\n        allowed: [Failover, Rollback, Restart, Restore from Backup, Traffic Reroute, Capacity Scale-Up, Vendor Intervention, Security Containment]\n      outcome:\n        type: text\n      verificationResult:\n        type: text\n  Evidence:\n    meaning: Captured proof of decisions, actions, approvals, timings, results, or system state during incident management.\n    properties:\n      evidenceType:\n        type: text\n        allowed: [Action Log, Timestamp, Responsible Personnel, Verification Result, Service Health Indicator, Application Response, Change Record, Approval Documentation, Implementation Log]\nrelationships:\n  - name: respondsTo\n    from: Recovery Action\n    to: Incident\n    meaning: A recovery action is taken in response to an incident.\n  - name: targets\n    from: Recovery Action\n    to: Business Service\n    meaning: A recovery action targets a business service when overall service delivery is compromised.\n  - name: targets\n    from: Recovery Action\n    to: IT Service\n    meaning: A recovery action targets an IT service when a technology capability must be restored.\n  - name: targets\n    from: Recovery Action\n    to: Application\n    meaning: A recovery action targets an application to restore application functionality.\n  - name: targets\n    from: Recovery Action\n    to: Infrastructure Component\n    meaning: A recovery action targets an infrastructure component to resolve lower-level issues.\n  - name: authorizedBy\n    from: Recovery Action\n    to: Role\n    meaning: A role authorizes a recovery action when its authority is required for the action's impact or risk.\n  - name: authorizedBy\n    from: Emergency Change\n    to: Role\n    meaning: A role approves an emergency change when its authority is required for the change's service, technology, business, or compliance impact.\n  - name: evidencedBy\n    from: Recovery Action\n    to: Evidence\n    meaning: Evidence records the recovery action taken, timing, responsibility, outcome, and verification.\n  - name: evidencedBy\n    from: Emergency Change\n    to: Evidence\n    meaning: Evidence records the emergency change plan, approval, implementation steps, timing, and post-implementation verification.\nrules:\n  recoveryActionClassification:\n    conditions:\n      - The action restores service using a pre-existing procedure or previous functional state.\n      - Scripted failover to a disaster recovery site counts as recovery.\n      - Reverting to an earlier functional state counts as recovery.\n  emergencyChangeClassification:\n    conditions:\n      - The action alters configuration, applies an update, or introduces a production fix not already part of the original configuration.\n      - A production configuration fix to correct a misconfiguration counts as an emergency change."
}
```

### Turn 4 — tool

Applied. Added 13, updated 0 existing item(s).

### Turn 4 — assistant

Captured. I’ve added:

- **Recovery Action** with action types:
  - Failover
  - Rollback
  - Restart
  - Restore from Backup
  - Traffic Reroute
  - Capacity Scale-Up
  - Vendor Intervention
  - Security Containment

- Recovery actions can target:
  - **Business Service**
  - **IT Service**
  - **Application**
  - **Infrastructure Component**

- Recovery and emergency changes can be **authorized by Roles**
- Both are **evidenced by Evidence**
- Classification rules:
  - Recovery = restore/revert using known procedures or previous functional state
  - Emergency change = alter configuration, apply update, or introduce production fix

Let’s cover **communications** next, since they are central during major incidents and regulatory-sensitive events.

A few questions:

1. What types of communications do you manage during an incident? For example: internal stakeholder update, customer communication, executive briefing, regulator notification, service desk bulletin, vendor update.
2. Who owns or approves each communication type?
3. Are there standard timing rules? For example, first update within X minutes, recurring updates every Y minutes, executive updates for Sev1 only, customer updates once impact is confirmed.
4. What content must be included in incident communications? For example: affected service, customer impact, current status, workaround, estimated restoration time, next update time.
5. Do communications require evidence or approval records, especially for customer-facing or regulator-facing messages?

### Turn 5 — user

Absolutely, let’s focus on the communications aspect during incidents:  1. **Types of Communications**: During an incident, we manage several communication types, including:    - **Internal Stakeholder Updates**: Keeping relevant internal teams informed of incident status and actions.    - **Customer Communication**: Informing affected customers about the incident, its impact, and restoration efforts.    - **Executive Briefing**: Providing high-level updates to senior management regarding critical incidents.    - **Regulator Notification**: Official communications to regulatory authorities if required.    - **Service Desk Bulletin**: Updates for the Service Desk to assist them in managing customer queries effectively.    - **Vendor Update**: Communication with third-party vendors if their services are impacted or require support.  2. **Ownership and Approval**: Different roles or teams typically own or approve communication types:    - **Internal Stakeholder Updates**: The Incident Commander usually manages this.    - **Customer Communication**: The Communications Lead works with the Incident Commander for approval.    - **Executive Briefing**: Generally handled by senior management or the Incident Commander.    - **Regulator Notification**: Approval comes from designated regulatory reporting authorities or Risk/Compliance teams.    - **Service Desk Bulletin**: Often coordinated by the Service Desk Manager or Incident Commander.    - **Vendor Update**: Managed by the Incident Commander or technology owner based on the context.  3. **Standard Timing Rules**: We have established timing rules for communications, such as:    - **First Update**: Within 30 minutes of incident detection.    - **Recurring Updates**: Every 60 minutes or as significant changes occur.    - **Executive Updates**: Typically for Sev1 incidents only and may have dedicated intervals.    - **Customer Updates**: Provided once the impact is confirmed and typically within the first hour after detection.  4. **Content Requirements for Communications**: Essential information included in incident communications generally comprises:    - **Affected Service**: Clearly identifying what service is impacted.    - **Customer Impact**: Outlining how customers are affected, including any service outages.    - **Current Status**: The latest update on the incident's progress (e.g., investigating, contained).    - **Workaround**: Any temporary solutions available to mitigate impacts.    - **Estimated Restoration Time**: An anticipated timeline for service restoration, if known.    - **Next Update Time**: Indicating when further information will be shared.  5. **Evidence and Approval Records**: Yes, communications—especially those directed at customers or regulators—require clear evidence of prior approval and record-keeping, including:    - Approval records from the communications lead or incident commander.    - Archival of the communications sent (timestamped copies).    - Any feedback or responses received after distribution, especially for regulatory notifications.  With this communication framework established, we can now explore how we handle evidence management, post-incident reviews, and regulatory reporting next. Where would you like to go from here?

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Communication:\n    meaning: Message or briefing issued during an incident to stakeholders, customers, executives, regulators, service desk, or vendors.\n    properties:\n      communicationType:\n        type: text\n        allowed: [Internal Stakeholder Update, Customer Communication, Executive Briefing, Regulator Notification, Service Desk Bulletin, Vendor Update]\n      currentStatus:\n        type: text\n        allowed: [investigating, contained, recovering, restored, monitoring]\n      customerImpact:\n        type: text\n      workaround:\n        type: text\n      estimatedRestorationTime:\n        type: date\n      nextUpdateTime:\n        type: date\n      sentTime:\n        type: date\nrelationships:\n  - name: issuedFor\n    from: Communication\n    to: Incident\n    meaning: A communication is issued for an incident.\n  - name: covers\n    from: Communication\n    to: Business Service\n    meaning: A communication identifies the affected business service.\n  - name: ownedBy\n    from: Communication\n    to: Role\n    meaning: A role owns preparation or coordination of the communication.\n  - name: approvedBy\n    from: Communication\n    to: Role\n    meaning: A role approves the communication before distribution when approval is required.\n  - name: evidencedBy\n    from: Communication\n    to: Evidence\n    meaning: Evidence records the communication approval, timestamped message copy, or feedback and responses.\nrules:\n  firstUpdateTiming:\n    conditions:\n      - First incident update is issued within 30 minutes of incident detection.\n  recurringUpdateTiming:\n    conditions:\n      - Recurring updates are issued every 60 minutes or when significant changes occur.\n  executiveUpdateTiming:\n    conditions:\n      - Executive updates are typically required for Sev1 incidents.\n  customerUpdateTiming:\n    conditions:\n      - Customer updates are issued once impact is confirmed and typically within the first hour after detection.\n  communicationContentRequirements:\n    conditions:\n      - Communication identifies the affected service.\n      - Communication describes customer impact.\n      - Communication states current status.\n      - Communication includes workaround if available.\n      - Communication includes estimated restoration time if known.\n      - Communication includes next update time.\n  customerOrRegulatorCommunicationEvidenceRequired:\n    conditions:\n      - Customer-facing and regulator-facing communications require prior approval evidence.\n      - Timestamped copies of sent communications are archived.\n      - Feedback or responses are retained, especially for regulatory notifications."
}
```

### Turn 5 — tool

Applied. Added 12, updated 0 existing item(s).

### Turn 5 — assistant

Great — I’ve added the communications model:

- **Communication** types:
  - Internal Stakeholder Update
  - Customer Communication
  - Executive Briefing
  - Regulator Notification
  - Service Desk Bulletin
  - Vendor Update

- Communications are:
  - **issued for** an Incident
  - **cover** affected Business Services
  - **owned by** and **approved by** Roles
  - **evidenced by** approval records, timestamped copies, and feedback/responses

- Timing/content rules:
  - First update within **30 minutes**
  - Recurring updates every **60 minutes** or on significant change
  - Executive updates typically for **Sev1**
  - Customer updates once impact is confirmed, typically within the first hour
  - Required content includes affected service, customer impact, current status, workaround, ERT if known, and next update time

Next, let’s go into **evidence management**, because it underpins incident defensibility, emergency changes, communications, reviews, and regulatory reporting.

Questions:

1. What evidence categories do you formally retain across the incident lifecycle? For example: incident timeline, decision log, chat transcript, bridge recording, monitoring alert, system log, change record, approval, recovery validation, customer notification, regulator submission.
2. Are there evidence quality requirements? For example: timestamped, attributable to a person/role, immutable, linked to incident, retained for X years.
3. Who is accountable for evidence completeness during and after a major incident?
4. Are there specific evidence packs created for post-incident review, audit, or regulators?
5. What triggers heightened evidence requirements — Sev1, major incident declaration, cyber incident, customer harm, regulatory impact, emergency change?

### Turn 6 — user

Let's delve into the critical aspect of evidence management for incident operations:  1. **Evidence Categories**: We formally retain several evidence categories across the incident lifecycle, including:    - **Incident Timeline**: A detailed log of all events, actions, and updates related to the incident.    - **Decision Log**: Records documenting key decisions made throughout the incident management process.    - **Chat Transcript**: Communications among the incident response team during live discussions.    - **Bridge Recording**: Audio or video recordings from incident command bridges used during major incidents.    - **Monitoring Alert**: Alerts generated from monitoring systems that helped identify or diagnose the incident.    - **System Log**: Relevant logs from affected systems that capture events leading up to, during, and following the incident.    - **Change Record**: Documentation regarding changes that were implemented, especially if related to the incident.    - **Approval Records**: Evidence of approvals from relevant persons/roles, especially for recovery actions and emergency changes.    - **Recovery Validation**: Records showing outcomes and verification following recovery actions.    - **Customer Notification**: Copies of communications sent to customers detailing the incident and its impact.    - **Regulator Submission**: Documentation of any formal notifications sent to regulatory bodies.  2. **Evidence Quality Requirements**: Yes, we have defined quality requirements for evidence, which include:    - **Timestamped**: Each piece of evidence must have a date and time of creation or action.    - **Attributable**: Evidence should be clearly linked to the responsible person or role to confirm accountability.    - **Immutable**: Evidence must remain unchanged post-creation to ensure integrity.    - **Linked to Incident**: All evidence should be traceable back to the specific incident it pertains to.    - **Retention Period**: Generally, we retain evidence for a minimum of five years, subject to any regulatory requirements.  3. **Accountability for Evidence Completeness**: The **Incident Commander** is primarily accountable for ensuring that evidence is complete during and after a major incident. However, each role involved in the incident management process plays a part in fulfilling this responsibility, ensuring that all relevant records are created, maintained, and retrievable.  4. **Specific Evidence Packs**: Yes, we do create specific evidence packs for different purposes:    - **Post-Incident Review Packs**: Comprehensive collections of all evidence related to an incident, including timelines, logs, communications, and any findings from the response.    - **Audit Packs**: Assembled evidence tailored for regulatory audits, ensuring compliance with requisite standards and documentation practices.    - **Regulatory Submission Packs**: Organized documentation prepared for regulators that may include materiality assessments, formal notifications, and supporting evidence.  5. **Triggers for Heightened Evidence Requirements**: Several factors can trigger enhanced evidence requirements:    - **Sev1 Incidents**: High urgency and impact events necessitate comprehensive documentation.    - **Major Incident Declaration**: When an incident is declared major, all evidence collection steps are intensified.    - **Cyber Incidents**: Security-related incidents call for additional evidence to ensure proper tracking and investigation.    - **Customer Harm**: If an incident results in customer impact, rigorous evidence retention is required to manage liability and reporting.    - **Regulatory Impact**: Any incident that intersects with compliance obligations will necessitate strict evidence standards.    - **Emergency Changes**: When changes are implemented under emergency circumstances, detailed records of justification, execution, and outcomes are essential.  With the evidence management framework in place, we can move on to exploring post-incident reviews, their processes, and implications. What would you like to focus on next?

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Evidence:\n    meaning: Captured proof of decisions, actions, approvals, timings, results, communications, system state, or submissions during incident management.\n    properties:\n      evidenceType:\n        type: text\n        allowed: [Incident Timeline, Decision Log, Chat Transcript, Bridge Recording, Monitoring Alert, System Log, Change Record, Approval Records, Recovery Validation, Customer Notification, Regulator Submission, Action Log, Timestamp, Responsible Personnel, Verification Result, Service Health Indicator, Application Response, Approval Documentation, Implementation Log]\n      timestamped:\n        type: boolean\n      attributable:\n        type: boolean\n      immutable:\n        type: boolean\n      retentionPeriod:\n        type: number\n        unit: years\n  Evidence Pack:\n    meaning: Organized collection of incident evidence prepared for review, audit, or regulatory submission.\n    properties:\n      packType:\n        type: text\n        allowed: [Post-Incident Review Pack, Audit Pack, Regulatory Submission Pack]\nrelationships:\n  - name: evidencedBy\n    from: Incident\n    to: Evidence\n    meaning: Evidence is linked to the incident it supports or documents.\n  - name: accountableForCompleteness\n    from: Role\n    to: Evidence Pack\n    meaning: A role is accountable for ensuring the evidence pack is complete and retrievable.\n  - name: contains\n    from: Evidence Pack\n    to: Evidence\n    meaning: An evidence pack contains individual evidence items.\n  - name: preparedFor\n    from: Evidence Pack\n    to: Incident\n    meaning: An evidence pack is prepared for a specific incident.\nrules:\n  evidenceQualityRequirements:\n    conditions:\n      - Each evidence item is timestamped with date and time of creation or action.\n      - Each evidence item is attributable to the responsible person or role.\n      - Each evidence item is immutable after creation to preserve integrity.\n      - Each evidence item is linked to the specific incident it pertains to.\n      - Evidence is retained for a minimum of five years unless stricter regulatory requirements apply.\n  evidenceCompletenessAccountability:\n    conditions:\n      - The Incident Commander is primarily accountable for evidence completeness during and after a major incident.\n      - Each role involved in the incident contributes to creating, maintaining, and making relevant records retrievable.\n  heightenedEvidenceRequirements:\n    conditions:\n      - Sev1 incidents require comprehensive documentation.\n      - Major Incident declaration intensifies evidence collection steps.\n      - Cyber incidents require additional evidence for tracking and investigation.\n      - Customer harm requires rigorous evidence retention.\n      - Regulatory impact requires strict evidence standards.\n      - Emergency changes require detailed records of justification, execution, and outcomes."
}
```

### Turn 6 — tool

Applied. Added 8, updated 1 existing item(s).

### Turn 6 — assistant

Captured. I’ve expanded evidence management with:

- **Evidence** categories such as:
  - Incident Timeline
  - Decision Log
  - Chat Transcript
  - Bridge Recording
  - Monitoring Alert
  - System Log
  - Change Record
  - Approval Records
  - Recovery Validation
  - Customer Notification
  - Regulator Submission

- Evidence quality requirements:
  - Timestamped
  - Attributable
  - Immutable
  - Linked to incident
  - Retained for at least **five years**, unless stricter regulatory rules apply

- **Evidence Pack** types:
  - Post-Incident Review Pack
  - Audit Pack
  - Regulatory Submission Pack

- Heightened evidence triggers:
  - Sev1
  - Major Incident declaration
  - Cyber incident
  - Customer harm
  - Regulatory impact
  - Emergency change

Let’s move to **post-incident reviews**.

1. Which incidents require a post-incident review? Only major incidents and Sev1, or also Sev2, cyber incidents, repeated incidents, customer harm, regulatory impact?
2. What are the required outputs of a review? For example: root cause, contributing factors, control gaps, corrective actions, lessons learned, owner assignment, due dates.
3. Who chairs or approves the review?
4. How do corrective actions get tracked — as risk actions, problem records, change backlog items, control remediation, or service improvement actions?
5. Are there deadlines for completing reviews after restoration or incident closure?

### Turn 7 — user

Let’s address the scope and process for post-incident reviews:  1. **Incidents Requiring a Post-Incident Review**: Generally, we conduct post-incident reviews for:    - **Major Incidents**: These always require a formal review.    - **Sev1 Incidents**: High-impact incidents warrant a thorough analysis.    - **Sev2 Incidents**: Reviews are typically conducted if there are significant implications for business operations or multiple affected customers.    - **Cyber Incidents**: Any incident involving a cybersecurity breach or threat will be reviewed for lessons learned and improvements.    - **Repeated Incidents**: Any incidents that recur in a short timeframe are analyzed to understand underlying issues.    - **Customer Harm**: If an incident results in direct harm or impact to customers.    - **Regulatory Impact**: Any incident that has regulatory implications will undergo scrutiny.  2. **Required Outputs of a Review**: The key outputs of a review typically include:    - **Root Cause Analysis**: Identification of the primary cause(s) of the incident.    - **Contributing Factors**: Additional elements that may have exacerbated the incident.    - **Control Gaps**: Shortcomings in existing processes, controls, or systems that allowed the incident to occur or worsen.    - **Corrective Actions**: Actions that will be taken to address identified problems and prevent recurrence.    - **Lessons Learned**: Insights gained from managing the incident, including effective strategies and areas for improvement.    - **Owner Assignment**: Designating specific individuals or teams responsible for implementing corrective actions.    - **Due Dates**: Timelines by which corrective actions should be completed.  3. **Chairing or Approval of the Review**: The **Incident Commander** or a designated **Major Incident Manager** typically chairs the post-incident review. Their involvement ensures that the review stays structured and focused. The findings and recommendations are then approved by the relevant service owners and management stakeholders.  4. **Tracking of Corrective Actions**: Corrective actions are often tracked through:    - **Risk Actions**: Any actions targeting identified risks that arose from the incident.    - **Problem Records**: Linking actions to existing problems or creating new problem records as necessary.    - **Change Backlog Items**: Actions that involve changes to systems or processes may be documented as part of the change management backlog.    - **Control Remediation**: Actions aimed at strengthening existing controls or implementing new controls based on findings.    - **Service Improvement Actions**: Any initiatives related to enhancing the overall service delivery or operational resilience.  5. **Deadlines for Completing Reviews**: Yes, there are deadlines for completing post-incident reviews:    - Typically, reviews for **major incidents** or **Sev1 incidents** should be completed within **seven days** of restoration or incident closure.    - For **Sev2 and lower incidents**, we set a timeline of **14 days**, with flexibility based on the complexity of issues and required participant availability.  With this framework on post-incident reviews clarified, we can proceed to the topic of regulatory reporting and the processes associated with it. What would you like to explore next?

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Post-Incident Review:\n    meaning: Formal review conducted after qualifying incidents to identify causes, gaps, actions, and lessons learned.\n    aliases: [PIR, post-incident review]\n    properties:\n      rootCauseAnalysis:\n        type: text\n      contributingFactors:\n        type: text\n      controlGaps:\n        type: text\n      lessonsLearned:\n        type: text\n      dueDate:\n        type: date\n      completedWithinDays:\n        type: number\n        unit: days\n  Corrective Action:\n    meaning: Action assigned after a post-incident review to address findings, reduce risk, or prevent recurrence.\n    properties:\n      actionType:\n        type: text\n        allowed: [Risk Action, Problem Record, Change Backlog Item, Control Remediation, Service Improvement Action]\n      owner:\n        type: text\n      dueDate:\n        type: date\n      status:\n        type: text\n        allowed: [open, in progress, complete, overdue]\nrelationships:\n  - name: reviews\n    from: Post-Incident Review\n    to: Incident\n    meaning: A post-incident review examines a qualifying incident.\n  - name: chairedBy\n    from: Post-Incident Review\n    to: Role\n    meaning: A role chairs and structures the post-incident review.\n  - name: approvedBy\n    from: Post-Incident Review\n    to: Role\n    meaning: A role approves the findings and recommendations from the post-incident review.\n  - name: produces\n    from: Post-Incident Review\n    to: Corrective Action\n    meaning: A post-incident review produces corrective actions to address findings.\n  - name: assignedTo\n    from: Corrective Action\n    to: Team\n    meaning: A corrective action is assigned to a team responsible for implementation.\n  - name: evidencedBy\n    from: Post-Incident Review\n    to: Evidence Pack\n    meaning: A post-incident review is supported by a post-incident review evidence pack.\nrules:\n  postIncidentReviewRequired:\n    conditions:\n      - Major Incidents always require a formal post-incident review.\n      - Sev1 incidents require a post-incident review.\n      - Sev2 incidents require a post-incident review if they have significant business implications or multiple affected customers.\n      - Cyber incidents require a post-incident review.\n      - Repeated incidents in a short timeframe require analysis.\n      - Incidents causing customer harm require a post-incident review.\n      - Incidents with regulatory impact require a post-incident review.\n  postIncidentReviewOutputsRequired:\n    conditions:\n      - Review identifies root cause analysis.\n      - Review identifies contributing factors.\n      - Review identifies control gaps.\n      - Review produces corrective actions.\n      - Review captures lessons learned.\n      - Review assigns owners for corrective actions.\n      - Review assigns due dates for corrective actions.\n  postIncidentReviewChairAndApproval:\n    conditions:\n      - Incident Commander or designated Major Incident Manager typically chairs the review.\n      - Relevant service owners and management stakeholders approve findings and recommendations.\n  postIncidentReviewDeadline:\n    conditions:\n      - Major Incident and Sev1 reviews are completed within seven days of restoration or incident closure.\n      - Sev2 and lower reviews are completed within fourteen days, with flexibility for complexity and participant availability."
}
```

### Turn 7 — tool

Applied. Added 12, updated 0 existing item(s).

### Turn 7 — assistant

Captured. I’ve added the **post-incident review** layer:

- **Post-Incident Review / PIR**
  - Reviews qualifying incidents
  - Chaired by Incident Commander or Major Incident Manager
  - Approved by relevant Service Owners and management stakeholders
  - Supported by an Evidence Pack

- Review outputs:
  - Root cause analysis
  - Contributing factors
  - Control gaps
  - Corrective actions
  - Lessons learned
  - Owner assignment
  - Due dates

- **Corrective Action** types:
  - Risk Action
  - Problem Record
  - Change Backlog Item
  - Control Remediation
  - Service Improvement Action

- PIR required for:
  - Major Incidents
  - Sev1
  - Sev2 with significant business impact or multiple affected customers
  - Cyber incidents
  - Repeated incidents
  - Customer harm
  - Regulatory impact

- Deadlines:
  - Major/Sev1: within **7 days** of restoration or closure
  - Sev2 and lower: within **14 days**, subject to complexity

Now let’s cover **regulatory reporting**, since that is one of the most decision-sensitive areas.

1. What types of incidents require regulatory assessment or notification?
2. Do you use a formal **materiality assessment** before deciding whether to notify a regulator?
3. What factors determine reportability — customer harm, service unavailability duration, data breach, cyber impact, financial market impact, critical service disruption, threshold breaches?
4. What are the key regulatory-reporting workflow steps? For example: assess materiality, notify Risk/Compliance, draft notification, approve notification, submit to regulator, track follow-ups.
5. What deadlines apply? For example, initial notification within X hours, updates every Y hours/days, final report within Z days.
6. Who approves regulatory submissions?

### Turn 8 — user

Let’s go through the regulatory reporting framework in detail:  1. **Types of Incidents Requiring Regulatory Assessment or Notification**: Regulatory notifications are typically required for:    - **Major Incidents**: Especially those with significant business or compliance implications.    - **Cybersecurity Incidents**: Particularly those leading to data breaches or potential threats to data security.    - **Incidents Resulting in Customer Harm**: If customers are affected materially in any way.    - **Prolonged Service Unavailability**: When an incident impacts critical services for extended periods.    - **Regulatory Threshold Breaches**: Any incident that crosses established thresholds regarding customer impact or service performance.  2. **Materiality Assessment**: Yes, we conduct a formal **materiality assessment** to determine whether regulatory notification is necessary. This assessment records the significance of the incident and evaluates its implications for reporting.  3. **Factors Determining Reportability**: Several factors influence the decision regarding reportability, including:    - **Customer Harm**: The extent of impact on customers as a result of the incident.    - **Service Unavailability Duration**: The length of time critical services are unavailable.    - **Data Breach**: Any breach involving personal or sensitive data that necessitates reporting.    - **Cyber Impact**: Severity and type of cyber incidents and their potential implications.    - **Financial Market Impact**: Comparatively significant impacts that could influence market performance or stability.    - **Critical Service Disruption**: The impact on essential services and their related business processes.    - **Threshold Breaches**: Defined metrics established by regulators that flag certain incidents as reportable.  4. **Key Regulatory-Reporting Workflow Steps**: The reporting process typically includes the following steps:    - **Assess Materiality**: Evaluate the incident to determine if it meets reportability criteria.    - **Notify Risk/Compliance**: Inform the appropriate risk and compliance teams about the incident for guidance and support.    - **Draft Notification**: Prepare the notification document, including all required details and evidence.    - **Approve Notification**: Obtain approvals from relevant stakeholders (e.g., Compliance, Legal) before submission.    - **Submit to Regulator**: Officially send the notification to the relevant regulatory authority.    - **Track Follow-ups**: Monitor and manage any follow-up communications or requirements from the regulator.  5. **Deadlines for Regulatory Reporting**: Standard deadlines include:    - **Initial Notification**: Typically within **24 hours** of determining that a report is needed.    - **Updates**: Every **48 hours** until the situation stabilizes or is resolved.    - **Final Report**: Must be submitted within **10 days** after the initial notification or as per regulatory specifications.  6. **Approval of Regulatory Submissions**: Regulatory submissions are generally approved by the designated **regulatory-reporting authority** within the bank, which could include the **Compliance Officer**, **Legal Department**, or an **Executive** accountable for compliance matters.  With the regulatory reporting process outlined, we now have a robust model of incident management, evidence, communications, reviews, and regulatory obligations. Would you like to summarize or delve deeper into any specific area?

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Materiality Assessment:\n    meaning: Formal assessment of an incident's significance and whether regulatory notification is required.\n    properties:\n      customerHarm:\n        type: text\n      serviceUnavailabilityDuration:\n        type: number\n        unit: hours\n      dataBreach:\n        type: boolean\n      cyberImpact:\n        type: text\n      financialMarketImpact:\n        type: text\n      criticalServiceDisruption:\n        type: text\n      thresholdBreach:\n        type: boolean\n      reportable:\n        type: boolean\n  Regulatory Submission:\n    meaning: Formal notification, update, final report, or supporting response submitted to a regulator for a reportable incident.\n    properties:\n      submissionType:\n        type: text\n        allowed: [Initial Notification, Update, Final Report, Follow-up Response]\n      submissionStatus:\n        type: text\n        allowed: [draft, awaiting approval, approved, submitted, follow-up required]\n      dueWithin:\n        type: number\n        unit: hours\n      submittedTime:\n        type: date\n  Regulator:\n    meaning: Regulatory authority that receives incident notifications, updates, final reports, or follow-up responses.\nrelationships:\n  - name: assesses\n    from: Materiality Assessment\n    to: Incident\n    meaning: A materiality assessment evaluates an incident against regulatory reportability factors.\n  - name: supportedBy\n    from: Materiality Assessment\n    to: Evidence Pack\n    meaning: A materiality assessment is supported by evidence assembled for regulatory assessment or submission.\n  - name: preparedFor\n    from: Regulatory Submission\n    to: Incident\n    meaning: A regulatory submission is prepared for a reportable incident.\n  - name: submittedTo\n    from: Regulatory Submission\n    to: Regulator\n    meaning: A regulatory submission is sent to the relevant regulatory authority.\n  - name: approvedBy\n    from: Regulatory Submission\n    to: Role\n    meaning: A regulatory submission is approved by the designated regulatory-reporting authority, Compliance Officer, Legal Department, or accountable Executive.\n  - name: evidencedBy\n    from: Regulatory Submission\n    to: Evidence Pack\n    meaning: A regulatory submission is supported by a regulatory submission evidence pack.\n  - name: produces\n    from: Materiality Assessment\n    to: Regulatory Submission\n    meaning: A reportable materiality assessment leads to a regulatory submission.\nrules:\n  regulatoryAssessmentRequired:\n    conditions:\n      - Major Incidents with significant business or compliance implications require regulatory assessment.\n      - Cybersecurity Incidents, especially those involving data breaches or threats to data security, require regulatory assessment.\n      - Incidents resulting in material customer harm require regulatory assessment.\n      - Prolonged unavailability of critical services requires regulatory assessment.\n      - Regulatory threshold breaches require regulatory assessment.\n  reportabilityFactors:\n    conditions:\n      - Customer harm influences reportability.\n      - Service unavailability duration for critical services influences reportability.\n      - Data breach involving personal or sensitive data influences reportability.\n      - Cyber impact severity and type influence reportability.\n      - Financial market impact influences reportability.\n      - Critical service disruption influences reportability.\n      - Defined regulator threshold breaches influence reportability.\n  regulatoryReportingWorkflow:\n    conditions:\n      - Assess materiality.\n      - Notify Risk/Compliance.\n      - Draft notification with required details and evidence.\n      - Approve notification through relevant stakeholders such as Compliance or Legal.\n      - Submit notification to the regulator.\n      - Track regulator follow-ups and requirements.\n  regulatoryReportingDeadlines:\n    conditions:\n      - Initial notification is typically submitted within 24 hours of determining that a report is needed.\n      - Updates are typically submitted every 48 hours until the situation stabilizes or is resolved.\n      - Final report is submitted within 10 days after the initial notification or as regulatory specifications require.\nactions:\n  assessMateriality:\n    input: Incident\n    preconditions: [regulatoryAssessmentRequired]\n  submitRegulatorySubmission:\n    input: Regulatory Submission\n    preconditions: [regulatoryReportingWorkflow, regulatoryReportingDeadlines]"
}
```

### Turn 8 — tool

Applied. Added 16, updated 0 existing item(s).

### Turn 8 — assistant

Excellent — I’ve added the **regulatory reporting** layer:

- **Materiality Assessment**
  - Assesses an Incident for reportability
  - Considers customer harm, service unavailability duration, data breach, cyber impact, financial market impact, critical service disruption, and threshold breaches
  - Produces a Regulatory Submission when reportable

- **Regulatory Submission**
  - Types: Initial Notification, Update, Final Report, Follow-up Response
  - Statuses: draft, awaiting approval, approved, submitted, follow-up required
  - Submitted to a **Regulator**
  - Approved by roles such as regulatory-reporting authority, Compliance Officer, Legal Department, or accountable Executive
  - Supported by a Regulatory Submission Evidence Pack

- Regulatory reporting workflow:
  1. Assess materiality
  2. Notify Risk/Compliance
  3. Draft notification with required evidence
  4. Approve notification
  5. Submit to regulator
  6. Track follow-ups

- Reporting deadlines:
  - Initial notification: within **24 hours** of determining reportability
  - Updates: every **48 hours** until stable/resolved
  - Final report: within **10 days** after initial notification, unless regulation specifies otherwise

Before I say the model is complete, I think there’s one important area still worth capturing: **detection and incident intake**. You mentioned detection at the start, and we currently only have monitoring alerts as evidence, not the actual detection model.

A few final questions:

1. What are the main sources by which incidents are detected? For example: monitoring alert, customer report, service desk ticket, synthetic monitoring, vendor notification, security alert, batch failure, business operations report.
2. Do you distinguish between an **Alert**, **Event**, **Ticket**, and **Incident**, or is that too granular for your governance model?
3. What are the criteria for promoting an alert or ticket into an incident?
4. Who triages incoming events or alerts — Service Desk, NOC, SOC, resolver group, or automated monitoring?
5. Are there required triage actions, such as assess impact, identify affected service, assign severity, assign owner, start timeline, or escalate to major incident process?

### Turn 9 — user

Let’s round out the detection and incident intake model to complete our framework:  1. **Main Sources of Incident Detection**: Incidents can be detected through various sources, including:    - **Monitoring Alerts**: Notifications triggered by monitoring systems when they detect anomalies or failures.    - **Customer Reports**: Issues reported directly by customers experiencing problems with services.    - **Service Desk Tickets**: Reports generated when customers or staff submit tickets for issues.    - **Synthetic Monitoring**: Automated testing methods that simulate user interactions to identify performance or availability issues.    - **Vendor Notifications**: Alerts raised by third-party service providers regarding service interruptions or issues.    - **Security Alerts**: Notifications from the Security Operations Centre (SOC) indicating potential security incidents.    - **Batch Failures**: Reports of failures in scheduled jobs or processes which may indicate underlying incidents.    - **Business Operations Reports**: Internal reports generated by operational teams that highlight issues impacting services or processes.  2. **Distinction Between Alert, Event, Ticket, and Incident**: Yes, we do differentiate between these terms, as each serves a distinct purpose in our governance model:    - **Alert**: A condition raised by monitoring systems indicating an issue that may require attention.    - **Event**: An observed occurrence that may or may not lead to an incident; it is often less urgent.    - **Ticket**: A documented user-reported issue that may lead to further investigation.    - **Incident**: An unplanned interruption or degradation of an IT service requiring a coordinated response.  3. **Criteria for Promoting Alerts or Tickets into Incidents**: The following criteria are typically used to promote alerts or tickets into incident status:    - **Severity Level**: Alerts or tickets assessed as severe enough to indicate significant service impact.    - **Confirmed Impact**: If a ticket is linked to acknowledged service disruption or confirmed customer impact.    - **Multiple Alerts/Tickets**: Accumulating alerts or tickets that indicate a broader service issue or outage.    - **Service Criticality**: If the affected service is deemed critical to business operations requiring immediate attention.  4. **Triage of Incoming Events or Alerts**: The triage of incoming events or alerts is typically carried out by the following teams:    - **Service Desk**: First point of contact for user-reported issues, they will triage tickets and escalate as necessary.    - **Network Operations Centre (NOC)**: Monitors alerts related to network and infrastructure services and can escalate issues.    - **Security Operations Centre (SOC)**: Focuses on security alerts and escalates incidents related to cybersecurity.    - **Resolver Groups**: Involved after initial triage to investigate and resolve issues.    - **Automated Monitoring Tools**: In some cases, automation can handle initial alert triage actions, routing significant issues appropriately.  5. **Required Triage Actions**: Yes, there are several standard triage actions that must be undertaken, including:    - **Assess Impact**: Determine how severely the alert or ticket affects services and customers.    - **Identify Affected Service**: Link the issue to the relevant business or IT service.    - **Assign Severity**: Classify the alert or ticket by severity level (e.g., Sev1, Sev2).    - **Assign Owner**: Designate a resolver group or individual responsible for handling the incident.    - **Start Timeline**: Document timing for tracking the incident lifecycle.    - **Escalate to Major Incident Process**: Trigger this escalation if criteria for major incidents are met.  With the detection and incident intake model fully captured, we can consider this comprehensive overview complete. Would you like to summarize any specific areas or seek further clarification on any aspect?

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Alert:\n    meaning: Condition raised by monitoring systems indicating an issue that may require attention.\n    properties:\n      detectionSource:\n        type: text\n        allowed: [Monitoring Alert, Synthetic Monitoring, Security Alert, Batch Failure]\n      severityLevel:\n        type: text\n        allowed: [Sev1, Sev2, Sev3, Sev4]\n      confirmedImpact:\n        type: boolean\n      multipleRelatedSignals:\n        type: boolean\n  Event:\n    meaning: Observed occurrence that may or may not lead to an incident and is often less urgent.\n    properties:\n      detectionSource:\n        type: text\n        allowed: [Monitoring Alert, Synthetic Monitoring, Vendor Notification, Security Alert, Batch Failure, Business Operations Report]\n  Ticket:\n    meaning: Documented user-reported or staff-reported issue that may lead to investigation or promotion to an incident.\n    properties:\n      detectionSource:\n        type: text\n        allowed: [Customer Report, Service Desk Ticket, Business Operations Report]\n      severityLevel:\n        type: text\n        allowed: [Sev1, Sev2, Sev3, Sev4]\n      confirmedImpact:\n        type: boolean\n      multipleRelatedSignals:\n        type: boolean\n  Triage:\n    meaning: Initial assessment and routing of alerts, events, or tickets to determine impact, service linkage, severity, ownership, timeline, and escalation path.\n    properties:\n      impactAssessed:\n        type: boolean\n      affectedServiceIdentified:\n        type: boolean\n      severityAssigned:\n        type: boolean\n      ownerAssigned:\n        type: boolean\n      timelineStarted:\n        type: boolean\n      escalatedToMajorIncidentProcess:\n        type: boolean\nrelationships:\n  - name: triages\n    from: Team\n    to: Alert\n    meaning: A team triages an alert to determine its impact and routing.\n  - name: triages\n    from: Team\n    to: Event\n    meaning: A team triages an event to determine whether it requires incident handling.\n  - name: triages\n    from: Team\n    to: Ticket\n    meaning: A team triages a ticket to determine its impact and routing.\n  - name: performedBy\n    from: Triage\n    to: Team\n    meaning: Triage is performed by the Service Desk, Network Operations Centre, Security Operations Centre, resolver groups, or supported by automated monitoring tools.\n  - name: evaluates\n    from: Triage\n    to: Alert\n    meaning: Triage evaluates an alert for possible incident promotion.\n  - name: evaluates\n    from: Triage\n    to: Event\n    meaning: Triage evaluates an event for possible incident promotion.\n  - name: evaluates\n    from: Triage\n    to: Ticket\n    meaning: Triage evaluates a ticket for possible incident promotion.\n  - name: promotedTo\n    from: Alert\n    to: Incident\n    meaning: An alert is promoted to an incident when promotion criteria are met.\n  - name: promotedTo\n    from: Event\n    to: Incident\n    meaning: An event is promoted to an incident when investigation confirms incident criteria.\n  - name: promotedTo\n    from: Ticket\n    to: Incident\n    meaning: A ticket is promoted to an incident when promotion criteria are met.\n  - name: identifiesAffected\n    from: Triage\n    to: Business Service\n    meaning: Triage identifies the affected business service.\n  - name: identifiesAffected\n    from: Triage\n    to: IT Service\n    meaning: Triage identifies the affected IT service.\nrules:\n  incidentPromotionCriteria:\n    conditions:\n      - Alert or ticket severity is assessed as high enough to indicate significant service impact.\n      - Confirmed service disruption or confirmed customer impact promotes a ticket or alert toward incident status.\n      - Multiple related alerts or tickets indicate a broader service issue or outage.\n      - Affected service criticality requires immediate coordinated response.\n  requiredTriageActions:\n    conditions:\n      - Assess impact on services and customers.\n      - Identify affected business or IT service.\n      - Assign severity such as Sev1 or Sev2.\n      - Assign owner such as a resolver group or individual responsible for handling the incident.\n      - Start the incident timeline.\n      - Escalate to the Major Incident process if major incident criteria are met.\nactions:\n  performTriage:\n    input: Triage\n    preconditions: [requiredTriageActions]\n  promoteToIncident:\n    input: Alert\n    preconditions: [incidentPromotionCriteria]"
}
```

### Turn 9 — tool

Applied. Added 20, updated 0 existing item(s).

### Turn 9 — assistant

Thank you — I’ve captured the final **detection and incident intake** layer.

The model now includes:

- **Alert**
  - Raised by monitoring systems or related tooling
  - Sources include monitoring alert, synthetic monitoring, security alert, and batch failure

- **Event**
  - Observed occurrence that may or may not become an incident

- **Ticket**
  - Documented user/staff-reported issue, including customer reports and service desk tickets

- **Triage**
  - Performed by Service Desk, NOC, SOC, resolver groups, and sometimes automated monitoring tools
  - Evaluates alerts, events, and tickets
  - Identifies affected Business or IT Service
  - Supports promotion to Incident

- Incident promotion criteria:
  - Severity indicates significant service impact
  - Confirmed service disruption or customer impact
  - Multiple related alerts or tickets suggest a wider outage
  - Critical service involvement requires coordinated response

- Required triage actions:
  - Assess impact
  - Identify affected service
  - Assign severity
  - Assign owner
  - Start timeline
  - Escalate to Major Incident process if criteria are met

At this point, I believe the interview has covered the domain model needed for your IT operations governance and major-incident management framework.

We have modeled the full lifecycle:

1. **Service and dependency structure**
2. **Incident classification and decision ownership**
3. **Recovery actions and emergency changes**
4. **Evidence management**
5. **Communications**
6. **Post-incident reviews**
7. **Regulatory reporting**
8. **Detection, intake, triage, and promotion to incident**

One small note: the model currently includes the action **promoteToIncident** specifically with **Alert** as input. If you also want the same formal action for **Ticket** and **Event**, we could add those as separate actions, since the ontology action input takes a single class.
