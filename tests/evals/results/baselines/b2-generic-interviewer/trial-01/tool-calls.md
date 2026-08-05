# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-08-05T10:03:50.990Z

### Turn 1 — user

I lead IT operations governance and major-incident management for the bank. I can walk you through how we structure services and technical dependencies, how we detect and manage incidents, who owns decisions, how recovery and emergency changes work, and how we handle evidence, communications, reviews, and regulatory-reporting workflows. Where would you like to start?

### Turn 1 — assistant

Let’s start with the foundation: **how you structure services and technical dependencies**, because that usually drives incident impact, ownership, recovery priorities, communications, and regulatory assessment.

Could you describe:

1. What are the main things you model or track?  
   For example: business services, IT services, applications, infrastructure components, third parties, data centers, etc.

2. How do you define a “service” in your governance context?  
   Is there a distinction between business service, customer-facing service, IT service, and application?

3. What dependency relationships matter during a major incident?  
   For example: an application supports a service, a database underpins an application, a vendor provides a platform, a service depends on a network segment, etc.

4. What properties do you track because they affect decisions?  
   For example: criticality, regulatory impact, customer impact, recovery time objective, service owner, operational resilience tier, geography, payment-system relevance, etc.

### Turn 2 — user

I appreciate the structured approach to understanding our service and dependency modeling. Let me walk you through the key elements.  1. **What we model or track:**      We primarily track several categories to ensure clarity and manageability:    - **Business Services:** These are customer- or business-facing capabilities that are delivered by the bank.    - **IT Services:** Managed technology capabilities that support one or more business services.    - **Applications:** Software systems implementing business functionality.    - **Infrastructure Components:** This includes physical servers, network devices, virtual machines, and storage systems that support IT services.    - **Third-party Services:** Any externally provided services we rely on.    - **Data Centers and Sites:** Physical locations where our infrastructure and services are hosted.  2. **Defining “service” in our governance context:**      In our context, we distinguish between:    - **Business Services:** Directly serve our customers and drive revenue (e.g., online banking).    - **Customer-facing Services:** Specific channels through which our customers access banking services.    - **IT Services:** These support business services but are more technology-centric (e.g., a payment processing system).    - **Applications:** Software that runs on IT services but does not equate to an IT service itself. It is more about the functionality delivered rather than the operational capacity.  3. **Dependency relationships that matter during a major incident:**      During a major incident, we focus on several critical relationships:    - An **application** supports a **business service.**    - A **database** underpins an **application.**    - An **IT service** relies on specific **infrastructure components** (e.g., servers, storage).    - A **third-party service** may be essential for business functionality, linking directly to a critical **business service**.    - **Network segments** are pivotal for the functioning of IT services, especially in incidents that impact connectivity.  4. **Properties tracked for decision-making:**      We track various properties that inform our operational decisions:    - **Criticality Tier:** Defines how essential a service or application is to business continuity.    - **Regulatory Impact:** Assesses how incidents might affect our compliance obligations.    - **Customer Impact:** Evaluates how an incident affects our customers or stakeholders.    - **Recovery Time Objective (RTO):** Helps us prioritize recovery activities based on how long we can afford to be down.    - **Service Owner:** Identifies who is accountable for each service, aiding escalation and decision-making.    - **Operational Resilience Tier:** Gauges how well a service can withstand disruptions.    - **Geographical Factors:** Important for assessing data privacy and regulatory obligations based on service location.    - **Payment-system Relevance:** Especially for incidents impacting financial transactions.  These components collectively shape our incident response, defining how we prioritize, communicate, and recover during major incidents.

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  BusinessService:\n    meaning: Customer- or business-facing capability delivered by the bank, often revenue-driving and directly serving customers.\n    aliases: [business service]\n    properties:\n      criticalityTier:\n        type: text\n      regulatoryImpact:\n        type: text\n      customerImpact:\n        type: text\n      recoveryTimeObjective:\n        type: number\n        unit: hours\n      operationalResilienceTier:\n        type: text\n      geography:\n        type: text\n      paymentSystemRelevance:\n        type: boolean\n  CustomerFacingService:\n    meaning: A specific channel through which customers access banking services.\n    aliases: [customer-facing service, channel]\n    properties:\n      criticalityTier:\n        type: text\n      customerImpact:\n        type: text\n      geography:\n        type: text\n  ITService:\n    meaning: Managed technology capability that supports one or more business services.\n    aliases: [IT service, technology service]\n    properties:\n      criticalityTier:\n        type: text\n      recoveryTimeObjective:\n        type: number\n        unit: hours\n      operationalResilienceTier:\n        type: text\n      geography:\n        type: text\n      paymentSystemRelevance:\n        type: boolean\n  Application:\n    meaning: Software system implementing business functionality; not equivalent to an IT service itself.\n    aliases: [application, software system]\n    properties:\n      criticalityTier:\n        type: text\n      recoveryTimeObjective:\n        type: number\n        unit: hours\n      operationalResilienceTier:\n        type: text\n      geography:\n        type: text\n      paymentSystemRelevance:\n        type: boolean\n  InfrastructureComponent:\n    meaning: Physical or virtual technology component such as a server, storage system, virtual machine, or network device supporting IT services.\n    aliases: [infrastructure component, server, storage system, virtual machine, network device]\n    properties:\n      criticalityTier:\n        type: text\n      geography:\n        type: text\n  Database:\n    meaning: Data store that underpins applications.\n    aliases: [database, data store]\n    properties:\n      criticalityTier:\n        type: text\n      recoveryTimeObjective:\n        type: number\n        unit: hours\n      geography:\n        type: text\n  NetworkSegment:\n    meaning: Connectivity segment pivotal to functioning of IT services, especially during connectivity incidents.\n    aliases: [network segment]\n    properties:\n      criticalityTier:\n        type: text\n      geography:\n        type: text\n  ThirdPartyService:\n    meaning: Externally provided service the bank relies on for business functionality.\n    aliases: [third-party service, externally provided service, vendor service]\n    properties:\n      criticalityTier:\n        type: text\n      regulatoryImpact:\n        type: text\n      recoveryTimeObjective:\n        type: number\n        unit: hours\n      operationalResilienceTier:\n        type: text\n      geography:\n        type: text\n      paymentSystemRelevance:\n        type: boolean\n  DataCenterOrSite:\n    meaning: Physical location where infrastructure and services are hosted.\n    aliases: [data center, site, physical location]\n    properties:\n      geography:\n        type: text\n  ServiceOwner:\n    meaning: Accountable owner for a service or application who supports escalation and decision-making.\n    aliases: [service owner, owner]\nrelationships:\n  - name: supports\n    from: Application\n    to: BusinessService\n    meaning: An application implements functionality that supports a business service.\n  - name: underpins\n    from: Database\n    to: Application\n    meaning: A database provides required data capability for an application.\n  - name: reliesOn\n    from: ITService\n    to: InfrastructureComponent\n    meaning: An IT service depends on infrastructure components such as servers or storage.\n  - name: isEssentialFor\n    from: ThirdPartyService\n    to: BusinessService\n    meaning: A third-party service is essential for business functionality of a business service.\n  - name: enablesConnectivityFor\n    from: NetworkSegment\n    to: ITService\n    meaning: A network segment provides connectivity needed for an IT service to function.\n  - name: hostedAt\n    from: InfrastructureComponent\n    to: DataCenterOrSite\n    meaning: An infrastructure component is hosted at a data center or site.\n  - name: owns\n    from: ServiceOwner\n    to: BusinessService\n    meaning: A service owner is accountable for a business service.\n  - name: owns\n    from: ServiceOwner\n    to: ITService\n    meaning: A service owner is accountable for an IT service.\n  - name: owns\n    from: ServiceOwner\n    to: Application\n    meaning: A service owner is accountable for an application."
}
```

### Turn 2 — tool

Applied. Added 19, updated 0 existing item(s).

### Turn 2 — assistant

Thanks — I’ve captured the initial service and dependency model.

To confirm my understanding:

- You distinguish **Business Services**, **Customer-facing Services**, **IT Services**, and **Applications** rather than treating all of them as the same kind of service.
- **Applications support Business Services**.
- **Databases underpin Applications**.
- **IT Services rely on Infrastructure Components**.
- **Third-party Services can be essential for Business Services**.
- **Network Segments enable connectivity for IT Services**.
- **Infrastructure Components are hosted at Data Centers or Sites**.
- **Service Owners** are accountable for Business Services, IT Services, and Applications.
- Decision-relevant properties include criticality, regulatory/customer impact, RTO, operational resilience tier, geography, and payment-system relevance.

A couple of clarification points before we move on:

1. Should **Customer-facing Service** be modeled as being supported by a **Business Service**, or is it more accurate that a **Customer-facing Service provides access to a Business Service**?  
   Example: Mobile App channel provides access to Current Account Servicing.

2. Do **IT Services support Business Services directly**, or only through applications?

3. For **criticality tier** and **operational resilience tier**, do you have fixed values?  
   For example: Tier 0–4, Critical/High/Medium/Low, Important Business Service, etc.

4. For **regulatory impact** and **customer impact**, are those fixed ratings or free-text assessments?

After that, I’d suggest we move into **incident detection and major-incident classification**.

### Turn 3 — user

Your understanding of our service and dependency model is spot on, and your clarifying questions are quite natural. Let me address your points:  1. **Relationship between Customer-facing Services and Business Services:**      You are correct that a **Customer-facing Service** provides access to a **Business Service** rather than simply supporting it. For example, the Mobile App facilitates customer interactions with the Current Account Servicing, thus acting as a conduit to the underlying business service.  2. **Support of Business Services by IT Services:**      **IT Services** support **Business Services** typically through **Applications**. While IT Services can contribute directly to business outcomes, they generally do so via applications that enact the actual functionality behind the business services.  3. **Values for Criticality Tier and Operational Resilience Tier:**      Yes, we have fixed classifications for both criticality and operational resilience tiers. For example, we use a tiered approach that categorizes services as Tier 1 (Critical), Tier 2 (Important), Tier 3 (Standard), and Tier 4 (Supporting). This helps in quickly assessing the urgency and resources needed in incident management.  4. **Ratings for Regulatory Impact and Customer Impact:**      For **Regulatory Impact** and **Customer Impact**, we do not use fixed ratings; instead, we provide free-text assessments. This allows us to capture the nuances of each incident and how they may affect various stakeholders or compliance aspects.  With that clarified, I'm ready to move on to incident detection and major-incident classification when you are!

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  BusinessService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      operationalResilienceTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      regulatoryImpact:\n        type: text\n      customerImpact:\n        type: text\n  CustomerFacingService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      customerImpact:\n        type: text\n  ITService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      operationalResilienceTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n  Application:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      operationalResilienceTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n  InfrastructureComponent:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n  Database:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n  NetworkSegment:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n  ThirdPartyService:\n    properties:\n      criticalityTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      operationalResilienceTier:\n        type: text\n        allowed: [Tier 1 Critical, Tier 2 Important, Tier 3 Standard, Tier 4 Supporting]\n      regulatoryImpact:\n        type: text\nrelationships:\n  - name: providesAccessTo\n    from: CustomerFacingService\n    to: BusinessService\n    meaning: A customer-facing service acts as a channel or conduit through which customers access a business service.\n  - name: supports\n    from: ITService\n    to: Application\n    meaning: An IT service supports business outcomes through applications that enact business functionality."
}
```

### Turn 3 — tool

Applied. Added 2, updated 8 existing item(s).

### Turn 3 — assistant

Great — I’ve added that:

- **Customer-facing Service provides access to Business Service**
- **IT Service supports Application**
- Criticality and operational resilience tiers use the fixed values:
  - Tier 1 Critical
  - Tier 2 Important
  - Tier 3 Standard
  - Tier 4 Supporting
- Regulatory impact and customer impact remain free-text assessments.

Let’s move into **incident detection and major-incident classification**.

Could you walk me through:

1. **What constitutes an incident** in your governance model?  
   Is it tied to service degradation, outage, security event, data issue, third-party failure, or any unplanned disruption?

2. **How are incidents detected or raised?**  
   For example: monitoring alert, customer complaint, service desk ticket, business escalation, third-party notification, regulatory alert, SOC/security alert.

3. **What makes an incident a major incident?**  
   What criteria are used — customer impact, critical service affected, duration, payment impact, regulatory threshold, reputational risk, executive concern, etc.?

4. **Do you classify severity using fixed levels?**  
   For example: Sev 1 / Sev 2 / Sev 3, P1 / P2 / P3, Major / Significant / Standard.

5. **Who can declare a major incident, and who owns command once declared?**

### Turn 4 — user

I'm glad to continue with incident detection and major-incident classification. Here's how we approach it:  1. **What constitutes an incident:**      In our governance model, an **incident** is defined as an unplanned interruption, degradation, or security condition requiring managed response. This encompasses:    - Service degradation or outage.    - Security events that impact data or services.    - Data issues affecting service availability or integrity.    - Third-party service failures leading to disruptions.    Essentially, any unplanned disruption that affects our operational capabilities can qualify as an incident.  2. **How incidents are detected or raised:**      We have several pathways for incident detection, including:    - **Monitoring alerts** generated by our monitoring tools or SIEM.    - **Customer complaints** reported directly by users.    - **Service desk tickets** initiated by users or staff.    - **Business escalations** from internal stakeholders.    - **Notifications from third-party suppliers** regarding their services.    - **Regulatory alerts** that indicate potential compliance issues.    - **Security alerts** from the Security Operations Centre (SOC).  3. **What makes an incident a major incident:**      An incident qualifies as a **major incident** based on several criteria, including:    - Significant impact on customers or business operations.    - A critical service affected, especially those tied to high-tier business services.    - Duration of the incident; longer incidents may escalate to major incidents.    - Impact on payment systems, which can trigger immediate attention.    - Meeting thresholds defined by regulatory requirements.    - Potential reputational risks that could harm our brand or stakeholder trust.    - Senior executive concern or involvement can also trigger the major incident process.  4. **Classifying severity using fixed levels:**      Yes, we classify severity using fixed levels:    - **Severity Levels:**       - Sev 1 (Critical)      - Sev 2 (High)      - Sev 3 (Medium)      - Sev 4 (Low)    - **Priority Levels:**      - P1 (Critical)      - P2 (High)      - P3 (Medium)      - P4 (Low)    This classification helps prioritize response activities and allocate resources effectively.  5. **Declaration and ownership of major incidents:**      A **major incident** can be declared by an **Incident Commander** or a designated **duty manager** who has the authority to assess the situation. Once declared, the **Incident Commander** assumes command, leading the coordination, communication, and decision-making processes required to manage the incident effectively.  With this overview of incident detection and major-incident classification, I’m ready to dive into specific scenarios or next topics when you are!

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: An unplanned interruption, degradation, or security condition requiring managed response.\n    aliases: [incident, unplanned disruption]\n    properties:\n      conditionType:\n        type: text\n        allowed: [service degradation, outage, security condition, data issue, third-party failure]\n      severityLevel:\n        type: text\n        allowed: [Sev 1 Critical, Sev 2 High, Sev 3 Medium, Sev 4 Low]\n      priorityLevel:\n        type: text\n        allowed: [P1 Critical, P2 High, P3 Medium, P4 Low]\n      customerImpact:\n        type: text\n      businessImpact:\n        type: text\n      regulatoryImpact:\n        type: text\n      reputationalRisk:\n        type: text\n      paymentSystemImpact:\n        type: boolean\n      duration:\n        type: number\n        unit: hours\n  MajorIncident:\n    meaning: An incident that meets major-incident criteria and requires formal major-incident command, coordination, communication, and decision-making.\n    aliases: [major incident]\n    properties:\n      severityLevel:\n        type: text\n        allowed: [Sev 1 Critical, Sev 2 High, Sev 3 Medium, Sev 4 Low]\n      priorityLevel:\n        type: text\n        allowed: [P1 Critical, P2 High, P3 Medium, P4 Low]\n      customerImpact:\n        type: text\n      businessImpact:\n        type: text\n      regulatoryImpact:\n        type: text\n      reputationalRisk:\n        type: text\n      paymentSystemImpact:\n        type: boolean\n      duration:\n        type: number\n        unit: hours\n      executiveConcern:\n        type: boolean\n  MonitoringAlert:\n    meaning: Alert generated by monitoring tools or SIEM that may raise an incident.\n    aliases: [monitoring alert, SIEM alert]\n  CustomerComplaint:\n    meaning: Complaint from a customer that may raise or evidence an incident.\n    aliases: [customer complaint]\n  ServiceDeskTicket:\n    meaning: Ticket initiated by users or staff that may raise an incident.\n    aliases: [service desk ticket]\n  BusinessEscalation:\n    meaning: Escalation from internal business stakeholders that may raise an incident.\n    aliases: [business escalation]\n  ThirdPartyNotification:\n    meaning: Notification from a third-party supplier regarding disruption or risk in their service.\n    aliases: [third-party supplier notification, supplier notification]\n  RegulatoryAlert:\n    meaning: Alert indicating potential compliance or regulatory issue that may raise an incident.\n    aliases: [regulatory alert]\n  SecurityAlert:\n    meaning: Alert from the Security Operations Centre indicating a possible security event affecting data or services.\n    aliases: [SOC alert, security alert]\n  IncidentCommander:\n    meaning: Role that can declare a major incident and assumes command once declared.\n    aliases: [incident commander]\n  DutyManager:\n    meaning: Designated duty manager with authority to assess the situation and declare a major incident.\n    aliases: [duty manager]\nrelationships:\n  - name: affects\n    from: Incident\n    to: BusinessService\n    meaning: An incident affects a business service through interruption, degradation, security condition, data issue, or supplier failure.\n  - name: affects\n    from: Incident\n    to: ITService\n    meaning: An incident affects an IT service through interruption, degradation, security condition, data issue, or supplier failure.\n  - name: affects\n    from: Incident\n    to: Application\n    meaning: An incident affects an application through interruption, degradation, security condition, data issue, or supplier failure.\n  - name: affects\n    from: Incident\n    to: ThirdPartyService\n    meaning: An incident affects or originates from a third-party service failure.\n  - name: raises\n    from: MonitoringAlert\n    to: Incident\n    meaning: A monitoring or SIEM alert can raise an incident.\n  - name: raises\n    from: CustomerComplaint\n    to: Incident\n    meaning: A customer complaint can raise an incident.\n  - name: raises\n    from: ServiceDeskTicket\n    to: Incident\n    meaning: A service desk ticket can raise an incident.\n  - name: raises\n    from: BusinessEscalation\n    to: Incident\n    meaning: A business escalation can raise an incident.\n  - name: raises\n    from: ThirdPartyNotification\n    to: Incident\n    meaning: A third-party supplier notification can raise an incident.\n  - name: raises\n    from: RegulatoryAlert\n    to: Incident\n    meaning: A regulatory alert can raise an incident.\n  - name: raises\n    from: SecurityAlert\n    to: Incident\n    meaning: A SOC security alert can raise an incident.\n  - name: canDeclare\n    from: IncidentCommander\n    to: MajorIncident\n    meaning: An incident commander has authority to declare a major incident.\n  - name: canDeclare\n    from: DutyManager\n    to: MajorIncident\n    meaning: A duty manager has authority to declare a major incident.\n  - name: commands\n    from: IncidentCommander\n    to: MajorIncident\n    meaning: Once a major incident is declared, the incident commander leads coordination, communication, and decision-making.\nrules:\n  majorIncidentCriteria:\n    conditions:\n      - Incident has significant impact on customers or business operations.\n      - Incident affects a critical or high-tier business service.\n      - Incident duration exceeds the bank's escalation threshold.\n      - Incident impacts payment systems.\n      - Incident meets a regulatory reporting or regulatory concern threshold.\n      - Incident presents material reputational risk.\n      - Senior executive concern or involvement triggers the major-incident process.\nactions:\n  declareMajorIncident:\n    input: Incident\n    preconditions: [majorIncidentCriteria]"
}
```

### Turn 4 — tool

Applied. Added 27, updated 0 existing item(s).

### Turn 4 — assistant

Excellent — I’ve captured the incident detection and classification structure.

What I’ve modeled so far:

- **Incident** = unplanned interruption, degradation, or security condition requiring managed response.
- Incident condition types include:
  - service degradation
  - outage
  - security condition
  - data issue
  - third-party failure
- Detection / raising sources include:
  - Monitoring Alert / SIEM alert
  - Customer Complaint
  - Service Desk Ticket
  - Business Escalation
  - Third-party Notification
  - Regulatory Alert
  - Security Alert / SOC alert
- Severity levels:
  - Sev 1 Critical
  - Sev 2 High
  - Sev 3 Medium
  - Sev 4 Low
- Priority levels:
  - P1 Critical
  - P2 High
  - P3 Medium
  - P4 Low
- **Major Incident** criteria include significant customer/business impact, critical service affected, duration, payment-system impact, regulatory threshold, reputational risk, or executive concern.
- **Incident Commander** and **Duty Manager** can declare a major incident.
- Once declared, the **Incident Commander commands the Major Incident**.

A few clarifications before we continue:

1. Should **Major Incident** be treated as a separate thing from **Incident**, or is it better understood as an **Incident with major-incident status**?  
   Since the modeling tool has no subclassing, I can represent this either as:
   - a separate **MajorIncident** class connected to Incident, or
   - a property on Incident, such as `majorIncidentDeclared: boolean`.

2. Do you track an **incident lifecycle status** with fixed values?  
   For example: New, Assessing, Declared, Mitigating, Monitoring, Resolved, Closed.

3. Are **severity** and **priority** always the same, or can they differ?  
   Example: Sev 1 technical impact but P2 if workaround exists.

4. For duration-based escalation, do you use fixed thresholds by criticality tier or service type?  
   Example: Tier 1 outage over 15 minutes triggers major-incident assessment.

Then I’d suggest we move into **command structure and decision ownership**.

### Turn 5 — user

Your modeling is very thorough, and I appreciate the details you've laid out. Here are my responses to your clarifications:  1. **Major Incident as separate or a property:**      It's best to understand a **Major Incident** as an **Incident with major-incident status**. Given your modeling constraints, I recommend representing it as a property on the Incident, such as `majorIncidentDeclared: boolean`. This approach keeps it simpler while indicating whether an incident has escalated to a major status, avoiding the complexity of creating a separate class.  2. **Tracking incident lifecycle status:**      Yes, we do track an **incident lifecycle status** with fixed values. Our controlled incident states include:    - New    - Acknowledged    - Investigating    - Contained    - Recovering    - Monitoring    - Resolved    - Closed    - Cancelled      These statuses help us manage and communicate the progress of incidents through various stages effectively.  3. **Severity and priority differences:**      **Severity** and **priority** can indeed differ. Severity reflects the technical impact of the incident, while priority indicates how quickly we need to respond based on business considerations. For instance, an incident could be classified as Sev 1 if it has a critical technical impact, but if a workaround allows the service to remain functional, it might be prioritized as P2.  4. **Duration-based escalation thresholds:**      We use fixed thresholds for duration-based escalation based on criticality tiers and service types. For example, a **Tier 1 outage** may trigger a major incident assessment if it lasts over 15 minutes. The exact thresholds can vary depending on the defined service-level objectives within our governance framework.  With those clarifications, I’m ready to dive into the **command structure and decision ownership** whenever you are!

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    meaning: An unplanned interruption, degradation, or security condition requiring managed response; major-incident status is represented on the incident rather than as a separate real-world object.\n    properties:\n      majorIncidentDeclared:\n        type: boolean\n      lifecycleStatus:\n        type: text\n        allowed: [New, Acknowledged, Investigating, Contained, Recovering, Monitoring, Resolved, Closed, Cancelled]\n      severityLevel:\n        type: text\n        allowed: [Sev 1 Critical, Sev 2 High, Sev 3 Medium, Sev 4 Low]\n      priorityLevel:\n        type: text\n        allowed: [P1 Critical, P2 High, P3 Medium, P4 Low]\n  MajorIncident:\n    meaning: Deprecated modeling convenience; use Incident with majorIncidentDeclared set to true.\nrelationships:\n  - name: declaresMajorIncidentStatusFor\n    from: IncidentCommander\n    to: Incident\n    meaning: An incident commander can declare major-incident status for an incident.\n  - name: declaresMajorIncidentStatusFor\n    from: DutyManager\n    to: Incident\n    meaning: A duty manager can declare major-incident status for an incident.\n  - name: commands\n    from: IncidentCommander\n    to: Incident\n    meaning: Once major-incident status is declared, the incident commander leads coordination, communication, and decision-making for the incident.\nrules:\n  severityAndPriorityCanDiffer:\n    conditions:\n      - Severity reflects technical impact while priority reflects required response speed based on business considerations.\n      - A workaround may reduce priority even when technical severity remains high.\n  durationBasedMajorIncidentAssessment:\n    conditions:\n      - Duration-based escalation thresholds are fixed by criticality tier and service type.\n      - A Tier 1 outage lasting over 15 minutes triggers major-incident assessment.\nactions:\n  assessForMajorIncident:\n    input: Incident\n    preconditions: [durationBasedMajorIncidentAssessment]\n  declareMajorIncident:\n    input: Incident\n    preconditions: [majorIncidentCriteria]"
}
```

### Turn 5 — tool

Applied. Added 6, updated 3 existing item(s).

### Turn 5 — assistant

Got it — I’ve updated the model so **major incident is a status on Incident**, using:

- `majorIncidentDeclared: boolean`
- `lifecycleStatus` with controlled values:
  - New
  - Acknowledged
  - Investigating
  - Contained
  - Recovering
  - Monitoring
  - Resolved
  - Closed
  - Cancelled

I also captured that:

- **Severity** = technical impact.
- **Priority** = business-driven response urgency.
- They can differ, especially where a workaround reduces business urgency.
- Duration-based escalation thresholds depend on **criticality tier** and **service type**.
- A **Tier 1 outage over 15 minutes** triggers major-incident assessment.

Next, let’s cover **command structure and decision ownership**.

Could you walk me through:

1. **Roles during a major incident**  
   Besides the Incident Commander and Duty Manager, who participates?  
   For example: technical lead, business lead, communications lead, regulatory liaison, cyber lead, service owner, vendor manager, executive sponsor, scribe, problem manager.

2. **Decision rights**  
   Who is allowed to make decisions such as:
   - declaring a major incident
   - approving emergency change
   - invoking disaster recovery
   - taking a service offline
   - issuing customer communications
   - notifying regulators
   - accepting residual risk / deciding to continue operations

3. **Command structure**  
   Do you use named groups or bridges?  
   For example:
   - major incident bridge
   - technical bridge
   - executive bridge
   - crisis management team
   - war room

4. **Ownership links**  
   During an incident, does the Incident Commander own the incident end-to-end, while Service Owners own restoration of their affected services?

5. **Escalation model**  
   What triggers escalation to executives, crisis management, cyber response, legal/compliance, or regulators?

### Turn 6 — user

I'm glad to provide clarity on the command structure and decision ownership during a major incident. Here's how we organize it:  1. **Roles during a major incident:**      In addition to the **Incident Commander** and **Duty Manager**, several key players usually participate:    - **Technical Lead:** Responsible for diagnosing the technical issues and coordinating resolution efforts.    - **Business Lead:** Ensures that business considerations are represented and that the impact on operations and customers is managed.    - **Communications Lead:** Manages internal and external communications, ensuring consistent messaging.    - **Regulatory Liaison:** Ensures that any necessary regulatory considerations are communicated and handled appropriately.    - **Cyber Lead:** Focuses on cybersecurity implications and any required security response.    - **Service Owners:** They provide insights into the services affected and how to restore them effectively.    - **Vendor Manager:** Coordinates with any vendors involved in providing the services being disrupted.    - **Executive Sponsor:** Represents senior management and provides authority for high-level decisions.    - **Scribe:** Takes notes of decisions and action items during the incident response.    - **Problem Manager:** Involved in identifying root causes if the incident evolves into a problem.  2. **Decision rights:**      Different decisions are made by various individuals based on their responsibilities:    - **Declaring a Major Incident:** Typically the **Incident Commander** or delegated **Duty Manager**.    - **Approving Emergency Change:** Requires the agreement of the **Incident Commander** and relevant stakeholders, often including the **Technical Owner**.    - **Invoking Disaster Recovery:** The **Incident Commander** alongside the **Business Lead** and possibly **Crisis Management team**.    - **Taking a Service Offline:** Decision made by the **Technical Lead** or **Service Owner** with the **Incident Commander’s approval**.    - **Issuing Customer Communications:** Primarily the **Communications Lead**, approved by the **Incident Commander** and **Business Lead**.    - **Notifying Regulators:** Managed by the **Regulatory Liaison**, often in coordination with the **Incident Commander**.    - **Accepting Residual Risk:** This usually falls under the **Business Lead** and **Executive Sponsor’s** purview, as it involves business impact considerations.  3. **Command structure:**      For managing major incidents, we establish:    - **Major Incident Bridge:** A central location (physical or virtual) for real-time collaboration.    - **Technical Bridge:** A subgroup focusing specifically on technical aspects of the incident resolution.    - **Executive Bridge:** Involving senior leadership to keep them informed and involved in decision-making.    - **Crisis Management Team:** A broader team that deals with the operational and reputational impact.    - **War Room:** This can refer to a physical or virtual space where all key stakeholders convene during major incidents.  4. **Ownership links:**      Yes, during an incident, the **Incident Commander** owns the incident end-to-end in terms of coordination and management. Meanwhile, **Service Owners** are responsible for the restoration of their affected services, ensuring that the resolution aligns with business needs and expectations.  5. **Escalation model:**      Various triggers can lead to escalation, including:    - A **significant impact on customers** or operations may prompt escalation to executives.    - A need for **Crisis Management** may arise if reputational risks become evident.    - Involvement of **Cyber Response** if a major cybersecurity concern arises.    - **Legal/Compliance** escalation if there are regulatory implications or potential breaches.    - **Regulatory notifications** may be necessary based on the nature and extent of the incident, especially if there are compliance risks.  This command structure ensures effective coordination, decision-making, and communication during a major incident. If you have more points to discuss or would like to delve into specific areas, feel free to guide the conversation!

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  TechnicalLead:\n    meaning: Role responsible for diagnosing technical issues and coordinating resolution efforts during an incident.\n    aliases: [technical lead]\n  TechnicalOwner:\n    meaning: Role accountable for the technical ownership of an affected technology component or change decision.\n    aliases: [technical owner]\n  BusinessLead:\n    meaning: Role that represents business considerations and manages operational and customer impact during an incident.\n    aliases: [business lead]\n  CommunicationsLead:\n    meaning: Role that manages internal and external incident communications and consistent messaging.\n    aliases: [communications lead]\n  RegulatoryLiaison:\n    meaning: Role that handles regulatory considerations and coordinates regulatory notifications during an incident.\n    aliases: [regulatory liaison]\n  CyberLead:\n    meaning: Role focused on cybersecurity implications and required security response during an incident.\n    aliases: [cyber lead]\n  VendorManager:\n    meaning: Role that coordinates with vendors involved in disrupted services.\n    aliases: [vendor manager]\n  ExecutiveSponsor:\n    meaning: Senior management role providing authority for high-level decisions during an incident.\n    aliases: [executive sponsor]\n  Scribe:\n    meaning: Role that records decisions and action items during incident response.\n    aliases: [scribe]\n  ProblemManager:\n    meaning: Role involved in identifying root cause if an incident evolves into a problem.\n    aliases: [problem manager]\n  MajorIncidentBridge:\n    meaning: Central physical or virtual location for real-time collaboration during a major incident.\n    aliases: [major incident bridge]\n  TechnicalBridge:\n    meaning: Subgroup or bridge focused on technical diagnosis and resolution during an incident.\n    aliases: [technical bridge]\n  ExecutiveBridge:\n    meaning: Senior leadership bridge used for executive awareness and high-level decision-making during an incident.\n    aliases: [executive bridge]\n  CrisisManagementTeam:\n    meaning: Broader team dealing with operational and reputational impact of a major incident.\n    aliases: [crisis management team, CMT]\n  WarRoom:\n    meaning: Physical or virtual space where key stakeholders convene during major incidents.\n    aliases: [war room]\n  CyberResponse:\n    meaning: Specialized response capability invoked when an incident has major cybersecurity concern.\n    aliases: [cyber response]\n  LegalCompliance:\n    meaning: Legal and compliance function engaged when incidents have regulatory implications or potential breaches.\n    aliases: [legal/compliance, legal and compliance]\n  EmergencyChange:\n    meaning: Urgent change used during incident response to restore service or mitigate impact.\n    aliases: [emergency change]\n  DisasterRecovery:\n    meaning: Recovery approach invoked to restore services using disaster recovery capabilities.\n    aliases: [disaster recovery, DR]\n  CustomerCommunication:\n    meaning: External communication issued to customers about an incident or its impact.\n    aliases: [customer communication]\n  RegulatoryNotification:\n    meaning: Notification made to regulators based on incident nature, extent, or compliance risk.\n    aliases: [regulatory notification]\n  ResidualRiskAcceptance:\n    meaning: Decision to accept remaining risk and continue operations after mitigation or workaround.\n    aliases: [residual risk acceptance, accepting residual risk]\nrelationships:\n  - name: ownsCoordinationOf\n    from: IncidentCommander\n    to: Incident\n    meaning: The incident commander owns end-to-end coordination and management of the incident.\n  - name: ownsRestorationOf\n    from: ServiceOwner\n    to: BusinessService\n    meaning: A service owner is responsible for restoration of an affected business service during an incident.\n  - name: ownsRestorationOf\n    from: ServiceOwner\n    to: ITService\n    meaning: A service owner is responsible for restoration of an affected IT service during an incident.\n  - name: ownsRestorationOf\n    from: ServiceOwner\n    to: Application\n    meaning: A service owner is responsible for restoration of an affected application during an incident.\n  - name: participatesIn\n    from: TechnicalLead\n    to: MajorIncidentBridge\n    meaning: The technical lead participates in the major incident bridge.\n  - name: participatesIn\n    from: BusinessLead\n    to: MajorIncidentBridge\n    meaning: The business lead participates in the major incident bridge.\n  - name: participatesIn\n    from: CommunicationsLead\n    to: MajorIncidentBridge\n    meaning: The communications lead participates in the major incident bridge.\n  - name: participatesIn\n    from: RegulatoryLiaison\n    to: MajorIncidentBridge\n    meaning: The regulatory liaison participates in the major incident bridge when regulatory considerations apply.\n  - name: participatesIn\n    from: CyberLead\n    to: MajorIncidentBridge\n    meaning: The cyber lead participates in the major incident bridge when cybersecurity implications apply.\n  - name: participatesIn\n    from: VendorManager\n    to: MajorIncidentBridge\n    meaning: The vendor manager participates in the major incident bridge when vendors are involved.\n  - name: participatesIn\n    from: ExecutiveSponsor\n    to: ExecutiveBridge\n    meaning: The executive sponsor participates in the executive bridge.\n  - name: records\n    from: Scribe\n    to: Incident\n    meaning: The scribe records incident decisions and action items.\n  - name: investigatesRootCauseFor\n    from: ProblemManager\n    to: Incident\n    meaning: The problem manager investigates root cause when an incident evolves into a problem.\n  - name: coordinatesWith\n    from: VendorManager\n    to: ThirdPartyService\n    meaning: The vendor manager coordinates with vendors for disrupted third-party services.\n  - name: approves\n    from: IncidentCommander\n    to: EmergencyChange\n    meaning: The incident commander approves or agrees to an emergency change during incident response.\n  - name: agreesTo\n    from: TechnicalOwner\n    to: EmergencyChange\n    meaning: The relevant technical owner agrees to an emergency change during incident response.\n  - name: invokes\n    from: IncidentCommander\n    to: DisasterRecovery\n    meaning: The incident commander can invoke disaster recovery with business and crisis-management input.\n  - name: agreesToInvoke\n    from: BusinessLead\n    to: DisasterRecovery\n    meaning: The business lead agrees to invoking disaster recovery based on business impact.\n  - name: supportsInvocationOf\n    from: CrisisManagementTeam\n    to: DisasterRecovery\n    meaning: The crisis management team may support disaster recovery invocation for broader operational or reputational impact.\n  - name: approvesTakingOffline\n    from: IncidentCommander\n    to: BusinessService\n    meaning: The incident commander approves taking an affected service offline.\n  - name: decidesToTakeOffline\n    from: TechnicalLead\n    to: BusinessService\n    meaning: The technical lead may decide to take a service offline with incident commander approval.\n  - name: decidesToTakeOffline\n    from: ServiceOwner\n    to: BusinessService\n    meaning: The service owner may decide to take a service offline with incident commander approval.\n  - name: issues\n    from: CommunicationsLead\n    to: CustomerCommunication\n    meaning: The communications lead issues customer communications.\n  - name: approves\n    from: IncidentCommander\n    to: CustomerCommunication\n    meaning: The incident commander approves customer communications.\n  - name: approves\n    from: BusinessLead\n    to: CustomerCommunication\n    meaning: The business lead approves customer communications.\n  - name: manages\n    from: RegulatoryLiaison\n    to: RegulatoryNotification\n    meaning: The regulatory liaison manages regulatory notification.\n  - name: coordinatesWith\n    from: RegulatoryLiaison\n    to: IncidentCommander\n    meaning: The regulatory liaison coordinates with the incident commander on regulatory notifications.\n  - name: accepts\n    from: BusinessLead\n    to: ResidualRiskAcceptance\n    meaning: The business lead accepts residual risk based on business impact considerations.\n  - name: accepts\n    from: ExecutiveSponsor\n    to: ResidualRiskAcceptance\n    meaning: The executive sponsor accepts residual risk for high-level business decisions.\n  - name: escalatesTo\n    from: Incident\n    to: ExecutiveBridge\n    meaning: An incident escalates to executives when customer or operational impact is significant.\n  - name: escalatesTo\n    from: Incident\n    to: CrisisManagementTeam\n    meaning: An incident escalates to crisis management when reputational or broader operational risk is evident.\n  - name: escalatesTo\n    from: Incident\n    to: CyberResponse\n    meaning: An incident escalates to cyber response when major cybersecurity concern arises.\n  - name: escalatesTo\n    from: Incident\n    to: LegalCompliance\n    meaning: An incident escalates to legal/compliance when regulatory implications or potential breaches exist.\n  - name: triggers\n    from: Incident\n    to: RegulatoryNotification\n    meaning: An incident triggers regulatory notification based on its nature, extent, or compliance risk.\nrules:\n  executiveEscalationCriteria:\n    conditions:\n      - Incident has significant impact on customers or operations.\n  crisisManagementEscalationCriteria:\n    conditions:\n      - Incident presents evident reputational risk or broader operational impact.\n  cyberResponseEscalationCriteria:\n    conditions:\n      - Incident has a major cybersecurity concern.\n  legalComplianceEscalationCriteria:\n    conditions:\n      - Incident has regulatory implications or potential breaches.\n  regulatoryNotificationCriteria:\n    conditions:\n      - Incident nature and extent indicate compliance risk or regulatory notification obligation.\n  emergencyChangeApprovalCriteria:\n    conditions:\n      - Emergency change requires agreement of the Incident Commander and relevant stakeholders, often including the Technical Owner.\n  disasterRecoveryInvocationCriteria:\n    conditions:\n      - Disaster recovery invocation requires Incident Commander and Business Lead involvement, and may involve the Crisis Management Team.\n  customerCommunicationApprovalCriteria:\n    conditions:\n      - Customer communication is managed by the Communications Lead and approved by the Incident Commander and Business Lead.\n  residualRiskAcceptanceCriteria:\n    conditions:\n      - Residual risk acceptance is a business impact decision made by the Business Lead and Executive Sponsor.\nactions:\n  approveEmergencyChange:\n    input: EmergencyChange\n    preconditions: [emergencyChangeApprovalCriteria]\n  invokeDisasterRecovery:\n    input: Incident\n    preconditions: [disasterRecoveryInvocationCriteria]\n  issueCustomerCommunication:\n    input: CustomerCommunication\n    preconditions: [customerCommunicationApprovalCriteria]\n  notifyRegulator:\n    input: RegulatoryNotification\n    preconditions: [regulatoryNotificationCriteria]\n  acceptResidualRisk:\n    input: ResidualRiskAcceptance\n    preconditions: [residualRiskAcceptanceCriteria]"
}
```

### Turn 6 — tool

Applied. Added 70, updated 0 existing item(s).

### Turn 6 — assistant

Thanks — I’ve added the command structure, decision roles, bridges, escalation paths, and decision rules.

Current understanding:

- **Incident Commander** owns end-to-end incident coordination and management.
- **Service Owners** own restoration of affected services/applications.
- Major-incident roles include:
  - Technical Lead
  - Business Lead
  - Communications Lead
  - Regulatory Liaison
  - Cyber Lead
  - Service Owner
  - Vendor Manager
  - Executive Sponsor
  - Scribe
  - Problem Manager
- Command forums include:
  - Major Incident Bridge
  - Technical Bridge
  - Executive Bridge
  - Crisis Management Team
  - War Room
- Decision rights:
  - Major incident declaration: Incident Commander or Duty Manager
  - Emergency change: Incident Commander plus relevant stakeholders, often Technical Owner
  - Disaster recovery: Incident Commander and Business Lead, possibly Crisis Management Team
  - Taking service offline: Technical Lead or Service Owner, with Incident Commander approval
  - Customer communications: Communications Lead, approved by Incident Commander and Business Lead
  - Regulatory notification: Regulatory Liaison, coordinated with Incident Commander
  - Residual risk acceptance: Business Lead and Executive Sponsor
- Escalation triggers:
  - Significant customer/operational impact → Executive Bridge
  - Reputational or broad operational risk → Crisis Management Team
  - Major cybersecurity concern → Cyber Response
  - Regulatory implications or potential breach → Legal/Compliance
  - Compliance risk or reporting obligation → Regulatory Notification

One modeling issue to confirm: for “taking a service offline,” should that apply only to **Business Services**, or can the decision target **Customer-facing Services, IT Services, and Applications** as well? In practice, I’d expect “disable mobile app login,” “take payment API offline,” or “isolate an application” to be possible.

Next topic I recommend: **recovery and emergency change workflow**, since we’ve introduced emergency change and DR decisions.

Could you describe:

1. The normal sequence from diagnosis → workaround → fix → emergency change → recovery → monitoring.
2. What counts as a **workaround** versus a **permanent fix**.
3. Who approves implementation during a live incident.
4. What evidence must be captured before and after an emergency change.
5. How rollback decisions are made.
6. When disaster recovery, failover, or service isolation is used.

### Turn 7 — user

Your understanding of the command structure and decision ownership is comprehensive. Regarding your modeling issue on "taking a service offline," it would apply to not only **Business Services** but can also include **Customer-facing Services, IT Services, and Applications**. In practice, decisions like disabling mobile app logins, taking a payment API offline, or isolating an application are indeed valid and may be necessary during an incident.  Now, let’s delve into the **recovery and emergency change workflow**.  1. **Normal sequence from diagnosis to monitoring:**    - **Diagnosis:** Identify the nature of the incident and assess its impact on services.    - **Workaround:** Discover or implement a temporary solution to reduce the effect of the incident while a fix is being developed.     - **Fix:** Develop and test a permanent resolution to the underlying cause of the incident.    - **Emergency Change:** If the fix needs immediate implementation due to critical requirements, an emergency change is initiated.     - **Recovery:** Restore affected services to normal operational status using the implemented fix or emergency change.    - **Monitoring:** After recovery, actively monitor the system to ensure stability and verify that the incident has been fully resolved.  2. **Workaround versus permanent fix:**      - A **workaround** is a temporary method that reduces or bypasses the impact of an incident or problem without necessarily resolving the underlying cause. It aims to enable continued service operation despite an issue.    - A **permanent fix** addresses the root cause of the incident and provides a long-lasting solution that eliminates the need for further workarounds. Once applied, it should restore normal functionality without residual issues.  3. **Approval during a live incident:**      During a live incident, the **Incident Commander** usually approves the implementation of changes, particularly emergency changes. Depending on the nature of the issue, they may consult with the relevant **Technical Owner** and/or **Service Owner** to ensure that all implications are understood before proceeding.  4. **Evidence for emergency change:**      Before implementing an emergency change, critical evidence includes:    - Documentation of the incident details and its impact.    - Approval of the emergency change by the designated authority.    - Implementation and backout plans that outline the steps for execution and potential rollback actions.    After implementation, evidence must cover:    - Verification of successful execution.    - A clear record of any observed changes in service state, performance, or stability.    - Notifications to relevant stakeholders indicating that the change has been made and its expected effects.  5. **Rollback decisions:**      Rollback decisions are made based on:    - The effectiveness of the emergency change: If post-implementation monitoring indicates deterioration rather than improvement, a rollback may be triggered.    - Stakeholder feedback: If key stakeholders report unresolved issues or service degradation following the change.    - Predefined criteria within the implementation plan: If critical performance metrics are not met, this would trigger an evaluation for rollback.  6. **When disaster recovery, failover, or service isolation is used:**      - **Disaster Recovery** is invoked when there is a significant incident resulting in complete service unavailability, necessitating the execution of a predefined recovery plan to restore functionality.    - **Failover** occurs when a system is brought online in a secondary environment to maintain service continuity during an outage of the primary system.    - **Service Isolation** is employed when a component must be disconnected from the network or its dependencies to prevent it from affecting other services, often in the case of detected security threats or severe malfunctions.  With this recovery and emergency change workflow in mind, I'm ready to discuss further topics or details as you wish!

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Workaround:\n    meaning: Temporary method that reduces or bypasses incident impact without necessarily resolving the underlying cause.\n    aliases: [workaround, temporary solution]\n    properties:\n      enablesContinuedOperation:\n        type: boolean\n      residualImpact:\n        type: text\n  PermanentFix:\n    meaning: Long-lasting resolution that addresses the root cause and eliminates the need for the workaround.\n    aliases: [permanent fix, fix]\n    properties:\n      tested:\n        type: boolean\n      resolvesRootCause:\n        type: boolean\n  ImplementationPlan:\n    meaning: Plan describing the steps for executing an emergency change.\n    aliases: [implementation plan]\n  BackoutPlan:\n    meaning: Plan describing rollback actions if an emergency change causes deterioration or fails criteria.\n    aliases: [backout plan, rollback plan]\n  EmergencyChangeEvidence:\n    meaning: Evidence captured before and after an emergency change to support approval, execution, verification, and stakeholder notification.\n    aliases: [emergency change evidence, change evidence]\n    properties:\n      evidenceStage:\n        type: text\n        allowed: [Before implementation, After implementation]\n      evidenceType:\n        type: text\n        allowed: [incident details and impact, approval, implementation plan, backout plan, execution verification, service state change, performance change, stability change, stakeholder notification]\n  ServiceState:\n    meaning: Observed state of a service after implementation, including performance or stability changes.\n    aliases: [service state]\n    properties:\n      performance:\n        type: text\n      stability:\n        type: text\n  Failover:\n    meaning: Bringing a system online in a secondary environment to maintain service continuity during an outage of the primary system.\n    aliases: [failover]\n  ServiceIsolation:\n    meaning: Disconnecting a component from network or dependencies to prevent it from affecting other services.\n    aliases: [service isolation, isolate an application]\nrelationships:\n  - name: approvesTakingOffline\n    from: IncidentCommander\n    to: CustomerFacingService\n    meaning: The incident commander approves taking an affected customer-facing service offline.\n  - name: approvesTakingOffline\n    from: IncidentCommander\n    to: ITService\n    meaning: The incident commander approves taking an affected IT service offline.\n  - name: approvesTakingOffline\n    from: IncidentCommander\n    to: Application\n    meaning: The incident commander approves taking an affected application offline or isolating it.\n  - name: decidesToTakeOffline\n    from: TechnicalLead\n    to: CustomerFacingService\n    meaning: The technical lead may decide to take a customer-facing service offline with incident commander approval.\n  - name: decidesToTakeOffline\n    from: TechnicalLead\n    to: ITService\n    meaning: The technical lead may decide to take an IT service offline with incident commander approval.\n  - name: decidesToTakeOffline\n    from: TechnicalLead\n    to: Application\n    meaning: The technical lead may decide to take an application offline or isolate it with incident commander approval.\n  - name: decidesToTakeOffline\n    from: ServiceOwner\n    to: CustomerFacingService\n    meaning: The service owner may decide to take a customer-facing service offline with incident commander approval.\n  - name: decidesToTakeOffline\n    from: ServiceOwner\n    to: ITService\n    meaning: The service owner may decide to take an IT service offline with incident commander approval.\n  - name: decidesToTakeOffline\n    from: ServiceOwner\n    to: Application\n    meaning: The service owner may decide to take an application offline or isolate it with incident commander approval.\n  - name: hasWorkaround\n    from: Incident\n    to: Workaround\n    meaning: An incident may have a temporary workaround to reduce impact while a fix is developed.\n  - name: hasPermanentFix\n    from: Incident\n    to: PermanentFix\n    meaning: An incident may have a permanent fix that addresses the underlying cause.\n  - name: implementedThrough\n    from: PermanentFix\n    to: EmergencyChange\n    meaning: A permanent fix may be implemented immediately through an emergency change during a live incident.\n  - name: approves\n    from: IncidentCommander\n    to: PermanentFix\n    meaning: During a live incident, the incident commander approves implementation of a fix.\n  - name: consults\n    from: IncidentCommander\n    to: TechnicalOwner\n    meaning: The incident commander may consult the relevant technical owner before approving implementation during a live incident.\n  - name: consults\n    from: IncidentCommander\n    to: ServiceOwner\n    meaning: The incident commander may consult the relevant service owner before approving implementation during a live incident.\n  - name: hasImplementationPlan\n    from: EmergencyChange\n    to: ImplementationPlan\n    meaning: An emergency change has an implementation plan describing execution steps.\n  - name: hasBackoutPlan\n    from: EmergencyChange\n    to: BackoutPlan\n    meaning: An emergency change has a backout plan describing rollback actions.\n  - name: requiresEvidence\n    from: EmergencyChange\n    to: EmergencyChangeEvidence\n    meaning: An emergency change requires evidence before and after implementation.\n  - name: changes\n    from: EmergencyChange\n    to: ServiceState\n    meaning: An emergency change may change service state, performance, or stability.\n  - name: triggersRollbackOf\n    from: ServiceState\n    to: EmergencyChange\n    meaning: Deterioration in post-implementation service state can trigger rollback of the emergency change.\n  - name: triggersRollbackOf\n    from: BackoutPlan\n    to: EmergencyChange\n    meaning: Predefined criteria in the backout plan can trigger rollback of the emergency change.\n  - name: invokes\n    from: IncidentCommander\n    to: Failover\n    meaning: The incident commander may invoke failover to a secondary environment to maintain service continuity.\n  - name: invokes\n    from: IncidentCommander\n    to: ServiceIsolation\n    meaning: The incident commander may invoke service isolation to prevent wider impact.\n  - name: usedFor\n    from: Failover\n    to: Incident\n    meaning: Failover is used during an outage of the primary system to maintain service continuity.\n  - name: usedFor\n    from: ServiceIsolation\n    to: Incident\n    meaning: Service isolation is used during security threats or severe malfunctions to prevent wider impact.\nrules:\n  recoveryWorkflowSequence:\n    conditions:\n      - Incident response normally proceeds through diagnosis, workaround, fix, emergency change when immediate implementation is required, recovery, and monitoring.\n  emergencyChangeImplementationApprovalCriteria:\n    conditions:\n      - During a live incident, the Incident Commander approves implementation of emergency changes.\n      - The Incident Commander may consult the relevant Technical Owner or Service Owner before approving implementation.\n  emergencyChangeEvidenceCriteria:\n    conditions:\n      - Before implementation, emergency change evidence includes incident details and impact, approval, implementation plan, and backout plan.\n      - After implementation, emergency change evidence includes successful execution verification, observed service state, performance or stability changes, and stakeholder notifications.\n  rollbackCriteria:\n    conditions:\n      - Rollback is evaluated when post-implementation monitoring indicates deterioration rather than improvement.\n      - Rollback is evaluated when stakeholder feedback reports unresolved issues or service degradation after the change.\n      - Rollback is evaluated when predefined implementation-plan or backout-plan performance criteria are not met.\n  disasterRecoveryUsageCriteria:\n    conditions:\n      - Disaster recovery is invoked when a significant incident causes complete service unavailability and requires execution of a predefined recovery plan.\n  failoverUsageCriteria:\n    conditions:\n      - Failover is used when a secondary environment must be brought online to maintain service continuity during an outage of the primary system.\n  serviceIsolationUsageCriteria:\n    conditions:\n      - Service isolation is used when a component must be disconnected from the network or dependencies to prevent impact to other services.\n      - Service isolation is often used for detected security threats or severe malfunctions.\nactions:\n  implementEmergencyChange:\n    input: EmergencyChange\n    preconditions: [emergencyChangeImplementationApprovalCriteria, emergencyChangeEvidenceCriteria]\n  rollbackEmergencyChange:\n    input: EmergencyChange\n    preconditions: [rollbackCriteria]\n  performFailover:\n    input: Incident\n    preconditions: [failoverUsageCriteria]\n  performServiceIsolation:\n    input: Incident\n    preconditions: [serviceIsolationUsageCriteria]"
}
```

### Turn 7 — tool

Applied. Added 44, updated 0 existing item(s).

### Turn 7 — assistant

Thanks — I’ve updated the model for recovery, emergency change, rollback, DR, failover, and service isolation.

Captured additions:

- “Taking offline” can apply to:
  - Business Service
  - Customer-facing Service
  - IT Service
  - Application

- Recovery workflow sequence:
  1. Diagnosis
  2. Workaround
  3. Permanent fix
  4. Emergency change, if immediate implementation is needed
  5. Recovery
  6. Monitoring

- **Workaround** = temporary impact reduction or bypass; may leave residual impact.
- **Permanent Fix** = resolves root cause and eliminates need for workaround.
- **Incident Commander** approves live emergency implementation, consulting Technical Owner and/or Service Owner as needed.
- Emergency change requires:
  - Incident details and impact
  - Approval evidence
  - Implementation plan
  - Backout / rollback plan
  - Execution verification
  - Observed service state, performance, and stability changes
  - Stakeholder notification evidence
- Rollback is triggered or evaluated when:
  - Monitoring shows deterioration
  - Stakeholders report unresolved issues or degradation
  - Predefined implementation/backout criteria are not met
- **Disaster Recovery** is used for significant complete service unavailability.
- **Failover** brings up a secondary environment to maintain continuity.
- **Service Isolation** disconnects a component from network/dependencies to prevent wider impact, especially for security threats or severe malfunctions.

Next, I’d like to cover **evidence, communications, reviews, and regulatory reporting**, since those are core governance workflows.

Could you walk me through the evidence and audit side first?

1. What evidence must be captured during a major incident?  
   For example: timeline, decisions, approvals, bridge notes, impact assessments, communications, technical logs, screenshots, monitoring graphs, vendor updates.

2. Who is responsible for capturing and maintaining the incident record?  
   Is it the Scribe, Incident Commander, Service Owner, Problem Manager, or a governance function?

3. Do you have a formal **incident timeline** with required event types?  
   Example: detected, acknowledged, major incident declared, customer impact started, workaround applied, emergency change approved, recovery started, service restored, monitoring complete, closed.

4. What makes evidence acceptable for audit or regulatory purposes?

5. How long does evidence need to be retained, or is retention based on severity/regulatory impact?

### Turn 8 — user

I'm glad to help you detail the evidence and audit practices integral to our major incident management. Here's how we approach these aspects:  1. **Evidence captured during a major incident:**      We capture various types of evidence to ensure comprehensive documentation:    - **Timeline of Events:** A chronological log detailing significant actions and decisions.    - **Decisions and Approvals:** Records of key decisions and associated approvals regarding incident response and changes.    - **Bridge Notes:** Captured notes and discussions from the incident management bridge where stakeholders collaborate.    - **Impact Assessments:** Notes on the incident's business and technical impacts, including customer implications.    - **Communications:** Copies of all communications sent regarding the incident to stakeholders, customers, and regulators.    - **Technical Logs:** Logs from relevant systems that provide context on the technical aspects of the incident.    - **Screenshots and Monitoring Graphs:** Visual evidence of system states, performance metrics, and any anomalies observed during the incident.    - **Vendor Updates:** Documentation of any correspondence and support received from third-party vendors involved.  2. **Responsibility for capturing and maintaining the incident record:**      The **Scribe** is primarily responsible for capturing and maintaining the incident record, ensuring that all relevant information is documented accurately throughout the lifecycle of the incident. However, the **Incident Commander** also plays a key role by ensuring that necessary evidence is being collected and is appropriately logged.  3. **Formal incident timeline with required event types:**      Yes, we have a formal **incident timeline** that includes required event types. Common event types include:    - Detected    - Acknowledged    - Major incident declared    - Customer impact started    - Workaround applied    - Emergency change approved    - Recovery started    - Service restored    - Monitoring complete    - Closed      Capturing these events ensures clarity and provides a structured view of the incident's progression for review and audit purposes.  4. **Acceptability of evidence for audit or regulatory purposes:**      Evidence considered acceptable must exhibit the following qualities:    - **Authenticity:** Evidence should be collected in a manner that establishes its integrity (e.g., timestamps, secure storage).    - **Accuracy:** Information captured must be correct and represent the actual events or actions taken.    - **Completeness:** A comprehensive collection of all relevant pieces of evidence to support incident assessment and response decisions.    - **Traceability:** Evidence must be linked back to incident records, approvals, and actions taken, allowing for full visibility into the incident management process.  5. **Retention period for evidence:**      Evidence retention policies are typically influenced by the severity and regulatory impact of the incident. Generally, we maintain evidence for a period proportional to the risk and regulatory requirements, with critical incidents often requiring longer retention—usually a minimum of several years, in line with industry standards and compliance obligations.  This evidence and audit framework is essential to maintain accountability, transparency, and continual improvement in incident management practices. Once you're ready, we can move on to the **communications, reviews, and regulatory reporting workflows**.

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  IncidentRecord:\n    meaning: Authoritative record maintained for an incident, containing evidence, timeline, decisions, approvals, communications, and supporting material.\n    aliases: [incident record]\n    properties:\n      retentionBasis:\n        type: text\n  IncidentTimeline:\n    meaning: Chronological log of significant incident actions, events, decisions, and status changes.\n    aliases: [timeline of events, incident timeline]\n  TimelineEvent:\n    meaning: Required dated event captured in the incident timeline to show incident progression.\n    aliases: [timeline event, event type]\n    properties:\n      eventType:\n        type: text\n        allowed: [Detected, Acknowledged, Major incident declared, Customer impact started, Workaround applied, Emergency change approved, Recovery started, Service restored, Monitoring complete, Closed]\n      eventTime:\n        type: date\n  IncidentEvidence:\n    meaning: Evidence captured during a major incident to support review, audit, regulatory assessment, and accountability.\n    aliases: [evidence, major incident evidence]\n    properties:\n      evidenceType:\n        type: text\n        allowed: [timeline of events, decisions and approvals, bridge notes, impact assessment, communications, technical logs, screenshots, monitoring graphs, vendor updates]\n      authenticity:\n        type: boolean\n      accuracy:\n        type: boolean\n      completeness:\n        type: boolean\n      traceability:\n        type: boolean\n      retentionBasis:\n        type: text\n  BridgeNotes:\n    meaning: Notes and discussions captured from the incident management bridge where stakeholders collaborate.\n    aliases: [bridge notes]\n  ImpactAssessment:\n    meaning: Assessment of business, technical, customer, and regulatory impacts of an incident.\n    aliases: [impact assessment]\n    properties:\n      businessImpact:\n        type: text\n      technicalImpact:\n        type: text\n      customerImpact:\n        type: text\n      regulatoryImpact:\n        type: text\n  TechnicalLog:\n    meaning: Log from a relevant system that provides technical context for an incident.\n    aliases: [technical log, system log]\n  MonitoringGraph:\n    meaning: Visual evidence of system state, performance metrics, or anomalies observed during an incident.\n    aliases: [monitoring graph, screenshot]\n  VendorUpdate:\n    meaning: Documentation of correspondence, status, or support received from a third-party vendor during an incident.\n    aliases: [vendor update]\nrelationships:\n  - name: hasRecord\n    from: Incident\n    to: IncidentRecord\n    meaning: An incident has an authoritative incident record.\n  - name: maintains\n    from: Scribe\n    to: IncidentRecord\n    meaning: The scribe is primarily responsible for capturing and maintaining the incident record.\n  - name: ensuresCollectionFor\n    from: IncidentCommander\n    to: IncidentRecord\n    meaning: The incident commander ensures necessary evidence is collected and logged in the incident record.\n  - name: hasTimeline\n    from: IncidentRecord\n    to: IncidentTimeline\n    meaning: The incident record contains the formal incident timeline.\n  - name: contains\n    from: IncidentTimeline\n    to: TimelineEvent\n    meaning: The incident timeline contains required timeline events.\n  - name: contains\n    from: IncidentRecord\n    to: IncidentEvidence\n    meaning: The incident record contains evidence captured during the incident.\n  - name: includes\n    from: IncidentEvidence\n    to: BridgeNotes\n    meaning: Incident evidence may include bridge notes.\n  - name: includes\n    from: IncidentEvidence\n    to: ImpactAssessment\n    meaning: Incident evidence may include impact assessments.\n  - name: includes\n    from: IncidentEvidence\n    to: TechnicalLog\n    meaning: Incident evidence may include technical logs.\n  - name: includes\n    from: IncidentEvidence\n    to: MonitoringGraph\n    meaning: Incident evidence may include screenshots or monitoring graphs.\n  - name: includes\n    from: IncidentEvidence\n    to: VendorUpdate\n    meaning: Incident evidence may include vendor updates.\n  - name: linksTo\n    from: IncidentEvidence\n    to: IncidentRecord\n    meaning: Acceptable evidence is traceable back to the incident record, approvals, and actions taken.\n  - name: provides\n    from: ThirdPartyService\n    to: VendorUpdate\n    meaning: A third-party service provider may provide updates during an incident.\nrules:\n  auditEvidenceAcceptabilityCriteria:\n    conditions:\n      - Evidence must be authentic, with integrity supported by timestamps or secure storage.\n      - Evidence must be accurate and represent actual events or actions taken.\n      - Evidence must be complete enough to support incident assessment and response decisions.\n      - Evidence must be traceable to incident records, approvals, and actions taken.\n  evidenceRetentionCriteria:\n    conditions:\n      - Evidence retention is influenced by incident severity and regulatory impact.\n      - Critical incidents require longer retention, usually a minimum of several years in line with compliance obligations.\nactions:\n  maintainIncidentRecord:\n    input: IncidentRecord\n    preconditions: [auditEvidenceAcceptabilityCriteria]\n  retainIncidentEvidence:\n    input: IncidentEvidence\n    preconditions: [evidenceRetentionCriteria]"
}
```

### Turn 8 — tool

Applied. Added 26, updated 0 existing item(s).

### Turn 8 — assistant

Great — I’ve captured the evidence and audit model.

Added concepts include:

- **Incident Record** as the authoritative record.
- **Incident Timeline** with required event types:
  - Detected
  - Acknowledged
  - Major incident declared
  - Customer impact started
  - Workaround applied
  - Emergency change approved
  - Recovery started
  - Service restored
  - Monitoring complete
  - Closed
- **Incident Evidence** types:
  - timeline of events
  - decisions and approvals
  - bridge notes
  - impact assessment
  - communications
  - technical logs
  - screenshots
  - monitoring graphs
  - vendor updates
- Evidence quality criteria:
  - authenticity
  - accuracy
  - completeness
  - traceability
- Responsibilities:
  - **Scribe maintains the Incident Record**
  - **Incident Commander ensures evidence collection**
- Retention:
  - based on severity and regulatory impact
  - critical incidents retained longer, generally several years in line with compliance obligations

Next, let’s cover **communications and regulatory reporting workflows**.

Could you describe:

1. **Communication types**
   - Internal stakeholder updates
   - Executive updates
   - Customer communications
   - Branch/contact-centre advisories
   - Status page updates
   - Regulator notifications
   - Third-party/vendor communications

2. **Who approves each communication type?**

3. **What triggers customer communication?**
   For example: confirmed customer impact, prolonged outage, payment impact, reputational risk, regulatory expectation.

4. **What triggers regulator notification?**
   Are there specific criteria such as payment-system impact, data breach, operational resilience threshold, material customer detriment, financial stability concern, or incident duration?

5. **Do communications have fixed statuses or lifecycle stages?**
   Example: Drafted, Approved, Issued, Updated, Withdrawn.

6. **Do you track communication deadlines or regulatory reporting clocks?**

### Turn 9 — user

I'm happy to guide you through our communications and regulatory reporting workflows. Here’s how we structure this aspect:  1. **Communication types:**      We classify communications into several critical types to ensure clear messaging and effective information dissemination:    - **Internal Stakeholder Updates:** Regular updates for internal teams involved in incident response.    - **Executive Updates:** Summary reports and updates for senior management to keep them informed on the incident status.    - **Customer Communications:** Official messages to inform customers about service disruptions, resolutions, or impacts.    - **Branch/Contact-centre Advisories:** Notifications to branches and contact points to assist customer inquiries and concerns during incidents.    - **Status Page Updates:** Public-facing updates on the current status of services, typically posted on the bank's status page.    - **Regulator Notifications:** Communications to regulatory bodies that articulate incident specifics and compliance information.    - **Third-party/Vendor Communications:** Messages sent to third-party service providers to coordinate support and information during outages.  2. **Approval for each communication type:**      The approval process typically involves:    - **Internal Stakeholder Updates:** Approved by the **Incident Commander** or designated team leads.    - **Executive Updates:** Review and approval by the **Incident Commander** and possibly a **Business Lead**.    - **Customer Communications:** Written by the **Communications Lead**, approved by the **Incident Commander** and **Business Lead**.    - **Branch/Contact-centre Advisories:** Managed by the **Communications Lead**, aligned with overall incident communication plans.    - **Status Page Updates:** Prepared by the **Communications Lead**, with approval from the **Incident Commander**.    - **Regulator Notifications:** Prepared by the **Regulatory Liaison** and approved by the **Incident Commander**.    - **Third-party/Vendor Communications:** Coordinated by the **Vendor Manager** and approved by the **Incident Commander**.  3. **Triggers for customer communication:**      Communications to customers are triggered by conditions such as:    - Confirmed **customer impact** due to incident effects.    - Prolonged **outages** affecting service availability.    - Impact on **payment systems** or transactions.    - Demonstrable **reputational risk** or loss of trust with customers.    - Specific **regulatory expectations** regarding communication during incidents.  4. **Triggers for regulator notification:**      Regulator notifications are typically triggered by criteria such as:    - Significant **payment-system impact** that affects financial transactions.    - Confirmation of a **data breach** or data integrity issue.    - Failure to meet **operational resilience thresholds** set by regulations.    - Incidents resulting in **material customer detriment** affecting numerous customers or services.    - Broad concerns about **financial stability** related to the incident's impact.    - Extended **incident duration** that could raise compliance flags.  5. **Communication statuses or lifecycle stages:**      We do track fixed statuses for communications, which may include:    - Drafted    - Approved    - Issued    - Updated    - Withdrawn      These statuses allow us to manage the lifecycle of communications systematically.  6. **Tracking communication deadlines or regulatory reporting clocks:**      Yes, we track both communication deadlines and regulatory reporting timelines. This helps ensure that we meet necessary timelines for both internal stakeholders and external regulatory obligations, particularly when time-sensitive issues arise.  With these communications and regulatory reporting workflows established, let me know if there are additional areas you'd like to discuss or if you want to move on to the next topic!

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Communication:\n    meaning: Message or update issued during incident response to internal, external, customer, regulatory, or vendor audiences.\n    aliases: [communication, incident communication]\n    properties:\n      communicationType:\n        type: text\n        allowed: [Internal Stakeholder Update, Executive Update, Customer Communication, Branch/Contact-centre Advisory, Status Page Update, Regulator Notification, Third-party/Vendor Communication]\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  InternalStakeholderUpdate:\n    meaning: Regular update for internal teams involved in incident response.\n    aliases: [internal stakeholder update]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  ExecutiveUpdate:\n    meaning: Summary report or update for senior management on incident status.\n    aliases: [executive update]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  BranchContactCentreAdvisory:\n    meaning: Advisory to branches and contact centres to assist customer inquiries and concerns during incidents.\n    aliases: [branch/contact-centre advisory, branch advisory, contact-centre advisory]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  StatusPageUpdate:\n    meaning: Public-facing update posted on the bank's status page about current service status.\n    aliases: [status page update]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  RegulatoryReportingClock:\n    meaning: Time-bound regulatory reporting timeline tracked to ensure external regulatory obligations are met.\n    aliases: [regulatory reporting clock, reporting clock]\n    properties:\n      deadline:\n        type: date\n      clockTrigger:\n        type: text\n  CommunicationDeadline:\n    meaning: Time-bound deadline tracked for incident communications.\n    aliases: [communication deadline]\n    properties:\n      deadline:\n        type: date\n  DataBreach:\n    meaning: Confirmed breach or issue affecting data confidentiality, integrity, or related regulatory obligations.\n    aliases: [data breach, data integrity issue]\n  OperationalResilienceThreshold:\n    meaning: Regulatory or internal threshold for operational resilience that may trigger notification or escalation when breached.\n    aliases: [operational resilience threshold]\n    properties:\n      thresholdDescription:\n        type: text\n  MaterialCustomerDetriment:\n    meaning: Material harm or detriment affecting numerous customers or services as a result of an incident.\n    aliases: [material customer detriment]\n  FinancialStabilityConcern:\n    meaning: Broad concern that an incident may affect financial stability.\n    aliases: [financial stability concern]\nrelationships:\n  - name: hasCommunication\n    from: Incident\n    to: Communication\n    meaning: An incident has communications issued or managed as part of response.\n  - name: contains\n    from: IncidentRecord\n    to: Communication\n    meaning: The incident record contains copies of all communications sent regarding the incident.\n  - name: approves\n    from: IncidentCommander\n    to: InternalStakeholderUpdate\n    meaning: The incident commander approves internal stakeholder updates.\n  - name: approves\n    from: IncidentCommander\n    to: ExecutiveUpdate\n    meaning: The incident commander approves executive updates.\n  - name: approves\n    from: BusinessLead\n    to: ExecutiveUpdate\n    meaning: The business lead may approve executive updates.\n  - name: manages\n    from: CommunicationsLead\n    to: BranchContactCentreAdvisory\n    meaning: The communications lead manages branch and contact-centre advisories aligned with the incident communication plan.\n  - name: prepares\n    from: CommunicationsLead\n    to: StatusPageUpdate\n    meaning: The communications lead prepares status page updates.\n  - name: approves\n    from: IncidentCommander\n    to: StatusPageUpdate\n    meaning: The incident commander approves status page updates.\n  - name: prepares\n    from: RegulatoryLiaison\n    to: RegulatoryNotification\n    meaning: The regulatory liaison prepares regulator notifications.\n  - name: approves\n    from: IncidentCommander\n    to: RegulatoryNotification\n    meaning: The incident commander approves regulator notifications.\n  - name: coordinates\n    from: VendorManager\n    to: Communication\n    meaning: The vendor manager coordinates third-party/vendor communications.\n  - name: approves\n    from: IncidentCommander\n    to: Communication\n    meaning: The incident commander approves third-party/vendor communications and may approve internal stakeholder updates.\n  - name: hasReportingClock\n    from: RegulatoryNotification\n    to: RegulatoryReportingClock\n    meaning: A regulator notification may have a tracked regulatory reporting clock.\n  - name: hasDeadline\n    from: Communication\n    to: CommunicationDeadline\n    meaning: Communications may have tracked deadlines.\n  - name: triggers\n    from: Incident\n    to: CustomerCommunication\n    meaning: An incident triggers customer communication when customer-facing communication criteria are met.\n  - name: triggers\n    from: DataBreach\n    to: RegulatoryNotification\n    meaning: A confirmed data breach or data integrity issue triggers regulatory notification assessment.\n  - name: triggers\n    from: OperationalResilienceThreshold\n    to: RegulatoryNotification\n    meaning: Failure to meet an operational resilience threshold triggers regulatory notification assessment.\n  - name: triggers\n    from: MaterialCustomerDetriment\n    to: RegulatoryNotification\n    meaning: Material customer detriment triggers regulatory notification assessment.\n  - name: triggers\n    from: FinancialStabilityConcern\n    to: RegulatoryNotification\n    meaning: Financial stability concern triggers regulatory notification assessment.\nrules:\n  customerCommunicationTriggerCriteria:\n    conditions:\n      - Customer communication is triggered by confirmed customer impact.\n      - Customer communication is triggered by prolonged outages affecting service availability.\n      - Customer communication is triggered by payment-system or transaction impact.\n      - Customer communication is triggered by demonstrable reputational risk or loss of customer trust.\n      - Customer communication is triggered by regulatory expectations regarding incident communication.\n  regulatorNotificationTriggerCriteria:\n    conditions:\n      - Regulator notification is triggered by significant payment-system impact affecting financial transactions.\n      - Regulator notification is triggered by confirmed data breach or data integrity issue.\n      - Regulator notification is triggered by failure to meet operational resilience thresholds.\n      - Regulator notification is triggered by material customer detriment affecting numerous customers or services.\n      - Regulator notification is triggered by broad financial stability concern.\n      - Regulator notification is triggered by extended incident duration that could raise compliance flags.\n  communicationLifecycleCriteria:\n    conditions:\n      - Incident communications follow fixed statuses of Drafted, Approved, Issued, Updated, and Withdrawn.\n  regulatoryReportingClockCriteria:\n    conditions:\n      - Communication deadlines and regulatory reporting timelines are tracked to ensure internal and external obligations are met.\nactions:\n  issueIncidentCommunication:\n    input: Communication\n    preconditions: [communicationLifecycleCriteria, regulatoryReportingClockCriteria]\n  assessCustomerCommunicationNeed:\n    input: Incident\n    preconditions: [customerCommunicationTriggerCriteria]\n  assessRegulatorNotificationNeed:\n    input: Incident\n    preconditions: [regulatorNotificationTriggerCriteria]\n  trackRegulatoryReportingClock:\n    input: RegulatoryNotification\n    preconditions: [regulatoryReportingClockCriteria]"
}
```

### Turn 9 — tool

Applied. Added 38, updated 0 existing item(s).

### Turn 9 — assistant

Excellent — I’ve added the communications and regulatory reporting workflow.

Captured communication types:

- Internal Stakeholder Update
- Executive Update
- Customer Communication
- Branch/Contact-centre Advisory
- Status Page Update
- Regulator Notification
- Third-party/Vendor Communication

Communication lifecycle statuses:

- Drafted
- Approved
- Issued
- Updated
- Withdrawn

Approvals and ownership:

- **Internal Stakeholder Updates**: approved by Incident Commander or designated team leads.
- **Executive Updates**: approved by Incident Commander and possibly Business Lead.
- **Customer Communications**: written by Communications Lead; approved by Incident Commander and Business Lead.
- **Branch/Contact-centre Advisories**: managed by Communications Lead.
- **Status Page Updates**: prepared by Communications Lead; approved by Incident Commander.
- **Regulator Notifications**: prepared by Regulatory Liaison; approved by Incident Commander.
- **Third-party/Vendor Communications**: coordinated by Vendor Manager; approved by Incident Commander.

Customer communication triggers:

- Confirmed customer impact
- Prolonged outage
- Payment-system / transaction impact
- Reputational risk or loss of customer trust
- Regulatory expectation

Regulatory notification triggers:

- Significant payment-system impact
- Confirmed data breach or data integrity issue
- Operational resilience threshold failure
- Material customer detriment
- Financial stability concern
- Extended incident duration

I also captured that **communication deadlines** and **regulatory reporting clocks** are tracked.

A couple of clarifications:

1. Do you distinguish between **initial regulator notification**, **interim updates**, and **final report/closure notification**?

2. Are regulatory reporting clocks based on:
   - detection time,
   - major incident declaration time,
   - confirmation of reportability,
   - customer impact start time,
   - or something else?

3. For customer communications, do you require pre-approved templates, legal/compliance review, or channel-specific approval?

After that, I’d suggest we cover **post-incident review, problem management, and lessons learned**.

### Turn 10 — user

Your model for communications and regulatory reporting workflows is thorough, and I appreciate the additional clarifications. Here’s how we approach the questions you raised:  1. **Distinction in regulatory notifications:**      Yes, we do distinguish between:    - **Initial Regulator Notification:** This is the first report made to regulators, indicating that an incident has occurred and outlining initial findings and impacts.    - **Interim Updates:** These are subsequent communications that provide updates on the incident's status, any emerging insights, and ongoing actions being taken to address the situation.    - **Final Report/Closure Notification:** This is the comprehensive report that outlines the full details of the incident, final outcomes, actions taken, and any necessary remedial measures, usually submitted once the incident is resolved.  2. **Regulatory reporting clocks:**      Regulatory reporting clocks are typically based on the **initial detection time** of the incident. This ensures that we are aligned with regulatory expectations for prompt reporting of significant incidents. In certain cases, **major incident declaration time** may also start the clock for specific reporting requirements if it significantly correlates with regulatory obligations.  3. **Pre-approved templates and reviews for customer communications:**      For customer communications, we do require:    - **Pre-approved Templates:** We maintain a set of templates for common communication scenarios to expedite the communication process during an incident.    - **Legal/Compliance Review:** Significant customer communications, particularly those with potential legal implications, are subject to review by our legal or compliance teams to ensure that they meet regulatory standards and protect the bank's interests.    - **Channel-specific Approval:** Different channels (e.g., social media, email) may have tailored communication strategies, necessitating specific approvals depending on the audience and delivery method.  With these clarifications in mind, I'm ready to transition to the next topic of **post-incident review, problem management, and lessons learned** whenever you are!

### Turn 10 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  InitialRegulatorNotification:\n    meaning: First report to regulators indicating that an incident has occurred and outlining initial findings and impacts.\n    aliases: [initial regulator notification]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  InterimRegulatorUpdate:\n    meaning: Subsequent regulator communication providing updates on incident status, emerging insights, and ongoing actions.\n    aliases: [interim update, interim regulator update]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  FinalReportClosureNotification:\n    meaning: Comprehensive final regulator report or closure notification covering incident details, final outcomes, actions taken, and remedial measures.\n    aliases: [final report, closure notification, final report/closure notification]\n    properties:\n      communicationStatus:\n        type: text\n        allowed: [Drafted, Approved, Issued, Updated, Withdrawn]\n      deadline:\n        type: date\n  CustomerCommunicationTemplate:\n    meaning: Pre-approved template for common customer communication scenarios used to expedite incident communications.\n    aliases: [pre-approved template, customer communication template]\n  CommunicationChannel:\n    meaning: Delivery channel for customer communications with channel-specific strategy and approval needs.\n    aliases: [channel, communication channel]\n    properties:\n      channelType:\n        type: text\n        allowed: [social media, email, status page, branch, contact centre, SMS, mobile app]\n  LegalComplianceReview:\n    meaning: Review by legal or compliance teams for significant communications with potential legal or regulatory implications.\n    aliases: [legal/compliance review]\nrelationships:\n  - name: hasInitialNotification\n    from: RegulatoryNotification\n    to: InitialRegulatorNotification\n    meaning: A regulatory notification workflow includes an initial regulator notification.\n  - name: hasInterimUpdate\n    from: RegulatoryNotification\n    to: InterimRegulatorUpdate\n    meaning: A regulatory notification workflow may include interim regulator updates.\n  - name: hasFinalReport\n    from: RegulatoryNotification\n    to: FinalReportClosureNotification\n    meaning: A regulatory notification workflow includes a final report or closure notification once the incident is resolved.\n  - name: startsFrom\n    from: RegulatoryReportingClock\n    to: TimelineEvent\n    meaning: The regulatory reporting clock typically starts from the initial detection timeline event, and in some cases from major incident declaration.\n  - name: usesTemplate\n    from: CustomerCommunication\n    to: CustomerCommunicationTemplate\n    meaning: Customer communications use pre-approved templates for common incident scenarios.\n  - name: deliveredThrough\n    from: CustomerCommunication\n    to: CommunicationChannel\n    meaning: Customer communications are delivered through channels such as social media, email, status page, branch, contact centre, SMS, or mobile app.\n  - name: requiresReview\n    from: CustomerCommunication\n    to: LegalComplianceReview\n    meaning: Significant customer communications with potential legal implications require legal or compliance review.\n  - name: requiresApprovalFor\n    from: CommunicationChannel\n    to: CustomerCommunication\n    meaning: Channel-specific communication strategies may require specific approval depending on audience and delivery method.\nrules:\n  regulatorNotificationWorkflowCriteria:\n    conditions:\n      - Regulatory notification workflows distinguish initial regulator notification, interim updates, and final report or closure notification.\n      - Initial regulator notification outlines initial findings and impacts.\n      - Interim updates provide incident status, emerging insights, and ongoing actions.\n      - Final report or closure notification provides full incident details, final outcomes, actions taken, and remedial measures once resolved.\n  regulatoryReportingClockStartCriteria:\n    conditions:\n      - Regulatory reporting clocks are typically based on initial detection time.\n      - In some cases, major incident declaration time may start the clock for specific reporting requirements.\n  customerCommunicationGovernanceCriteria:\n    conditions:\n      - Customer communications use pre-approved templates for common scenarios.\n      - Significant customer communications with potential legal implications require legal or compliance review.\n      - Channel-specific approval may be required depending on audience and delivery method.\nactions:\n  prepareInitialRegulatorNotification:\n    input: InitialRegulatorNotification\n    preconditions: [regulatorNotificationWorkflowCriteria, regulatoryReportingClockStartCriteria]\n  prepareInterimRegulatorUpdate:\n    input: InterimRegulatorUpdate\n    preconditions: [regulatorNotificationWorkflowCriteria]\n  prepareFinalReportClosureNotification:\n    input: FinalReportClosureNotification\n    preconditions: [regulatorNotificationWorkflowCriteria]\n  approveCustomerCommunication:\n    input: CustomerCommunication\n    preconditions: [customerCommunicationGovernanceCriteria, customerCommunicationApprovalCriteria]"
}
```

### Turn 10 — tool

Applied. Added 21, updated 0 existing item(s).

### Turn 10 — assistant

Great — I’ve added the regulatory notification subtypes and customer communication governance.

Captured:

- Regulatory notification workflow includes:
  - **Initial Regulator Notification**
  - **Interim Regulator Update**
  - **Final Report / Closure Notification**

- Regulatory reporting clock:
  - usually starts from **initial detection time**
  - in some cases may start from **major incident declaration time**

- Customer communication governance:
  - uses **pre-approved templates**
  - significant communications may require **Legal/Compliance Review**
  - channel-specific approval may apply depending on the audience and delivery method

- Communication channels include:
  - social media
  - email
  - status page
  - branch
  - contact centre
  - SMS
  - mobile app

Now let’s cover **post-incident review, problem management, and lessons learned**.

Could you describe:

1. When is a **post-incident review** required?  
   For all major incidents, only Sev 1/Sev 2, regulatory incidents, repeat incidents, etc.?

2. Who owns and participates in the review?  
   For example: Problem Manager, Incident Commander, Service Owner, Technical Lead, Business Lead, Risk/Compliance, Vendor Manager.

3. What outputs are expected?  
   Example: root cause, contributing factors, control gaps, lessons learned, corrective actions, risk acceptance, regulatory follow-up.

4. How are **problems** created from incidents?  
   Is a problem record mandatory after major incidents or only when root cause is unknown / recurring?

5. How are corrective actions tracked?  
   Do they have owners, due dates, risk ratings, statuses, executive oversight?

6. Are there rules for closure?  
   For example, incident cannot close until timeline and evidence are complete; review cannot close until actions are assigned.

### Turn 11 — user

I'm glad to continue with the discussion on **post-incident review, problem management, and lessons learned**. Here’s how we approach these areas:  1. **When a post-incident review is required:**      A **post-incident review (PIR)** is required for:    - All **major incidents** to assess the response and identify improvement areas.    - Any **Sev 1 or Sev 2 incidents** that have substantial impacts on customers or require significant operational response.    - **Regulatory incidents** that may involve compliance obligations and necessitate thorough documentation for regulators.    - **Repeat incidents**, where previously unresolved issues reoccur, warranting closer examination to avoid future occurrences.  2. **Ownership and participation in the review:**      The **Incident Commander** typically owns the post-incident review process. Participants may include:    - **Problem Manager:** Oversees the identification of root causes and contributes to the review.    - **Service Owner:** Provides insights about affected services and operational impacts.    - **Technical Lead:** Offers technical perspectives on incident resolution and system behavior.    - **Business Lead:** Ensures that business implications are considered and addressed.    - **Risk/Compliance Representative:** Evaluates regulatory implications and compliance adherence.    - **Vendor Manager:** Involved if third-party services were factors in the incident.  3. **Expected outputs of the review:**      The outputs of a post-incident review should include:    - **Root cause analysis** of the incident.    - Identification of **contributing factors** that led to the incident.    - Discovery of any **control gaps** that allowed the incident to occur.    - Documentation of **lessons learned** from the incident response.    - Proposed **corrective actions** aimed at preventing recurrence.    - Records of **risk acceptance** discussions, especially if not all risks can be mitigated.    - Any necessary **regulatory follow-up** based on incident findings and implications.  4. **Creating problems from incidents:**      A **problem record** is created from incidents when:    - There is an **unknown root cause** that requires further investigation.    - The incident is **recurring**, indicating a need for deeper analysis to prevent future reoccurrences.    - For **major incidents**, creating a problem record is typically mandatory to ensure proactive management of the underlying issues.  5. **Tracking corrective actions:**      Corrective actions are tracked comprehensively:    - Each corrective action has an **assigned owner** responsible for its implementation.    - **Due dates** are established to ensure timely progress toward resolution.    - Actions may have **risk ratings** to evaluate their impact and urgency.    - They are monitored through various **statuses** (e.g., open, in progress, implemented, verified, closed) to ensure accountability.    - **Executive oversight** may be involved for significant corrective actions, particularly those affecting high-priority services or business functions.  6. **Closure rules:**      There are specific rules for closure:    - An **incident cannot be closed** until the timeline and evidence of the incident are fully documented and complete.    - The **post-incident review cannot be closed** until all identified actions have been assigned and an implementation plan is in place.    - This ensures that we maintain thoroughness in our reviews and learnings are enacted promptly.  With this structured approach to post-incident reviews and problem management, we aim to improve our operational resilience and enhance our incident response capabilities. If you want to explore this area further or move on to another topic, just let me know!

### Turn 11 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  PostIncidentReview:\n    meaning: Review held after qualifying incidents to assess response, document findings, and identify improvements.\n    aliases: [post-incident review, PIR]\n    properties:\n      reviewStatus:\n        type: text\n        allowed: [Open, In progress, Actions assigned, Implementation plan in place, Closed]\n  ProblemRecord:\n    meaning: Record created to investigate unknown root cause, recurring incidents, or mandatory underlying issue management after a major incident.\n    aliases: [problem record, problem]\n    properties:\n      rootCauseKnown:\n        type: boolean\n      recurring:\n        type: boolean\n      problemStatus:\n        type: text\n        allowed: [Open, In progress, Root cause identified, Corrective actions assigned, Resolved, Closed]\n  RiskComplianceRepresentative:\n    meaning: Role that evaluates regulatory implications and compliance adherence during post-incident review.\n    aliases: [risk/compliance representative, risk representative, compliance representative]\n  RootCauseAnalysis:\n    meaning: Analysis identifying the underlying cause of an incident or problem.\n    aliases: [root cause analysis, RCA]\n  ContributingFactor:\n    meaning: Factor that contributed to an incident occurring or worsening.\n    aliases: [contributing factor]\n  ControlGap:\n    meaning: Missing or ineffective control that allowed an incident to occur or worsen.\n    aliases: [control gap]\n  LessonLearned:\n    meaning: Documented learning from incident response intended to improve future operational resilience and response capability.\n    aliases: [lesson learned]\n  CorrectiveAction:\n    meaning: Action proposed or assigned to prevent incident recurrence or address a control gap.\n    aliases: [corrective action, remedial action]\n    properties:\n      dueDate:\n        type: date\n      riskRating:\n        type: text\n      actionStatus:\n        type: text\n        allowed: [Open, In progress, Implemented, Verified, Closed]\n      executiveOversight:\n        type: boolean\n  ActionOwner:\n    meaning: Person or role assigned responsibility for implementing a corrective action.\n    aliases: [assigned owner, action owner]\n  ImplementationPlan:\n    meaning: Plan describing the steps for executing an emergency change or implementing corrective actions.\n    aliases: [implementation plan]\n  RegulatoryFollowUp:\n    meaning: Follow-up activity with regulators based on post-incident findings and regulatory implications.\n    aliases: [regulatory follow-up]\nrelationships:\n  - name: hasPostIncidentReview\n    from: Incident\n    to: PostIncidentReview\n    meaning: A qualifying incident has a post-incident review.\n  - name: owns\n    from: IncidentCommander\n    to: PostIncidentReview\n    meaning: The incident commander typically owns the post-incident review process.\n  - name: participatesIn\n    from: ProblemManager\n    to: PostIncidentReview\n    meaning: The problem manager participates in post-incident review and contributes to root cause identification.\n  - name: participatesIn\n    from: ServiceOwner\n    to: PostIncidentReview\n    meaning: The service owner participates in post-incident review and provides affected-service and operational impact insight.\n  - name: participatesIn\n    from: TechnicalLead\n    to: PostIncidentReview\n    meaning: The technical lead participates in post-incident review and provides technical perspective on resolution and system behavior.\n  - name: participatesIn\n    from: BusinessLead\n    to: PostIncidentReview\n    meaning: The business lead participates in post-incident review and ensures business implications are considered.\n  - name: participatesIn\n    from: RiskComplianceRepresentative\n    to: PostIncidentReview\n    meaning: The risk/compliance representative participates in post-incident review to evaluate regulatory implications and compliance adherence.\n  - name: participatesIn\n    from: VendorManager\n    to: PostIncidentReview\n    meaning: The vendor manager participates in post-incident review when third-party services were factors in the incident.\n  - name: produces\n    from: PostIncidentReview\n    to: RootCauseAnalysis\n    meaning: A post-incident review produces root cause analysis.\n  - name: identifies\n    from: PostIncidentReview\n    to: ContributingFactor\n    meaning: A post-incident review identifies contributing factors.\n  - name: identifies\n    from: PostIncidentReview\n    to: ControlGap\n    meaning: A post-incident review identifies control gaps.\n  - name: documents\n    from: PostIncidentReview\n    to: LessonLearned\n    meaning: A post-incident review documents lessons learned.\n  - name: proposes\n    from: PostIncidentReview\n    to: CorrectiveAction\n    meaning: A post-incident review proposes corrective actions to prevent recurrence.\n  - name: records\n    from: PostIncidentReview\n    to: ResidualRiskAcceptance\n    meaning: A post-incident review records risk acceptance discussions when not all risks can be mitigated.\n  - name: requires\n    from: PostIncidentReview\n    to: RegulatoryFollowUp\n    meaning: A post-incident review may require regulatory follow-up based on findings and implications.\n  - name: creates\n    from: Incident\n    to: ProblemRecord\n    meaning: An incident creates a problem record when root cause is unknown, recurrence is evident, or major-incident governance requires it.\n  - name: investigates\n    from: ProblemManager\n    to: ProblemRecord\n    meaning: The problem manager oversees root cause investigation for the problem record.\n  - name: assignedTo\n    from: CorrectiveAction\n    to: ActionOwner\n    meaning: Each corrective action is assigned to an owner responsible for implementation.\n  - name: hasImplementationPlan\n    from: CorrectiveAction\n    to: ImplementationPlan\n    meaning: A corrective action has an implementation plan before the post-incident review can close.\n  - name: oversees\n    from: ExecutiveSponsor\n    to: CorrectiveAction\n    meaning: The executive sponsor may provide oversight for significant corrective actions affecting high-priority services or business functions.\nrules:\n  postIncidentReviewRequiredCriteria:\n    conditions:\n      - Post-incident review is required for all incidents with majorIncidentDeclared true.\n      - Post-incident review is required for Sev 1 or Sev 2 incidents with substantial customer impact or significant operational response.\n      - Post-incident review is required for regulatory incidents with compliance obligations.\n      - Post-incident review is required for repeat incidents where unresolved issues reoccur.\n  problemRecordCreationCriteria:\n    conditions:\n      - A problem record is created when root cause is unknown and requires further investigation.\n      - A problem record is created when an incident is recurring.\n      - A problem record is typically mandatory for major incidents.\n  correctiveActionTrackingCriteria:\n    conditions:\n      - Each corrective action has an assigned owner.\n      - Each corrective action has a due date.\n      - Corrective actions may have risk ratings to evaluate impact and urgency.\n      - Corrective actions are tracked through Open, In progress, Implemented, Verified, and Closed statuses.\n      - Significant corrective actions affecting high-priority services or business functions may require executive oversight.\n  incidentClosureCriteria:\n    conditions:\n      - An incident cannot be closed until the incident timeline is fully documented and complete.\n      - An incident cannot be closed until evidence is fully documented and complete.\n  postIncidentReviewClosureCriteria:\n    conditions:\n      - A post-incident review cannot be closed until all identified actions have been assigned.\n      - A post-incident review cannot be closed until an implementation plan is in place.\nactions:\n  conductPostIncidentReview:\n    input: Incident\n    preconditions: [postIncidentReviewRequiredCriteria]\n  createProblemRecord:\n    input: Incident\n    preconditions: [problemRecordCreationCriteria]\n  trackCorrectiveAction:\n    input: CorrectiveAction\n    preconditions: [correctiveActionTrackingCriteria]\n  closeIncident:\n    input: Incident\n    preconditions: [incidentClosureCriteria]\n  closePostIncidentReview:\n    input: PostIncidentReview\n    preconditions: [postIncidentReviewClosureCriteria]"
}
```

### Turn 11 — tool

Applied. Added 40, updated 1 existing item(s).

### Turn 11 — assistant

Thanks — I’ve added the post-incident review and problem-management model.

Captured:

- **Post-Incident Review / PIR** is required for:
  - all major incidents
  - Sev 1 or Sev 2 incidents with substantial customer impact or significant operational response
  - regulatory incidents
  - repeat incidents

- **Incident Commander** typically owns the PIR.

- PIR participants can include:
  - Problem Manager
  - Service Owner
  - Technical Lead
  - Business Lead
  - Risk/Compliance Representative
  - Vendor Manager

- PIR outputs include:
  - Root Cause Analysis
  - Contributing Factors
  - Control Gaps
  - Lessons Learned
  - Corrective Actions
  - Residual Risk Acceptance records
  - Regulatory Follow-up

- **Problem Record** is created when:
  - root cause is unknown
  - incident is recurring
  - incident is a major incident, where problem creation is typically mandatory

- **Corrective Actions** track:
  - assigned owner
  - due date
  - risk rating
  - status: Open, In progress, Implemented, Verified, Closed
  - executive oversight where significant

- Closure rules:
  - Incident cannot close until timeline and evidence are complete.
  - PIR cannot close until actions are assigned and an implementation plan is in place.

We’ve now covered most of the core governance lifecycle: service/dependency model, detection/classification, command/decision rights, recovery/emergency change, evidence/audit, communications/regulatory reporting, and PIR/problem management.

One final area that may be important for a bank governance model is **preparedness and controls**.

Could you briefly describe whether you track any of the following?

1. **Major incident playbooks or runbooks**  
   Are there predefined response procedures by service, scenario, or severity?

2. **Operational resilience testing / exercises**  
   Do you run tabletop exercises, failover tests, cyber simulations, or regulatory scenario tests?

3. **Control obligations or policy requirements**  
   For example: evidence completeness, communication cadence, escalation timeframes, RTO/RPO compliance, DR test frequency.

4. **Metrics and reporting**  
   What do you report to governance committees?  
   Examples: incident count by severity, time to detect, time to restore, SLA/RTO breach, repeat incidents, overdue corrective actions, regulatory notifications.

5. **Governance forums**  
   Are there committees or boards that oversee incident trends, resilience risks, corrective-action closure, and regulatory themes?

### Turn 12 — user

I'm glad to provide an overview of our preparedness and controls within our governance model. Here's how we handle these areas:  1. **Major incident playbooks or runbooks:**      Yes, we maintain predefined **response procedures** in the form of playbooks and runbooks. These documents outline specific actions to be taken based on different services, scenarios, and severity levels. They provide step-by-step guidance for incident handlers, ensuring a consistent and efficient response to known types of incidents.  2. **Operational resilience testing/exercises:**      We conduct various **operational resilience testing and exercises** to ensure preparedness:    - **Tabletop Exercises:** These are discussions around hypothetical scenarios to evaluate response strategies and team readiness.    - **Failover Tests:** Regularly scheduled tests to validate our disaster recovery readiness and the effectiveness of failover procedures.    - **Cyber Simulations:** Tests designed to assess our response to cyber incidents and ensure that security measures are effective.    - **Regulatory Scenario Tests:** Exercises that reflect potential regulatory challenges, ensuring that we are prepared to meet compliance obligations.  3. **Control obligations or policy requirements:**      Yes, we have established **control obligations and policy requirements** that include:    - Completeness of evidence collected during incidents.    - The cadence of communication updates throughout the incident lifecycle.    - Defined escalation timeframes for incidents based on severity and impact.    - Compliance with RTO (Recovery Time Objective) and RPO (Recovery Point Objective) targets for critical services.    - Frequency of disaster recovery testing to validate our recovery capabilities.  4. **Metrics and reporting:**      Metrics reported to governance committees typically include:    - Incident counts categorized by severity (e.g., Sev 1, Sev 2).    - **Time to detect** incidents and how long they remained unresolved.    - **Time to restore** services post-incident.    - Any SLA or RTO breaches that occurred during incidents.    - Data on **repeat incidents** to identify areas needing improvement.    - Status of **overdue corrective actions** from previous incidents.    - Updates on **regulatory notifications** submitted and their status.  5. **Governance forums:**      We have established various **committees and boards** to oversee:    - Trends in incident occurrences and their patterns.    - Risks to operational resilience, including assessments of current vulnerabilities.    - Closure of corrective actions resulting from post-incident reviews and problems identified.    - Themes relating to regulatory compliance and oversight, ensuring we remain aligned with legal requirements and best practices.  This framework helps ensure our preparedness and response capabilities are continuously improving and aligned with both operational needs and regulatory expectations. If you'd like to explore any of these areas further or have other topics in mind, let me know!

### Turn 12 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Playbook:\n    meaning: Predefined response procedure outlining actions for incident handlers based on service, scenario, or severity.\n    aliases: [playbook, response procedure]\n    properties:\n      scenario:\n        type: text\n      severityLevel:\n        type: text\n        allowed: [Sev 1 Critical, Sev 2 High, Sev 3 Medium, Sev 4 Low]\n  Runbook:\n    meaning: Step-by-step operational procedure used to execute a consistent incident response for known incident types.\n    aliases: [runbook]\n    properties:\n      scenario:\n        type: text\n      severityLevel:\n        type: text\n        allowed: [Sev 1 Critical, Sev 2 High, Sev 3 Medium, Sev 4 Low]\n  OperationalResilienceExercise:\n    meaning: Preparedness exercise used to test operational resilience response strategies, readiness, and compliance obligations.\n    aliases: [operational resilience testing, operational resilience exercise]\n    properties:\n      exerciseType:\n        type: text\n        allowed: [Tabletop Exercise, Failover Test, Cyber Simulation, Regulatory Scenario Test]\n      exerciseDate:\n        type: date\n  ControlObligation:\n    meaning: Policy or control requirement governing incident response, escalation, evidence, communications, recovery, or testing.\n    aliases: [control obligation, policy requirement]\n    properties:\n      obligationType:\n        type: text\n        allowed: [evidence completeness, communication cadence, escalation timeframe, RTO compliance, RPO compliance, disaster recovery test frequency]\n      requiredCadence:\n        type: text\n  RecoveryPointObjective:\n    meaning: Target maximum tolerable data loss for a service or application.\n    aliases: [Recovery Point Objective, RPO]\n    properties:\n      recoveryPointObjective:\n        type: number\n        unit: hours\n  GovernanceMetric:\n    meaning: Metric reported to governance committees to monitor incident performance, resilience, regulatory activity, and corrective-action management.\n    aliases: [metric, reporting metric]\n    properties:\n      metricType:\n        type: text\n        allowed: [incident count by severity, time to detect, time unresolved, time to restore, SLA breach, RTO breach, repeat incidents, overdue corrective actions, regulatory notification status]\n      metricValue:\n        type: number\n  GovernanceForum:\n    meaning: Committee or board overseeing incident trends, operational resilience risks, corrective-action closure, and regulatory themes.\n    aliases: [governance forum, committee, board]\n    properties:\n      forumFocus:\n        type: text\n        allowed: [incident trends, operational resilience risks, corrective-action closure, regulatory themes]\nrelationships:\n  - name: guidedBy\n    from: Incident\n    to: Playbook\n    meaning: Incident response may be guided by a playbook selected by service, scenario, or severity.\n  - name: guidedBy\n    from: Incident\n    to: Runbook\n    meaning: Incident handlers may use a runbook for step-by-step response to known incident types.\n  - name: appliesTo\n    from: Playbook\n    to: BusinessService\n    meaning: A playbook may apply to a specific business service.\n  - name: appliesTo\n    from: Playbook\n    to: ITService\n    meaning: A playbook may apply to a specific IT service.\n  - name: appliesTo\n    from: Runbook\n    to: Application\n    meaning: A runbook may apply to a specific application or known technical scenario.\n  - name: validates\n    from: OperationalResilienceExercise\n    to: Playbook\n    meaning: Operational resilience exercises validate readiness and response strategies described in playbooks.\n  - name: validates\n    from: OperationalResilienceExercise\n    to: DisasterRecovery\n    meaning: Failover tests validate disaster recovery readiness and effectiveness of failover procedures.\n  - name: tests\n    from: OperationalResilienceExercise\n    to: CyberResponse\n    meaning: Cyber simulations test response to cyber incidents and effectiveness of security measures.\n  - name: tests\n    from: OperationalResilienceExercise\n    to: RegulatoryNotification\n    meaning: Regulatory scenario tests exercise preparedness for regulatory challenges and compliance obligations.\n  - name: governs\n    from: ControlObligation\n    to: IncidentEvidence\n    meaning: Evidence completeness obligations govern incident evidence collection.\n  - name: governs\n    from: ControlObligation\n    to: Communication\n    meaning: Communication cadence obligations govern incident communication updates.\n  - name: governs\n    from: ControlObligation\n    to: Incident\n    meaning: Escalation timeframe obligations govern incident escalation based on severity and impact.\n  - name: governs\n    from: ControlObligation\n    to: BusinessService\n    meaning: RTO and RPO obligations govern critical business services.\n  - name: governs\n    from: ControlObligation\n    to: DisasterRecovery\n    meaning: Disaster recovery test-frequency obligations govern recovery capability validation.\n  - name: hasRecoveryPointObjective\n    from: BusinessService\n    to: RecoveryPointObjective\n    meaning: A business service may have an RPO target for maximum tolerable data loss.\n  - name: hasRecoveryPointObjective\n    from: ITService\n    to: RecoveryPointObjective\n    meaning: An IT service may have an RPO target for maximum tolerable data loss.\n  - name: hasRecoveryPointObjective\n    from: Application\n    to: RecoveryPointObjective\n    meaning: An application may have an RPO target for maximum tolerable data loss.\n  - name: reports\n    from: GovernanceForum\n    to: GovernanceMetric\n    meaning: Governance forums receive and review metrics on incidents, resilience, corrective actions, and regulatory notifications.\n  - name: oversees\n    from: GovernanceForum\n    to: CorrectiveAction\n    meaning: Governance forums oversee closure of corrective actions from post-incident reviews and problem records.\n  - name: oversees\n    from: GovernanceForum\n    to: Incident\n    meaning: Governance forums oversee incident trends and patterns.\n  - name: oversees\n    from: GovernanceForum\n    to: OperationalResilienceThreshold\n    meaning: Governance forums oversee operational resilience risks and vulnerabilities.\n  - name: oversees\n    from: GovernanceForum\n    to: RegulatoryFollowUp\n    meaning: Governance forums oversee regulatory themes and follow-up activity.\nrules:\n  playbookRunbookUsageCriteria:\n    conditions:\n      - Playbooks and runbooks provide predefined response procedures by service, scenario, and severity level.\n      - Incident handlers use playbooks and runbooks to ensure consistent and efficient response to known incident types.\n  operationalResilienceExerciseCriteria:\n    conditions:\n      - Tabletop exercises evaluate response strategies and team readiness using hypothetical scenarios.\n      - Failover tests validate disaster recovery readiness and failover procedures.\n      - Cyber simulations assess cyber incident response and security measure effectiveness.\n      - Regulatory scenario tests test readiness to meet compliance obligations.\n  controlObligationCriteria:\n    conditions:\n      - Control obligations cover evidence completeness, communication update cadence, escalation timeframes, RTO and RPO compliance, and disaster recovery test frequency.\n  governanceReportingCriteria:\n    conditions:\n      - Governance committee reporting includes incident count by severity, time to detect, time unresolved, time to restore, SLA or RTO breaches, repeat incidents, overdue corrective actions, and regulatory notification status.\n  governanceForumOversightCriteria:\n    conditions:\n      - Governance forums oversee incident trends and patterns.\n      - Governance forums oversee operational resilience risks and vulnerabilities.\n      - Governance forums oversee corrective-action closure.\n      - Governance forums oversee regulatory compliance themes and follow-up.\nactions:\n  usePlaybook:\n    input: Incident\n    preconditions: [playbookRunbookUsageCriteria]\n  conductOperationalResilienceExercise:\n    input: OperationalResilienceExercise\n    preconditions: [operationalResilienceExerciseCriteria]\n  reportGovernanceMetrics:\n    input: GovernanceForum\n    preconditions: [governanceReportingCriteria]\n  overseeGovernanceControls:\n    input: GovernanceForum\n    preconditions: [governanceForumOversightCriteria]"
}
```

### Turn 12 — tool

Applied. Added 38, updated 0 existing item(s).

### Turn 12 — assistant

Thank you — I’ve captured the preparedness, controls, testing, metrics, and governance oversight layer.

The domain model now covers the main operating model for bank IT operations governance and major-incident management:

- Service and dependency structure
- Incident detection and classification
- Major-incident declaration and command
- Decision ownership
- Emergency change, workaround, recovery, DR, failover, and isolation
- Evidence, audit record, and retention
- Communications and regulatory reporting
- Post-incident review, problem management, corrective actions, and lessons learned
- Playbooks, runbooks, resilience exercises, control obligations, metrics, and governance forums

Latest additions include:

- **Playbook** and **Runbook**
  - selected by service, scenario, and severity
  - used to guide consistent incident response

- **Operational Resilience Exercise**
  - Tabletop Exercise
  - Failover Test
  - Cyber Simulation
  - Regulatory Scenario Test

- **Control Obligation**
  - evidence completeness
  - communication cadence
  - escalation timeframe
  - RTO compliance
  - RPO compliance
  - disaster recovery test frequency

- **Recovery Point Objective / RPO**
  - linked to Business Services, IT Services, and Applications

- **Governance Metric**
  - incident count by severity
  - time to detect
  - time unresolved
  - time to restore
  - SLA breach
  - RTO breach
  - repeat incidents
  - overdue corrective actions
  - regulatory notification status

- **Governance Forum**
  - oversees incident trends
  - operational resilience risks
  - corrective-action closure
  - regulatory themes and follow-up

At this point, I believe the interview has covered the core domain needed for a compact governance and major-incident management model.

The only remaining refinements I’d suggest, if you want to go deeper later, would be:

1. Exact regulatory reporting deadlines by jurisdiction or regulator.
2. Exact escalation thresholds by criticality tier and service type.
3. Named governance forums and committee reporting cadence.
4. Specific RTO/RPO values for key service tiers.
5. Mapping of communication channels to approval paths.

Otherwise, the current model is coherent and complete enough to support decision-making, workflow design, reporting, and governance analysis.
