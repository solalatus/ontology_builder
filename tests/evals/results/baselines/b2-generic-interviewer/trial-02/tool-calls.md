# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-08-05T10:12:33.535Z

### Turn 1 — user

I lead IT operations governance and major-incident management for the bank. I can walk you through how we structure services and technical dependencies, how we detect and manage incidents, who owns decisions, how recovery and emergency changes work, and how we handle evidence, communications, reviews, and regulatory-reporting workflows. Where would you like to start?

### Turn 1 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Service:\n    meaning: A bank IT service that operations governance manages and protects.\n  Technical Dependency:\n    meaning: A technology component or upstream/downstream dependency that can affect a service.\n  Incident:\n    meaning: An operational disruption or event detected and managed by IT operations.\n  Major Incident:\n    meaning: A high-impact incident managed through the bank's major-incident process.\n  Decision Owner:\n    meaning: A person or role accountable for making operational or incident-management decisions.\n  Recovery:\n    meaning: The work performed to restore service after an incident.\n  Emergency Change:\n    meaning: An urgent change used to mitigate or recover from an incident.\n  Evidence:\n    meaning: Material retained to support incident handling, review, audit, or regulatory reporting.\n  Communication:\n    meaning: A message or update sent to stakeholders during or after an incident.\n  Review:\n    meaning: A post-incident or governance assessment of incident handling and outcomes.\n  Regulatory Reporting Workflow:\n    meaning: The process used to assess, prepare, approve, and submit required regulatory reports.\nrelationships:\n  - name: affects\n    from: Incident\n    to: Service\n    meaning: An incident has operational impact on a service.\n  - name: dependsOn\n    from: Service\n    to: Technical Dependency\n    meaning: A service relies on a technical dependency.\n  - name: ownsDecisionFor\n    from: Decision Owner\n    to: Incident\n    meaning: A decision owner is accountable for decisions during an incident.\n  - name: supports\n    from: Evidence\n    to: Review\n    meaning: Evidence is used to support a review.\n  - name: informs\n    from: Communication\n    to: Incident\n    meaning: A communication provides an update about an incident."
}
```

### Turn 1 — tool

Applied. Added 16, updated 0 existing item(s).

### Turn 1 — assistant

Let’s start with the structure of **services and technical dependencies**, because that usually anchors incident impact, ownership, recovery priorities, communications, and regulatory assessment.

I’ve initialized a first-cut model with the concepts you mentioned: Service, Technical Dependency, Incident, Major Incident, Decision Owner, Recovery, Emergency Change, Evidence, Communication, Review, and Regulatory Reporting Workflow.

To refine it, could you walk me through:

1. **Service structure**
   - What counts as a “service” in your governance model?
   - Do you distinguish business service, IT service, application, platform, infrastructure component, or process?

2. **Criticality and impact**
   - How do you classify service criticality?
   - Are there formal tiers such as critical, important, standard, or regulatory-impacting?

3. **Dependencies**
   - What dependency types matter for decisions?
   - For example: application, database, network, third-party provider, data center, cloud service, batch process, identity service.

4. **Ownership**
   - Who owns a service versus who owns a technical dependency?
   - Are ownership roles named things like Service Owner, Application Owner, Technology Owner, Business Owner?

5. **Recovery targets**
   - Do services have recovery targets such as RTO, RPO, maximum tolerable downtime, or customer-impact thresholds?

Once we confirm those, I’ll update the model with the bank’s actual terminology.

### Turn 2 — user

Certainly! I'll provide insights into each area you've highlighted:  ### 1. Service Structure In our governance model, we define **services** as capabilities that deliver value to our customers or business operations. We distinctly differentiate between types of services:  - **Business Service**: A customer-facing service that represents a specific business capability, such as a loan application process or online banking features. - **IT Service**: The underlying technology capability that supports one or more business services, like payment processing systems or customer relationship management tools. - **Application**: A specific software system that provides operational functionality to support IT services. - **Platform and Infrastructure Components**: These refer to the hardware and software environments where applications run, including servers, databases, and networks. - **Business Processes**: These are broader than services, encompassing the coordinated set of activities leading to a business outcome.  ### 2. Criticality and Impact We classify service criticality into several formal tiers to help prioritize issues:  - **Tier 1 - Critical**: Services that have a substantial impact on business operations or regulatory compliance. Outages here can lead to significant financial loss or regulatory penalties. - **Tier 2 - Important**: Important services that support essential business functions but may not have immediate severe consequences if disrupted. - **Tier 3 - Standard**: Regular services with minimal impact on business operations; their failure does not lead to urgent interventions.  These classifications help inform incident prioritization and recovery strategies.  ### 3. Dependencies For decision-making, we consider various types of dependencies, crucial for understanding the impacts of incidents:  - **Application Dependencies**: Shows how applications rely on databases or other services. - **Database Dependencies**: Considers how applications connect to different data backends. - **Network Dependencies**: Details the network architecture that supports communication between services. - **Third-Party Providers**: External services that may affect our operations, like cloud services or payment processors. - **Data Center and Cloud Services**: The physical and virtual environments where our services and data are hosted. - **Batch Processes and Identity Services**: Background processes that support operational activities and user authentication.  These dependencies are essential for assessing incident impact and determining recovery priorities.  ### 4. Ownership Ownership roles are key to accountability in service management. We have distinct ownership designations:  - **Service Owner**: Accountable for the overall lifecycle and performance of a specific IT service. They often liaise with business stakeholders. - **Application Owner**: Responsible for a particular application, ensuring it meets functional and operational requirements. - **Technical Owner**: Manages the engineering aspects of configuration items (like infrastructure components) to maintain their operational fitness. - **Business Owner**: Has a broader responsibility for the strategic direction of a business service or process, ensuring that it aligns with business objectives.  These roles define who makes decisions about service management, incidents, and changes.  ### 5. Recovery Targets Yes, services do have formal recovery targets which include:  - **Recovery Time Objective (RTO)**: The maximum acceptable time for restoring a service after an incident. - **Recovery Point Objective (RPO)**: The maximum acceptable amount of data loss measured in time. - **Maximum Tolerable Downtime (MTD)**: The absolute limit of time that a service can be unavailable before causing serious damage to the business. - **Customer Impact Thresholds**: Defined by service levels that determine the acceptable level of service degradation from the customer's perspective.  These recovery targets guide our actions during incident response and help establish expectations with stakeholders.  Let me know if you'd like to dive deeper into any specific area, or if there's anything you would like to clarify or follow up on!

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Service:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 - Critical, Tier 2 - Important, Tier 3 - Standard]\n      RTO:\n        type: number\n        unit: minutes\n      RPO:\n        type: number\n        unit: minutes\n      MTD:\n        type: number\n        unit: minutes\n      customerImpactThreshold:\n        type: text\n  Business Service:\n    meaning: A customer-facing service that represents a specific business capability.\n  IT Service:\n    meaning: An underlying technology capability that supports one or more business services.\n  Application:\n    meaning: A specific software system that provides operational functionality to support IT services.\n  Platform and Infrastructure Component:\n    meaning: The hardware or software environment where applications run, including servers, databases, and networks.\n    aliases: [Platform, Infrastructure Component]\n  Business Process:\n    meaning: A coordinated set of activities leading to a business outcome, broader than an individual service.\n  Technical Dependency:\n    properties:\n      dependencyType:\n        type: text\n        allowed: [Application Dependency, Database Dependency, Network Dependency, Third-Party Provider, Data Center, Cloud Service, Batch Process, Identity Service]\n  Service Owner:\n    meaning: The role accountable for the lifecycle and performance of a specific IT service.\n  Application Owner:\n    meaning: The role responsible for a particular application meeting functional and operational requirements.\n  Technical Owner:\n    meaning: The role that manages engineering aspects of configuration items to maintain operational fitness.\n  Business Owner:\n    meaning: The role responsible for the strategic direction of a business service or process.\n  Configuration Item:\n    meaning: A managed technology item such as an infrastructure component whose configuration and operational fitness are governed.\n    aliases: [CI]\nrelationships:\n  - name: isServiceTypeOf\n    from: Business Service\n    to: Service\n    meaning: A business service is a kind of service in the governance model.\n  - name: isServiceTypeOf\n    from: IT Service\n    to: Service\n    meaning: An IT service is a kind of service in the governance model.\n  - name: supports\n    from: IT Service\n    to: Business Service\n    meaning: An IT service provides underlying technology capability for a business service.\n  - name: supports\n    from: Application\n    to: IT Service\n    meaning: An application provides operational functionality for an IT service.\n  - name: runsOn\n    from: Application\n    to: Platform and Infrastructure Component\n    meaning: An application operates on a platform or infrastructure component.\n  - name: encompasses\n    from: Business Process\n    to: Business Service\n    meaning: A business process includes or coordinates services to produce a business outcome.\n  - name: dependsOn\n    from: Application\n    to: Technical Dependency\n    meaning: An application relies on a technical dependency such as a database, network, third party, data center, cloud service, batch process, or identity service.\n  - name: accountableFor\n    from: Service Owner\n    to: IT Service\n    meaning: A service owner is accountable for the lifecycle and performance of an IT service.\n  - name: responsibleFor\n    from: Application Owner\n    to: Application\n    meaning: An application owner is responsible for an application meeting functional and operational requirements.\n  - name: manages\n    from: Technical Owner\n    to: Configuration Item\n    meaning: A technical owner manages engineering aspects of a configuration item.\n  - name: accountableFor\n    from: Business Owner\n    to: Business Service\n    meaning: A business owner is accountable for the strategic direction of a business service.\n  - name: accountableFor\n    from: Business Owner\n    to: Business Process\n    meaning: A business owner is accountable for the strategic direction of a business process."
}
```

### Turn 2 — tool

Applied. Added 22, updated 2 existing item(s).

### Turn 2 — assistant

Great — I’ve added the service structure, criticality tiers, key recovery targets, dependency types, and ownership roles to the model.

What I understand so far:

- A **Service** is a capability delivering value to customers or business operations.
- You distinguish:
  - **Business Service**
  - **IT Service**
  - **Application**
  - **Platform and Infrastructure Component**
  - **Business Process**
- **Business Services** are supported by **IT Services**.
- **IT Services** are supported by **Applications**.
- **Applications** run on **Platform and Infrastructure Components** and depend on technical dependencies such as databases, networks, third parties, cloud services, batch processes, and identity services.
- Services have decision-relevant attributes:
  - criticality tier
  - RTO
  - RPO
  - MTD
  - customer impact threshold
- Ownership is split across:
  - **Service Owner**
  - **Application Owner**
  - **Technical Owner**
  - **Business Owner**

Next I’d like to move into **incident detection and major-incident classification**, because that determines escalation, decision ownership, recovery actions, communications, evidence, and regulatory workflows.

Could you walk me through:

1. **Detection sources**
   - How are incidents detected?
   - Examples: monitoring alerts, customer complaints, staff reports, third-party notifications, synthetic monitoring, security operations, batch failures.

2. **Incident classification**
   - What makes something an **Incident** versus a **Major Incident**?
   - Do you use severity levels such as Sev 1, Sev 2, Sev 3?

3. **Impact assessment**
   - What factors determine severity?
   - For example: service criticality, customer impact, payment disruption, regulatory breach risk, financial loss, duration, geographic spread, data integrity, cyber involvement.

4. **Incident roles**
   - Who runs the incident?
   - Do you use roles such as Incident Manager, Major Incident Manager, Technical Lead, Communications Lead, Business Lead, Executive Sponsor?

5. **Escalation**
   - What are the rules or thresholds for escalating to major incident status?

### Turn 3 — user

Certainly! Let's go through each of these areas related to incident detection and major-incident classification:  ### 1. Detection Sources Incidents can be detected from various sources, and each plays a critical role in identifying issues promptly:  - **Monitoring Alerts**: Notifications generated by monitoring tools when thresholds are breached (e.g., performance degradation, service unavailability). - **Customer Complaints**: Direct reports from customers who may experience service issues or disruptions. - **Staff Reports**: Internal staff alerts, often via the Service Desk, regarding issues they've identified or observed. - **Third-Party Notifications**: Alerts from vendors or partners about outages or issues affecting their services that might impact our systems. - **Synthetic Monitoring**: Proactive tests designed to emulate user interactions with services, helping catch performance issues before they affect customers. - **Security Operations**: Alerts from the Security Operations Centre (SOC) concerning potential cybersecurity incidents or threats. - **Batch Failures**: Errors detected in scheduled processes or batch jobs that can disrupt services.  ### 2. Incident Classification An **Incident** is defined as an unplanned disruption or degradation of service. A **Major Incident** requires exceptional coordination due to its high impact on business operations or compliance.  The distinction is primarily based on severity:  - **Severity Levels**: We categorize incidents as follows:   - **Sev 1 (Critical)**: Complete business service outage affecting significant customer segments or regulatory compliance.   - **Sev 2 (High)**: Major service degradation impacting critical functions, but not a full outage.   - **Sev 3 (Medium)**: Minor issues that affect service quality but allow continued operation.  The classification into Major Incidents usually occurs when an incident is categorized as Sev 1 or Sev 2, and it meets certain operational impact criteria.  ### 3. Impact Assessment The factors we consider to determine the severity of an incident include:  - **Service Criticality**: The tier assigned to the impacted service, dictating its importance to business operations. - **Customer Impact**: The extent to which customers are affected by the incident, such as user numbers or business volume impacted. - **Payment Disruption**: Any interruptions affecting payment processing or transaction capabilities can elevate severity levels. - **Regulatory Breach Risk**: Incidents that pose a risk of non-compliance with regulatory requirements increase criticality. - **Financial Loss Potential**: The estimated financial implications resulting from service disruption (e.g., loss of revenue). - **Duration**: The expected or actual downtime impacts the urgency and severity classification. - **Geographic Spread**: Impacts affecting multiple regions may require higher escalation due to complexity. - **Data Integrity Concerns**: Incidents that jeopardize the integrity of stored or processed data. - **Cyber Involvement**: Any security-related incidents, such as breaches or attacks, necessitate higher scrutiny.  ### 4. Incident Roles Running an incident involves collaboration among various roles:  - **Incident Manager**: Responsible for coordinating the overall incident response, ensuring effective communication and resource allocation. - **Major Incident Manager**: Leads the response specifically for major incidents, driving rapid resolution and coordination among stakeholders. - **Technical Lead**: Provides technical expertise and guidance on resolution actions by the resolver teams. - **Communications Lead**: Manages internal and external communications related to the incident, ensuring timely and accurate information dissemination. - **Business Lead**: Represents business interests and ensures alignment with operational goals during incident handling. - **Executive Sponsor**: An executive-level stakeholder who supports resources and prioritization during major incidents.  ### 5. Escalation We have specific thresholds for escalating an incident to major-incident status:  - An incident must not be in a resolved, closed, or cancelled state. - It should be classified with a severity level of Sev 1 or Sev 2. - At least one critical business service must be impacted, with quantifiable customer effect. - An incident commander must be assigned for coordination.  These criteria help ensure that we escalate appropriately and allocate resources effectively in response to major incidents.  If you have any more inquiries or need further details on any specific aspect, feel free to ask!

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: An unplanned disruption or degradation of service.\n    properties:\n      severityLevel:\n        type: text\n        allowed: [Sev 1, Sev 2, Sev 3]\n      state:\n        type: text\n        allowed: [open, resolved, closed, cancelled]\n      customerImpact:\n        type: text\n      paymentDisruption:\n        type: boolean\n      regulatoryBreachRisk:\n        type: boolean\n      financialLossPotential:\n        type: text\n      duration:\n        type: number\n        unit: minutes\n      geographicSpread:\n        type: text\n      dataIntegrityConcerns:\n        type: boolean\n      cyberInvolvement:\n        type: boolean\n  Major Incident:\n    meaning: An incident requiring exceptional coordination due to high impact on business operations or compliance.\n  Detection Source:\n    meaning: A channel or mechanism through which an incident is identified.\n    properties:\n      sourceType:\n        type: text\n        allowed: [Monitoring Alerts, Customer Complaints, Staff Reports, Third-Party Notifications, Synthetic Monitoring, Security Operations, Batch Failures]\n  Incident Manager:\n    meaning: The role responsible for coordinating the overall incident response, communication, and resource allocation.\n  Major Incident Manager:\n    meaning: The role that leads the response for major incidents and drives rapid resolution and stakeholder coordination.\n  Technical Lead:\n    meaning: The role that provides technical expertise and guides resolver teams on resolution actions.\n  Communications Lead:\n    meaning: The role that manages internal and external communications for an incident.\n  Business Lead:\n    meaning: The role that represents business interests and alignment with operational goals during incident handling.\n  Executive Sponsor:\n    meaning: The executive-level stakeholder who supports resources and prioritization during major incidents.\n  Incident Commander:\n    meaning: The assigned coordinator for an incident used as a threshold for major-incident escalation.\nrelationships:\n  - name: isIncidentTypeOf\n    from: Major Incident\n    to: Incident\n    meaning: A major incident is a high-impact incident category in the incident process.\n  - name: detectedFrom\n    from: Incident\n    to: Detection Source\n    meaning: An incident is identified through a detection source.\n  - name: coordinates\n    from: Incident Manager\n    to: Incident\n    meaning: An incident manager coordinates incident response, communication, and resource allocation.\n  - name: leadsResponseFor\n    from: Major Incident Manager\n    to: Major Incident\n    meaning: A major incident manager leads the response for a major incident.\n  - name: guidesResolutionFor\n    from: Technical Lead\n    to: Incident\n    meaning: A technical lead guides resolver teams on resolution actions for an incident.\n  - name: managesCommunicationsFor\n    from: Communications Lead\n    to: Incident\n    meaning: A communications lead manages internal and external communications related to an incident.\n  - name: representsBusinessFor\n    from: Business Lead\n    to: Incident\n    meaning: A business lead represents business interests during incident handling.\n  - name: sponsors\n    from: Executive Sponsor\n    to: Major Incident\n    meaning: An executive sponsor supports resources and prioritization for a major incident.\n  - name: assignedToCoordinate\n    from: Incident Commander\n    to: Incident\n    meaning: An incident commander is assigned to coordinate the incident.\nrules:\n  majorIncidentEscalationCandidate:\n    conditions:\n      - Incident state is not resolved, closed, or cancelled.\n      - Incident severity level is Sev 1 or Sev 2.\n      - At least one Tier 1 - Critical business service is impacted.\n      - Customer effect is quantifiable.\n      - An incident commander is assigned for coordination.\nactions:\n  escalateToMajorIncident:\n    input: Incident\n    preconditions: [majorIncidentEscalationCandidate]"
}
```

### Turn 3 — tool

Applied. Added 19, updated 2 existing item(s).

### Turn 3 — assistant

Thanks — I’ve updated the model with detection sources, severity levels, impact factors, incident roles, escalation criteria, and the action to escalate an Incident to a Major Incident.

Current understanding:

- An **Incident** is an unplanned disruption or degradation of service.
- A **Major Incident** is a high-impact incident requiring exceptional coordination.
- Incidents are detected from:
  - Monitoring Alerts
  - Customer Complaints
  - Staff Reports
  - Third-Party Notifications
  - Synthetic Monitoring
  - Security Operations
  - Batch Failures
- Severity levels are:
  - **Sev 1** — critical outage, significant customer or regulatory impact
  - **Sev 2** — high-impact degradation of critical functions
  - **Sev 3** — medium/minor issue with continued operation
- Major-incident escalation requires:
  - incident is not resolved, closed, or cancelled
  - severity is Sev 1 or Sev 2
  - at least one critical business service is impacted
  - customer effect is quantifiable
  - an incident commander is assigned

One clarification before moving on: is the **Incident Commander** the same role as the **Major Incident Manager**, or are they distinct in your process?

Next, I’d like to cover **recovery and emergency changes**.

Could you describe:

1. **Recovery approach**
   - What recovery strategies do you use?
   - Examples: failover, rollback, workaround, restart, restore from backup, traffic reroute, manual processing, vendor remediation.

2. **Recovery decision-making**
   - Who approves or directs recovery actions during a major incident?
   - Is that the Incident Commander, Major Incident Manager, Technical Lead, Service Owner, Business Owner, or an emergency governance group?

3. **Emergency changes**
   - When is an emergency change required versus a normal incident recovery action?
   - What types of emergency changes occur during incidents?

4. **Emergency change approval**
   - Who approves emergency changes?
   - Do you use an Emergency CAB / ECAB or delegated approval model?

5. **Recovery validation**
   - How do you decide that service is restored?
   - Do you require technical validation, business validation, customer-impact validation, monitoring stability period, or evidence capture?

### Turn 4 — user

Let's clarify the roles and processes regarding recovery and emergency changes:  ### Incident Commander vs. Major Incident Manager The **Incident Commander** and **Major Incident Manager** can sometimes refer to the same person, depending on the bank’s organizational structure. However, the **Incident Commander** is specifically responsible for the overall coordination and management of incidents, whereas the **Major Incident Manager** oversees the additional layers of coordination required during major incidents due to their complexity and high impact. The distinction helps ensure focused leadership and clear accountability during critical situations.  ### 1. Recovery Approach Our recovery strategies include a variety of methodologies to restore services efficiently and effectively:  - **Failover**: Switching to a standby database or server to maintain operations without significant downtime. - **Rollback**: Reverting to a previous state following a failed change or deployment to restore service functionality. - **Workaround**: Implementing temporary solutions to minimize incident impact until a permanent resolution can be applied. - **Restart**: Rebooting affected servers or applications to resolve transient issues. - **Restore from Backup**: Recovering data and services from previously created backup sets in the event of loss or corruption. - **Traffic Reroute**: Redirecting user traffic to a less affected region/instance to manage load and maintain service availability. - **Manual Processing**: Carrying out essential tasks manually during a service disruption until automated functions can be restored. - **Vendor Remediation**: Engaging external vendors to resolve issues related to their provided services or products that contribute to the incident.  ### 2. Recovery Decision-Making During a major incident, recovery decisions are typically directed by:  - **Incident Commander**: The primary role responsible for coordinating all aspects of the incident response, including recovery efforts. - **Major Incident Manager**: If distinct from the Incident Commander, they would also be involved in decisions related to major incidents. - **Technical Lead**: Provides insights on the technical feasibility of recovery actions. - **Service Owner** or **Business Owner**: They may have a say in determining acceptable service levels and recovery priorities.  The actual approval process for recovery actions may depend on the specifics of the incident and the organizational structure in place.  ### 3. Emergency Changes An **emergency change** is required when:  - Immediate action is necessary to restore service or safeguard against further impact. - The situation demands deviation from standard change processes due to time constraints.  Normal incident recovery actions can involve planned steps without the urgent risk profile associated with emergency changes.  Types of emergency changes might include:  - **Quick patches or fixes** to address vulnerabilities discovered during an incident. - **Configuration changes** implemented to adjust performance settings for a critical service. - **Deployment of backup systems** to restore degraded service capabilities.  ### 4. Emergency Change Approval Emergency changes are typically approved by:  - **Emergency Change Advisory Board (ECAB)**: This may be a delegated group specifically tasked with rapid approval of emergency changes. - **Designated Approvers**: Often, the Incident Commander or Major Incident Manager has the authority to approve emergency changes, particularly when rapid action is needed.  This rapid approval process helps ensure that critical actions can be taken without extensive delays from standard governance procedures.  ### 5. Recovery Validation To confirm that a service is restored, we look for several validation measures:  - **Technical Validation**: Ensuring systems and applications are functioning correctly and meeting baseline functionalities. - **Business Validation**: Confirmation from business stakeholders that the service meets their operational needs. - **Customer-Impact Validation**: Ensuring that end-users are satisfied and that customer functionalities have returned to normal. - **Monitoring Stability Period**: Observing service performance over a defined period to ensure stability and detect any potential issues. - **Evidence Capture**: Documenting the recovery process and outcomes for audit purposes and future reference.  These steps help ensure a robust and thorough recovery process, minimizing the likelihood of recurring issues.  Let me know if you need clarification on any part or if you want to explore other topics!

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident Commander:\n    meaning: The role responsible for overall coordination and management of incidents, including recovery efforts.\n  Major Incident Manager:\n    meaning: The role that oversees the additional coordination required for complex, high-impact major incidents.\n  Recovery:\n    properties:\n      recoveryStrategy:\n        type: text\n        allowed: [Failover, Rollback, Workaround, Restart, Restore from Backup, Traffic Reroute, Manual Processing, Vendor Remediation]\n  Emergency Change:\n    meaning: An urgent change required when immediate action is needed to restore service or safeguard against further impact and the standard change process cannot be followed in time.\n    properties:\n      emergencyChangeType:\n        type: text\n        allowed: [Quick Patch or Fix, Configuration Change, Deployment of Backup Systems]\n  Emergency Change Advisory Board:\n    meaning: A delegated group tasked with rapid approval of emergency changes.\n    aliases: [ECAB, Emergency CAB]\n  Designated Approver:\n    meaning: A person or role with delegated authority to approve an emergency change when rapid action is needed.\n  Recovery Validation:\n    meaning: A check used to confirm that service has been restored after recovery.\n    properties:\n      validationType:\n        type: text\n        allowed: [Technical Validation, Business Validation, Customer-Impact Validation, Monitoring Stability Period, Evidence Capture]\n  Monitoring Stability Period:\n    meaning: A defined observation period used to ensure recovered service performance remains stable.\nrelationships:\n  - name: mayBeSamePersonAs\n    from: Incident Commander\n    to: Major Incident Manager\n    meaning: The incident commander and major incident manager can refer to the same person depending on organizational structure.\n  - name: directsRecoveryFor\n    from: Incident Commander\n    to: Incident\n    meaning: The incident commander directs or coordinates recovery efforts for an incident.\n  - name: involvedInRecoveryDecisionFor\n    from: Major Incident Manager\n    to: Major Incident\n    meaning: The major incident manager is involved in recovery decisions for a major incident when distinct from the incident commander.\n  - name: advisesRecoveryFor\n    from: Technical Lead\n    to: Incident\n    meaning: The technical lead advises on the technical feasibility of recovery actions.\n  - name: setsRecoveryPrioritiesFor\n    from: Service Owner\n    to: IT Service\n    meaning: The service owner may help determine acceptable service levels and recovery priorities for an IT service.\n  - name: setsRecoveryPrioritiesFor\n    from: Business Owner\n    to: Business Service\n    meaning: The business owner may help determine acceptable service levels and recovery priorities for a business service.\n  - name: restores\n    from: Recovery\n    to: Service\n    meaning: A recovery action restores or reduces impact to a service.\n  - name: mitigates\n    from: Recovery\n    to: Incident\n    meaning: A recovery action mitigates an incident.\n  - name: requires\n    from: Incident\n    to: Emergency Change\n    meaning: An incident requires an emergency change when immediate action is needed and standard change process timing is not viable.\n  - name: approves\n    from: Emergency Change Advisory Board\n    to: Emergency Change\n    meaning: The ECAB rapidly approves emergency changes.\n  - name: approves\n    from: Designated Approver\n    to: Emergency Change\n    meaning: A designated approver authorizes an emergency change under delegated authority.\n  - name: validates\n    from: Recovery Validation\n    to: Recovery\n    meaning: A recovery validation confirms that recovery outcomes are acceptable.\n  - name: observedDuring\n    from: Monitoring Stability Period\n    to: Recovery Validation\n    meaning: A monitoring stability period is used as part of recovery validation.\n  - name: capturesEvidenceFor\n    from: Evidence\n    to: Recovery\n    meaning: Evidence documents the recovery process and outcomes for audit and future reference.\nrules:\n  emergencyChangeRequired:\n    conditions:\n      - Immediate action is necessary to restore service or safeguard against further impact.\n      - The situation demands deviation from standard change processes due to time constraints.\n  recoveryCanBeConfirmed:\n    conditions:\n      - Technical validation confirms systems and applications are functioning correctly.\n      - Business validation confirms the service meets operational needs when business confirmation is required.\n      - Customer-impact validation confirms customer functionality has returned to normal when customer impact occurred.\n      - Monitoring stability period shows stable service performance.\n      - Recovery evidence has been captured.\nactions:\n  approveEmergencyChange:\n    input: Emergency Change\n    preconditions: [emergencyChangeRequired]\n  confirmRecovery:\n    input: Recovery\n    preconditions: [recoveryCanBeConfirmed]"
}
```

### Turn 4 — tool

Applied. Added 22, updated 4 existing item(s).

### Turn 4 — assistant

Understood — I’ve updated the model with the distinction between **Incident Commander** and **Major Incident Manager**, recovery strategies, emergency change triggers, approval roles, and recovery validation requirements.

What I now understand:

- **Incident Commander** and **Major Incident Manager** may be the same person, but conceptually:
  - the **Incident Commander** coordinates the incident overall, including recovery
  - the **Major Incident Manager** handles the added coordination required for complex, high-impact major incidents
- Recovery strategies include:
  - Failover
  - Rollback
  - Workaround
  - Restart
  - Restore from Backup
  - Traffic Reroute
  - Manual Processing
  - Vendor Remediation
- Emergency changes are required when:
  - immediate action is needed to restore service or prevent further impact
  - the standard change process cannot be followed due to time constraints
- Emergency changes may be approved by:
  - **ECAB / Emergency Change Advisory Board**
  - **Designated Approver**, such as the Incident Commander or Major Incident Manager under delegated authority
- Recovery confirmation may require:
  - technical validation
  - business validation
  - customer-impact validation
  - monitoring stability period
  - evidence capture

Next, I’d like to cover **communications and stakeholder management**.

Could you walk me through:

1. **Communication types**
   - What communications are produced during a major incident?
   - Examples: initial notification, status update, executive briefing, customer notice, regulator notification, service restoration notice, post-incident summary.

2. **Audiences**
   - Who receives these communications?
   - Examples: internal stakeholders, business owners, executives, service desk, frontline staff, customers, third parties, regulators.

3. **Cadence and triggers**
   - Are there required update frequencies by severity?
   - For example: Sev 1 every 30 minutes, Sev 2 every 60 minutes, or event-driven updates.

4. **Approval**
   - Who approves external communications?
   - Is approval different for customers, regulators, executives, or media?

5. **Content requirements**
   - What must be included in incident communications?
   - For example: impacted services, start time, current impact, workaround, estimated recovery time, next update time, customer guidance, known facts only.

### Turn 5 — user

Certainly! Let’s dive into communications and stakeholder management during a major incident:  ### 1. Communication Types During a major incident, a variety of communications are produced to keep all relevant parties informed. Key types include:  - **Initial Notification**: The first alert sent out to relevant stakeholders once a major incident is confirmed, providing essential information. - **Status Update**: Regular updates providing the current state of the incident, actions being taken, and any changes in impact or recovery projections. - **Executive Briefing**: Specialized communication aimed at executives and upper management, summarizing the incident’s impact and strategic implications. - **Customer Notice**: Direct communication sent to customers detailing the incident, its effects, and any actions they may need to take. - **Regulator Notification**: Formal documentation to share with regulatory bodies, informing them of the incident, potential implications, and remedial actions. - **Service Restoration Notice**: Announcement informing stakeholders when services have been restored and operational status has returned to normal. - **Post-Incident Summary**: A comprehensive review shared after the incident, summarizing what happened, actions taken, and lessons learned.  ### 2. Audiences Different stakeholders receive these communications, including:  - **Internal Stakeholders**: Employees involved in incident management and response, including incident management teams. - **Business Owners**: Individuals responsible for the business services impacted by the incident. - **Executives**: Senior management needing insights on impacts, the severity of incidents, and strategic responses. - **Service Desk**: Frontline staff who may face customer inquiries and need to be briefed on the incident and recovery steps. - **Frontline Staff**: Employees who directly interact with customers and may need operational guidance during the incident. - **Customers**: End-users directly affected by the incident, who need to know about service impacts and available support. - **Third Parties**: Vendors or partners whose services might be affected or who need to assist in resolving the incident. - **Regulators**: External authorities who must be informed about the incident and its potential implications for compliance.  ### 3. Cadence and Triggers Yes, there are often required update frequencies tied to incident severity:  - **Sev 1 (Critical)**: Typically requires updates every 30 minutes, due to the high impact and urgency. - **Sev 2 (High)**: May require updates every 60 minutes, as circumstances evolve. - **Event-Driven Updates**: These updates are also communicated when significant developments occur, even outside the scheduled cadence.  The update frequency ensures stakeholders remain informed and can manage their own responsibilities effectively.  ### 4. Approval Approval processes for communications differ based on the audience:  - **External Communications (Customers, Regulators, Media)**: Typically require higher-level approval, often from the **Incident Commander**, **Major Incident Manager**, or a designated communications lead. - **Internal Communications**: May involve quicker approvals but still require certain stakeholders’ sign-offs, such as department heads or service owners, depending on the content.  Regulators may have specific requirements for content and format, necessitating a structured approval process to ensure compliance.  ### 5. Content Requirements Incident communications must include specific content to be effective:  - **Impacted Services**: Clearly state which services are affected to help the audience understand the scope of the issue. - **Start Time**: The time when the incident was first detected or reported. - **Current Impact**: A concise description of how the incident is currently affecting operations. - **Workaround**: If applicable, information on temporary solutions to mitigate customer impact during the incident. - **Estimated Recovery Time (ERT)**: Providing an estimated timeframe for when services are expected to be restored. - **Next Update Time**: Informing stakeholders when they can expect the next communication. - **Customer Guidance**: Practical advice on what customers should do or expect next, including any alternate service options. - **Known Facts Only**: A commitment to only share verified and confirmed information to maintain trust and avoid spread misinformation.  These content elements support clarity and transparency in communications, assisting all audiences in understanding the situation and taking necessary actions.  If you have any further questions or if you'd like to explore another area, let me know!

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Communication:\n    properties:\n      communicationType:\n        type: text\n        allowed: [Initial Notification, Status Update, Executive Briefing, Customer Notice, Regulator Notification, Service Restoration Notice, Post-Incident Summary]\n      updateCadence:\n        type: text\n      nextUpdateTimeRequired:\n        type: boolean\n      knownFactsOnly:\n        type: boolean\n  Audience:\n    meaning: A stakeholder group that receives incident communications.\n    properties:\n      audienceType:\n        type: text\n        allowed: [Internal Stakeholders, Business Owners, Executives, Service Desk, Frontline Staff, Customers, Third Parties, Regulators, Media]\n  Department Head:\n    meaning: A departmental leader who may approve internal incident communications depending on content.\n  Estimated Recovery Time:\n    meaning: The estimated timeframe for when affected services are expected to be restored.\n    aliases: [ERT]\n    properties:\n      value:\n        type: number\n        unit: minutes\nrelationships:\n  - name: sentTo\n    from: Communication\n    to: Audience\n    meaning: A communication is sent to a stakeholder audience.\n  - name: approvesExternalCommunicationFor\n    from: Incident Commander\n    to: Communication\n    meaning: The incident commander may approve external incident communications for customers, regulators, or media.\n  - name: approvesExternalCommunicationFor\n    from: Major Incident Manager\n    to: Communication\n    meaning: The major incident manager may approve external incident communications for customers, regulators, or media.\n  - name: approvesExternalCommunicationFor\n    from: Communications Lead\n    to: Communication\n    meaning: The communications lead may approve external incident communications for customers, regulators, or media.\n  - name: approvesInternalCommunicationFor\n    from: Department Head\n    to: Communication\n    meaning: A department head may approve internal incident communications depending on content.\n  - name: approvesInternalCommunicationFor\n    from: Service Owner\n    to: Communication\n    meaning: A service owner may approve internal incident communications depending on content.\n  - name: statesImpactedService\n    from: Communication\n    to: Service\n    meaning: A communication identifies the services affected by the incident.\n  - name: providesWorkaround\n    from: Communication\n    to: Recovery\n    meaning: A communication includes workaround or temporary mitigation information when applicable.\n  - name: includesEstimatedRecoveryTime\n    from: Communication\n    to: Estimated Recovery Time\n    meaning: A communication provides an estimated timeframe for service restoration.\nrules:\n  sev1CommunicationCadence:\n    conditions:\n      - Sev 1 incidents require status updates every 30 minutes.\n      - Event-driven updates are sent when significant developments occur, even outside the scheduled cadence.\n  sev2CommunicationCadence:\n    conditions:\n      - Sev 2 incidents require status updates every 60 minutes.\n      - Event-driven updates are sent when significant developments occur, even outside the scheduled cadence.\n  communicationContentComplete:\n    conditions:\n      - Communication states impacted services.\n      - Communication includes the start time when the incident was first detected or reported.\n      - Communication describes current impact.\n      - Communication includes workaround information when applicable.\n      - Communication includes estimated recovery time when available.\n      - Communication includes next update time.\n      - Communication includes customer guidance when customers are affected.\n      - Communication contains known facts only.\n  externalCommunicationApproved:\n    conditions:\n      - Customer, regulator, and media communications are approved by the Incident Commander, Major Incident Manager, or Communications Lead.\n  internalCommunicationApproved:\n    conditions:\n      - Internal communications receive required sign-off from stakeholders such as department heads or service owners depending on content.\nactions:\n  sendIncidentCommunication:\n    input: Communication\n    preconditions: [communicationContentComplete]\n  sendExternalCommunication:\n    input: Communication\n    preconditions: [communicationContentComplete, externalCommunicationApproved]"
}
```

### Turn 5 — tool

Applied. Added 19, updated 1 existing item(s).

### Turn 5 — assistant

Great — I’ve added communication types, audiences, cadence rules, approval expectations, and required content into the model.

What I understand:

- Major-incident communications include:
  - Initial Notification
  - Status Update
  - Executive Briefing
  - Customer Notice
  - Regulator Notification
  - Service Restoration Notice
  - Post-Incident Summary
- Communications go to audiences such as:
  - Internal Stakeholders
  - Business Owners
  - Executives
  - Service Desk
  - Frontline Staff
  - Customers
  - Third Parties
  - Regulators
  - Media
- Update cadence:
  - **Sev 1**: every 30 minutes
  - **Sev 2**: every 60 minutes
  - event-driven updates occur whenever there is a significant development
- External communications to customers, regulators, and media require higher-level approval, typically by:
  - Incident Commander
  - Major Incident Manager
  - Communications Lead
- Internal communications may require sign-off from department heads or service owners depending on content.
- Communications should include:
  - impacted services
  - start time
  - current impact
  - workaround, if applicable
  - estimated recovery time, if available
  - next update time
  - customer guidance, if customers are affected
  - known facts only

Next, I’d like to cover **evidence, post-incident review, and auditability**.

Could you walk me through:

1. **Evidence types**
   - What evidence must be captured during or after an incident?
   - Examples: timeline, bridge notes, decisions, approvals, monitoring data, logs, screenshots, customer impact analysis, communications, change records.

2. **Decision logging**
   - Which decisions must be explicitly recorded?
   - Examples: severity declaration, major-incident escalation, recovery option selection, emergency change approval, customer/regulator notification decision, service restoration decision.

3. **Post-incident review**
   - When is a review required?
   - Is it mandatory for all major incidents, Sev 1, Sev 2, regulatory-impacting events, recurring incidents?

4. **Review outputs**
   - What comes out of the review?
   - Examples: root cause, contributing factors, corrective actions, control improvements, owner assignments, due dates, lessons learned.

5. **Audit/regulatory evidence**
   - Are there retention or completeness requirements for evidence?
   - Who signs off that the evidence pack is complete?

### Turn 6 — user

Absolutely! Let’s go through each aspect of evidence, post-incident review, and auditability.  ### 1. Evidence Types The evidence captured during or after an incident is crucial for analysis and accountability. Key types of evidence include:  - **Timeline**: A chronological account of the incident events, including detection, escalation, and resolution. - **Bridge Notes**: Notes taken during incident response meetings or conference calls to capture discussions and decisions made in real-time. - **Decisions**: Records of critical decisions made during the incident response, including how and why certain actions were chosen. - **Approvals**: Documentation of any approvals obtained, particularly for emergency changes or escalations. - **Monitoring Data**: Metrics and alerts from monitoring tools that indicate performance, availability, or security issues. - **Logs**: System, application, and security logs that can provide insights into the incident's cause and scope. - **Screenshots**: Visual evidence of issues as they arise, useful for understanding user experience and system state. - **Customer Impact Analysis**: Assessment of how the incident affected customers, including scale, services impacted, and customer feedback. - **Communications**: Copies of all communication sent out regarding the incident, including internal updates and external notifications. - **Change Records**: Documentation of any changes made during incident resolution, particularly if they contributed to recovery efforts.  ### 2. Decision Logging Explicit recording of certain decisions is critical for accountability and future improvement. Important decisions to document include:  - **Severity Declaration**: Log the severity level assigned based on impact and urgency. - **Major-Incident Escalation**: Document the criteria and rationale for escalating to major incident status. - **Recovery Option Selection**: Record the chosen recovery strategy and the reasoning behind it. - **Emergency Change Approval**: Keep records of emergency changes that were approved during the incident response and who authorized them. - **Customer/Regulator Notification Decisions**: Document decisions on what communications were sent, when, and to whom. - **Service Restoration Decision**: Record when the service was declared restored and what validations were performed prior to that declaration.  ### 3. Post-Incident Review A post-incident review is typically required under specific circumstances:  - **Major Incidents**: Mandatory for all major incidents to ensure thorough analysis and learning. - **Sev 1 Incidents**: Reviews are required for critical Sev 1 incidents given their high impact. - **Sev 2 Incidents**: Reviews can also be required for high-impact Sev 2 incidents, especially based on business or regulatory implications. - **Regulatory-Impacting Events**: Any incidents that could pose compliance risks often necessitate a review. - **Recurring Incidents**: If an incident recurs, a review is essential to understand why it happened again and to prevent future occurrences.  ### 4. Review Outputs The outcomes of a post-incident review should include:  - **Root Cause**: Identification of the underlying cause(s) of the incident. - **Contributing Factors**: Other factors that may have influenced the incident's impact or response effectiveness. - **Corrective Actions**: Actions required to resolve the root cause and prevent recurrence, along with assigned ownership and due dates. - **Control Improvements**: Suggestions for improving processes, controls, or technologies based on findings. - **Owner Assignments**: Specific individuals or teams assigned to implement corrective and preventive actions. - **Lessons Learned**: Insights gained from the incident that can improve future responses or operational practices.  ### 5. Audit/Regulatory Evidence Regarding retention and completeness requirements for evidence:  - **Retention Requirements**: Evidence should be retained according to regulatory standards and internal governance policies, often for a minimum period, typically ranging from several months to several years. - **Completeness Sign-Off**: Typically, the **Incident Commander** or **Major Incident Manager** oversees the final evidence package and signs off on completeness. Additionally, governance or compliance teams may review and approve the completeness of the evidence pack before archiving.  This evidence and review process is vital for accountability, learning, and regulatory compliance. If you need further clarification or want to delve into another area, just let me know!

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Evidence:\n    properties:\n      evidenceType:\n        type: text\n        allowed: [Timeline, Bridge Notes, Decisions, Approvals, Monitoring Data, Logs, Screenshots, Customer Impact Analysis, Communications, Change Records]\n      retentionRequirement:\n        type: text\n      completenessSignedOff:\n        type: boolean\n  Decision Record:\n    meaning: A record of a critical incident decision, including the decision made and rationale.\n    properties:\n      decisionType:\n        type: text\n        allowed: [Severity Declaration, Major-Incident Escalation, Recovery Option Selection, Emergency Change Approval, Customer/Regulator Notification Decision, Service Restoration Decision]\n      rationale:\n        type: text\n  Post-Incident Review:\n    meaning: A review performed after qualifying incidents to analyze cause, response, learning, and required improvements.\n    aliases: [PIR, Post Incident Review]\n  Review Output:\n    meaning: A finding or deliverable produced by a post-incident review.\n    properties:\n      outputType:\n        type: text\n        allowed: [Root Cause, Contributing Factors, Corrective Actions, Control Improvements, Owner Assignments, Lessons Learned]\n  Corrective Action:\n    meaning: An action required to address root cause or prevent recurrence after an incident.\n    properties:\n      dueDate:\n        type: date\n      status:\n        type: text\n        allowed: [open, in progress, complete, overdue]\n  Governance Team:\n    meaning: A team that reviews governance compliance and may approve evidence-pack completeness before archiving.\n  Compliance Team:\n    meaning: A team that reviews compliance requirements and may approve evidence-pack completeness before archiving.\n  Evidence Pack:\n    meaning: The complete package of incident evidence retained for review, audit, and regulatory purposes.\n    properties:\n      retentionRequirement:\n        type: text\n      completenessSignedOff:\n        type: boolean\nrelationships:\n  - name: recordsDecisionFor\n    from: Decision Record\n    to: Incident\n    meaning: A decision record captures a critical decision made during incident response.\n  - name: includesEvidence\n    from: Evidence Pack\n    to: Evidence\n    meaning: An evidence pack contains incident evidence.\n  - name: supports\n    from: Evidence\n    to: Post-Incident Review\n    meaning: Evidence is used to support a post-incident review.\n  - name: requiredFor\n    from: Post-Incident Review\n    to: Incident\n    meaning: A post-incident review is required for qualifying incidents.\n  - name: produces\n    from: Post-Incident Review\n    to: Review Output\n    meaning: A post-incident review produces findings and improvement outputs.\n  - name: produces\n    from: Post-Incident Review\n    to: Corrective Action\n    meaning: A post-incident review produces corrective actions to prevent recurrence.\n  - name: assignedTo\n    from: Corrective Action\n    to: Decision Owner\n    meaning: A corrective action is assigned to an accountable owner for completion.\n  - name: signsOffCompletenessFor\n    from: Incident Commander\n    to: Evidence Pack\n    meaning: The incident commander may sign off that the incident evidence pack is complete.\n  - name: signsOffCompletenessFor\n    from: Major Incident Manager\n    to: Evidence Pack\n    meaning: The major incident manager may sign off that the incident evidence pack is complete.\n  - name: approvesCompletenessFor\n    from: Governance Team\n    to: Evidence Pack\n    meaning: The governance team may review and approve evidence-pack completeness before archiving.\n  - name: approvesCompletenessFor\n    from: Compliance Team\n    to: Evidence Pack\n    meaning: The compliance team may review and approve evidence-pack completeness before archiving.\nrules:\n  postIncidentReviewRequired:\n    conditions:\n      - A post-incident review is mandatory for all major incidents.\n      - A post-incident review is required for Sev 1 incidents.\n      - A post-incident review is required for high-impact Sev 2 incidents, especially where business or regulatory implications exist.\n      - A post-incident review is required for regulatory-impacting events.\n      - A post-incident review is required for recurring incidents.\n  evidencePackComplete:\n    conditions:\n      - Evidence pack includes timeline, bridge notes, decisions, approvals, monitoring data, logs, customer impact analysis, communications, and change records where applicable.\n      - Critical decisions are recorded with rationale.\n      - Evidence is retained according to regulatory standards and internal governance policies.\n      - Incident Commander or Major Incident Manager signs off completeness.\n      - Governance or Compliance Team reviews and approves completeness when required.\nactions:\n  conductPostIncidentReview:\n    input: Incident\n    preconditions: [postIncidentReviewRequired]\n  archiveEvidencePack:\n    input: Evidence Pack\n    preconditions: [evidencePackComplete]"
}
```

### Turn 6 — tool

Applied. Added 22, updated 1 existing item(s).

### Turn 6 — assistant

Thanks — I’ve added evidence capture, decision logging, post-incident review requirements, review outputs, corrective actions, and evidence-pack sign-off into the model.

What I understand:

- Evidence captured may include:
  - Timeline
  - Bridge Notes
  - Decisions
  - Approvals
  - Monitoring Data
  - Logs
  - Screenshots
  - Customer Impact Analysis
  - Communications
  - Change Records
- Critical decisions must be logged, including:
  - Severity Declaration
  - Major-Incident Escalation
  - Recovery Option Selection
  - Emergency Change Approval
  - Customer/Regulator Notification Decision
  - Service Restoration Decision
- Post-incident reviews are required for:
  - all Major Incidents
  - Sev 1 incidents
  - high-impact Sev 2 incidents
  - regulatory-impacting events
  - recurring incidents
- Reviews produce:
  - Root Cause
  - Contributing Factors
  - Corrective Actions
  - Control Improvements
  - Owner Assignments
  - Lessons Learned
- Corrective actions have owners, due dates, and statuses.
- Evidence packs must be retained according to regulatory and internal policy requirements.
- Evidence-pack completeness may be signed off by the Incident Commander or Major Incident Manager, with Governance or Compliance review where required.

Next, I’d like to cover the final area you mentioned: **regulatory-reporting workflow**.

Could you walk me through:

1. **Reporting triggers**
   - What conditions trigger a regulatory-reporting assessment or actual regulatory notification?
   - Examples: customer harm, payment-system impact, cyber involvement, data integrity, operational resilience threshold breach, service unavailability duration, regulatory breach risk.

2. **Assessment workflow**
   - Who assesses whether the incident is reportable?
   - Is there a Regulatory Reporting Team, Compliance, Legal, Operational Resilience, Risk, Business Owner, or Incident Commander involved?

3. **Notification deadlines**
   - Are there time limits for notifying regulators?
   - Are deadlines based on detection time, confirmation time, classification time, or impact threshold breach time?

4. **Report content**
   - What must regulatory reports include?
   - Examples: incident summary, impacted services, customer impact, start time, duration, root cause if known, mitigation, recovery status, next update, remediation plan.

5. **Approval and submission**
   - Who approves the report before submission?
   - Who actually submits it to regulators?

### Turn 7 — user

Let's go through the regulatory-reporting workflow in detail:  ### 1. Reporting Triggers Regulatory-reporting assessments are triggered under specific conditions, including:  - **Customer Harm**: Any incident that leads to actual harm or significant dissatisfaction from customers. - **Payment-System Impact**: Incidents that affect payment processing systems may require immediate notification due to their critical role in banking operations. - **Cyber Involvement**: Any cybersecurity incident that poses a threat to data integrity or confidentiality often necessitates urgent reporting. - **Data Integrity Issues**: Incidents that compromise the integrity of customer or financial data must be assessed for regulatory implications. - **Operational Resilience Threshold Breaches**: If incidents breach our defined thresholds for operational resilience, a report may be necessary. - **Service Unavailability Duration**: Extended outages impacting key services can trigger reporting obligations. - **Regulatory Breach Risk**: When incidents pose a risk of breaching regulatory requirements, they typically require assessment.  ### 2. Assessment Workflow The assessment of whether an incident is reportable generally involves multiple stakeholders:  - **Regulatory Reporting Team**: If applicable, they lead the assessment and preparation of the report, ensuring compliance with all requirements. - **Compliance**: The compliance team evaluates the incident against regulatory standards to determine the need for notification. - **Legal**: Involving legal advisors ensures that all legal implications are considered. - **Operational Resilience**: This team assesses whether the incident impacted operational capabilities or compliance with resilience standards. - **Risk**: The risk management team helps analyze potential regulatory risks associated with the incident. - **Business Owner**: They can provide insights on the business impact and customer perspective. - **Incident Commander**: Sometimes involved in the initial assessment, especially if rapid decisions are needed.  The collaboration of these roles ensures a comprehensive evaluation.  ### 3. Notification Deadlines Regulatory notification deadlines can vary based on the specific regulation but often include:  - **Detection Time**: The time when the incident is first detected may initiate certain notification time frames. - **Confirmation Time**: Once the incident is confirmed, regulators may have specific timelines for when reports must be filed. - **Classification Time**: If an incident is determined to be a major incident, there may be accelerated reporting requirements. - **Impact Threshold Breach Time**: Notifications may need to be made following a breach of defined impact thresholds, which could dictate urgency.  These deadlines help regulatory bodies receive prompt information about significant incidents.  ### 4. Report Content Regulatory reports must typically include several critical components:  - **Incident Summary**: A brief overview of the incident, including what happened and when. - **Impacted Services**: Details on which services were affected and their criticality. - **Customer Impact**: Description of how the incident impacted customers, including the number of affected users or transactions. - **Start Time**: When the incident first occurred. - **Duration**: How long the incident persisted before resolution. - **Root Cause**: If known, the underlying cause of the incident should be documented. - **Mitigation Actions**: Steps taken to address or minimize the impact of the incident. - **Recovery Status**: Current status of recovery efforts, including whether services have been restored. - **Next Update**: Information on when further updates will be provided to regulators. - **Remediation Plan**: Outline of steps planned to prevent recurrence or mitigate future risks.  ### 5. Approval and Submission The approval process for regulatory reports typically involves:  - **Report Approval**: Usually requires endorsements from the **Incident Commander**, **Regulatory Reporting Lead**, or their equivalent to confirm accuracy and completeness. - **Submission Responsibility**: The report is often submitted by the **Regulatory Reporting Team** or a designated compliance officer who ensures that the submission complies with regulatory requirements.  This ensures that the report is cleared by all necessary parties and submitted adequately, maintaining compliance with regulatory obligations.  Let me know if you need more details or if you'd like to explore another area!

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Regulatory Reporting Workflow:\n    properties:\n      notificationDeadlineBasis:\n        type: text\n        allowed: [Detection Time, Confirmation Time, Classification Time, Impact Threshold Breach Time]\n  Regulatory Reporting Assessment:\n    meaning: The assessment of whether an incident creates a regulatory notification obligation.\n    properties:\n      reportingTrigger:\n        type: text\n        allowed: [Customer Harm, Payment-System Impact, Cyber Involvement, Data Integrity Issues, Operational Resilience Threshold Breach, Service Unavailability Duration, Regulatory Breach Risk]\n      reportable:\n        type: boolean\n  Regulatory Report:\n    meaning: The formal report prepared and submitted to a regulator about a reportable incident.\n    properties:\n      approvalStatus:\n        type: text\n        allowed: [draft, under review, approved, submitted]\n      nextUpdateRequired:\n        type: boolean\n  Regulatory Reporting Team:\n    meaning: The team that leads reportability assessment, prepares regulatory reports, and may submit them.\n  Regulatory Reporting Lead:\n    meaning: The role that endorses regulatory reports for accuracy and completeness.\n  Legal:\n    meaning: Legal advisors who consider legal implications of reportability and regulatory communications.\n  Operational Resilience:\n    meaning: The team or function that assesses operational capability impact and resilience threshold breaches.\n  Risk:\n    meaning: The risk management function that analyzes potential regulatory risks associated with an incident.\n  Compliance Officer:\n    meaning: A designated compliance role that may submit regulatory reports and ensure submission meets regulatory requirements.\n  Regulator:\n    meaning: An external authority that receives required incident notifications or reports.\nrelationships:\n  - name: assessesReportabilityFor\n    from: Regulatory Reporting Assessment\n    to: Incident\n    meaning: A regulatory reporting assessment evaluates whether an incident is reportable.\n  - name: follows\n    from: Regulatory Report\n    to: Regulatory Reporting Assessment\n    meaning: A regulatory report is prepared when the assessment determines that reporting is required.\n  - name: submittedTo\n    from: Regulatory Report\n    to: Regulator\n    meaning: A regulatory report is submitted to a regulator.\n  - name: leads\n    from: Regulatory Reporting Team\n    to: Regulatory Reporting Assessment\n    meaning: The regulatory reporting team leads the reportability assessment when applicable.\n  - name: prepares\n    from: Regulatory Reporting Team\n    to: Regulatory Report\n    meaning: The regulatory reporting team prepares the regulatory report.\n  - name: evaluates\n    from: Compliance Team\n    to: Regulatory Reporting Assessment\n    meaning: Compliance evaluates the incident against regulatory standards to determine notification need.\n  - name: advises\n    from: Legal\n    to: Regulatory Reporting Assessment\n    meaning: Legal advises on legal implications during reportability assessment.\n  - name: assessesResilienceImpactFor\n    from: Operational Resilience\n    to: Regulatory Reporting Assessment\n    meaning: Operational Resilience assesses operational capability impact and resilience threshold breaches.\n  - name: analyzesRiskFor\n    from: Risk\n    to: Regulatory Reporting Assessment\n    meaning: Risk analyzes potential regulatory risks associated with the incident.\n  - name: providesBusinessImpactFor\n    from: Business Owner\n    to: Regulatory Reporting Assessment\n    meaning: The business owner provides business impact and customer-perspective input for reportability assessment.\n  - name: supportsInitialAssessmentFor\n    from: Incident Commander\n    to: Regulatory Reporting Assessment\n    meaning: The incident commander may support initial reportability assessment when rapid decisions are needed.\n  - name: endorses\n    from: Incident Commander\n    to: Regulatory Report\n    meaning: The incident commander may endorse a regulatory report for accuracy and completeness.\n  - name: endorses\n    from: Regulatory Reporting Lead\n    to: Regulatory Report\n    meaning: The regulatory reporting lead endorses a regulatory report for accuracy and completeness.\n  - name: submits\n    from: Regulatory Reporting Team\n    to: Regulatory Report\n    meaning: The regulatory reporting team may submit the regulatory report.\n  - name: submits\n    from: Compliance Officer\n    to: Regulatory Report\n    meaning: A designated compliance officer may submit the regulatory report.\nrules:\n  regulatoryReportingAssessmentRequired:\n    conditions:\n      - Incident involves customer harm or significant customer dissatisfaction.\n      - Incident affects payment processing systems.\n      - Incident has cyber involvement that threatens data integrity or confidentiality.\n      - Incident compromises customer or financial data integrity.\n      - Incident breaches operational resilience thresholds.\n      - Incident causes extended unavailability of key services.\n      - Incident creates regulatory breach risk.\n  regulatoryReportContentComplete:\n    conditions:\n      - Regulatory report includes incident summary.\n      - Regulatory report includes impacted services and their criticality.\n      - Regulatory report includes customer impact, including affected users or transactions when known.\n      - Regulatory report includes incident start time.\n      - Regulatory report includes duration.\n      - Regulatory report includes root cause when known.\n      - Regulatory report includes mitigation actions.\n      - Regulatory report includes recovery status.\n      - Regulatory report includes next update timing.\n      - Regulatory report includes remediation plan.\n  regulatoryReportApproved:\n    conditions:\n      - Regulatory report is endorsed by the Incident Commander, Regulatory Reporting Lead, or equivalent approver for accuracy and completeness.\n  regulatoryReportDeadlineSet:\n    conditions:\n      - Notification deadline basis is identified as detection time, confirmation time, classification time, or impact threshold breach time according to the applicable regulation.\nactions:\n  performRegulatoryReportingAssessment:\n    input: Incident\n    preconditions: [regulatoryReportingAssessmentRequired]\n  submitRegulatoryReport:\n    input: Regulatory Report\n    preconditions: [regulatoryReportContentComplete, regulatoryReportApproved, regulatoryReportDeadlineSet]"
}
```

### Turn 7 — tool

Applied. Added 30, updated 1 existing item(s).

### Turn 7 — assistant

Thanks — I’ve updated the model with the **regulatory-reporting workflow**, including triggers, assessment roles, deadlines, report content, approvals, and submission responsibilities.

What I understand:

- A **Regulatory Reporting Assessment** is triggered when an incident involves one or more of:
  - customer harm or significant dissatisfaction
  - payment-system impact
  - cyber involvement affecting integrity or confidentiality
  - data integrity issues
  - operational resilience threshold breach
  - extended unavailability of key services
  - regulatory breach risk

- The reportability assessment may involve:
  - Regulatory Reporting Team
  - Compliance Team
  - Legal
  - Operational Resilience
  - Risk
  - Business Owner
  - Incident Commander, especially for rapid initial assessment

- Notification deadlines depend on the applicable regulation and may be measured from:
  - detection time
  - confirmation time
  - classification time
  - impact threshold breach time

- A **Regulatory Report** should include:
  - incident summary
  - impacted services and criticality
  - customer impact
  - start time
  - duration
  - root cause, if known
  - mitigation actions
  - recovery status
  - next update timing
  - remediation plan

- Regulatory reports are endorsed by the **Incident Commander**, **Regulatory Reporting Lead**, or equivalent approver.
- Submission is typically handled by the **Regulatory Reporting Team** or a designated **Compliance Officer**.

I believe the interview has now covered the main domain you described: service/dependency structure, incident detection and classification, ownership, recovery and emergency changes, communications, evidence, reviews, and regulatory reporting.

Optional precision gaps we could add later if needed:

1. Exact operational resilience thresholds.
2. Exact evidence retention periods by incident type or regulation.
3. Named regulators and jurisdiction-specific reporting deadlines.
4. Formal distinction between “restored,” “resolved,” and “closed.”
5. SLA/SLO thresholds used in service criticality and customer-impact calculations.
