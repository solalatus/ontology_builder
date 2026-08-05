# Ontology-recovery eval — raw tool-call transparency log

Exact API-level messages (real tool_calls arguments, real tool result content) captured from `window.__kg.agent.state.apiMessages` after every turn -- ground truth for what the interviewer actually sent and received, independent of its own narration in conversation-log.md or the LLM review's summary of it.
Last updated: 2026-08-05T09:52:33.205Z

### Turn 1 — user

I lead IT operations governance and major-incident management for the bank. I can walk you through how we structure services and technical dependencies, how we detect and manage incidents, who owns decisions, how recovery and emergency changes work, and how we handle evidence, communications, reviews, and regulatory-reporting workflows. Where would you like to start?

### Turn 1 — assistant

Great. Let’s start with the core operating model: **services and technical dependencies**, because that usually anchors incident severity, ownership, recovery decisions, communications, and reporting.

To model this accurately, could you describe:

1. What is the main business-facing unit you govern — do you call it a **Service**, **Business Service**, **Application Service**, **Product**, or something else?
2. What technical components sit underneath it — e.g. **Applications**, **Platforms**, **Infrastructure Components**, **Third Parties**, **Data Stores**, **Networks**?
3. How do you represent dependency direction? For example: does a business service *depend on* an application, which *depends on* a database/provider/network?
4. Which properties are decision-relevant for these objects — e.g. criticality/tier, customer impact tolerance, RTO/RPO, owner, regulatory status, region, support hours?

Once I understand that backbone, I’ll add it to the model and then we can layer incidents and governance on top.
Great. Let’s start with the core operating model: **services and technical dependencies**, because that usually anchors incident severity, ownership, recovery decisions, communications, and reporting.

To model this accurately, could you describe:

1. What is the main business-facing unit you govern — do you call it a **Service**, **Business Service**, **Application Service**, **Product**, or something else?
2. What technical components sit underneath it — e.g. **Applications**, **Platforms**, **Infrastructure Components**, **Third Parties**, **Data Stores**, **Networks**?
3. How do you represent dependency direction? For example: does a business service *depend on* an application, which *depends on* a database/provider/network?
4. Which properties are decision-relevant for these objects — e.g. criticality/tier, customer impact tolerance, RTO/RPO, owner, regulatory status, region, support hours?

Once I understand that backbone, I’ll add it to the model and then we can layer incidents and governance on top.

### Turn 2 — user

Absolutely, let's walk through these foundational aspects of our operating model.  1. The main business-facing unit we govern is referred to as a **Business Service**. This represents any customer- or business-facing capability delivered by the bank, such as payment processing or loan origination services.  2. Underneath these Business Services, we rely on various technical components, including:    - **Applications** that implement the functionality of the business services.    - **Databases** where data is stored and accessed by the applications.    - **Infrastructure Components** such as servers, network devices, and storage systems that support the applications.    - **Third-party Services** that we may depend on for certain functionalities, like external payment gateways or compliance services.  3. The dependency direction is typically represented as follows: a **Business Service** relies on an **IT Service**, which in turn may depend on various **Applications**, and those applications may further rely on **Databases** or **Infrastructure Components**. For instance, a business service like "Online Banking" depends on an IT Service that leverages several applications, each of which accesses data from a database and operates on a network infrastructure.  4. Decision-relevant properties for these objects include:    - **Criticality/Tier**: This assesses the importance of the service for business operations and helps prioritize recovery efforts.    - **Owner**: The accountable role (service owner, application owner) responsible for the service's oversight.    - **Regulatory Status**: Understanding any compliance obligations that may apply.    - **RTO (Recovery Time Objective)** and **RPO (Recovery Point Objective)**: These define acceptable downtime and data loss metrics for recovery planning.    - **Customer Impact Tolerance**: This outlines how critical a failure would be from the customer's perspective, influencing urgency in incident response.    - **Support Hours**: Indicates the times during which support is available for critical services.    - **Region**: This can be relevant for services that may be hosted or regulated differently depending on geographic location.  With this backbone established, we can certainly layer incidents and governance on top to enhance the model. What would you like to explore next?

### Turn 2 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Business Service:\n    description: Customer- or business-facing capability delivered by the bank, such as payment processing, online banking, or loan origination.\n    properties:\n      criticality/tier:\n        description: Importance of the service for business operations; used to prioritize recovery and response.\n      regulatory status:\n        description: Compliance obligations that apply to the service.\n      RTO:\n        description: Recovery Time Objective; acceptable downtime for recovery planning.\n      RPO:\n        description: Recovery Point Objective; acceptable data loss for recovery planning.\n      customer impact tolerance:\n        description: Acceptable level or duration of customer impact before escalation or urgent action is required.\n      support hours:\n        description: Times during which support is available.\n      region:\n        description: Geographic region relevant to hosting, operation, or regulation.\n  IT Service:\n    description: Technology-facing service that supports one or more Business Services.\n    properties:\n      criticality/tier:\n        description: Importance of the IT Service for business operations and recovery prioritization.\n      regulatory status:\n        description: Compliance obligations that apply to the IT Service.\n      RTO:\n        description: Recovery Time Objective.\n      RPO:\n        description: Recovery Point Objective.\n      support hours:\n        description: Times during which support is available.\n      region:\n        description: Geographic region relevant to hosting, operation, or regulation.\n  Application:\n    description: Software application that implements functionality used by an IT Service or Business Service.\n    properties:\n      criticality/tier:\n        description: Importance of the application for business operations and recovery prioritization.\n      regulatory status:\n        description: Compliance obligations that apply to the application.\n      RTO:\n        description: Recovery Time Objective.\n      RPO:\n        description: Recovery Point Objective.\n      support hours:\n        description: Times during which support is available.\n      region:\n        description: Geographic region relevant to hosting, operation, or regulation.\n  Database:\n    description: Data store accessed by applications.\n    properties:\n      criticality/tier:\n        description: Importance of the database for business operations and recovery prioritization.\n      regulatory status:\n        description: Compliance obligations that apply to the database.\n      RTO:\n        description: Recovery Time Objective.\n      RPO:\n        description: Recovery Point Objective.\n      region:\n        description: Geographic region relevant to hosting, operation, or regulation.\n  Infrastructure Component:\n    description: Technical infrastructure such as servers, network devices, and storage systems that support applications.\n    properties:\n      criticality/tier:\n        description: Importance of the infrastructure component for business operations and recovery prioritization.\n      support hours:\n        description: Times during which support is available.\n      region:\n        description: Geographic region relevant to hosting, operation, or regulation.\n  Third-party Service:\n    description: External service the bank depends on for functionality such as payment gateways or compliance services.\n    properties:\n      criticality/tier:\n        description: Importance of the third-party service for business operations and recovery prioritization.\n      regulatory status:\n        description: Compliance obligations associated with the third-party dependency.\n      RTO:\n        description: Recovery Time Objective or contractual recovery expectation where applicable.\n      RPO:\n        description: Recovery Point Objective or contractual data-loss expectation where applicable.\n      support hours:\n        description: Times during which support is available from the third party.\n      region:\n        description: Geographic region relevant to service provision or regulation.\n  Owner:\n    description: Accountable role responsible for oversight of a service or component, such as a service owner or application owner.\nrelationships:\n  relies on:\n    from: Business Service\n    to: IT Service\n    description: A Business Service relies on an IT Service to deliver its capability.\n  depends on application:\n    from: IT Service\n    to: Application\n    description: An IT Service depends on one or more Applications.\n  accesses:\n    from: Application\n    to: Database\n    description: An Application accesses data from a Database.\n  operates on:\n    from: Application\n    to: Infrastructure Component\n    description: An Application operates on supporting Infrastructure Components such as compute, network, or storage.\n  depends on third-party service:\n    from: IT Service\n    to: Third-party Service\n    description: An IT Service depends on an external Third-party Service for part of its functionality.\n  owned by:\n    from: Business Service\n    to: Owner\n    description: A Business Service is accountable to an Owner.\n  IT service owned by:\n    from: IT Service\n    to: Owner\n    description: An IT Service is accountable to an Owner.\n  application owned by:\n    from: Application\n    to: Owner\n    description: An Application is accountable to an Owner."
}
```

### Turn 2 — tool

Applied. Added 7, updated 0 existing item(s).

### Turn 2 — assistant

Thanks — I’ve captured the foundational service/dependency structure:

- **Business Service** relies on **IT Service**
- **IT Service** depends on **Application** and may depend on **Third-party Service**
- **Application** accesses **Database** and operates on **Infrastructure Component**
- Ownership is modeled through accountable **Owner** roles
- Decision-relevant properties include criticality/tier, regulatory status, RTO, RPO, customer impact tolerance, support hours, and region

Next, I’d like to layer on **major-incident detection and classification**, since that usually drives escalation, decision authority, communications, emergency change, and regulatory workflows.

Could you walk me through:

1. What do you call an incident record — **Incident**, **Major Incident**, **Event**, **Alert**, something else?
2. How does detection happen — monitoring alert, customer report, business report, third-party notification, control failure, etc.?
3. What criteria make something a **Major Incident**?
   - customer impact?
   - critical service affected?
   - duration?
   - regulatory threshold?
   - data integrity or security concern?
4. What severity levels do you use, and what properties matter for triage — e.g. severity, status, start time, detected time, affected service, impact scope, current workaround, suspected root cause?
5. Is there a formal role such as **Incident Commander**, **Major Incident Manager**, **Service Owner**, or **Technical Lead** that takes charge?

### Turn 3 — user

Great, let's dive into the incident detection and classification layer.  1. We refer to an incident record simply as an **Incident**. When it meets certain criteria and requires enhanced coordination and communication, we classify it as a **Major Incident**. The distinction helps us focus our response efforts appropriately.  2. Detection of incidents can happen through various channels, including:    - **Alerts** generated by monitoring tools that track system performance and technology health.    - **User reports**, where customers or business staff notify us of issues.    - **Business reports**, often where business units notice disruptions in service delivery.    - **Third-party notifications**, especially from vendors or partners who may identify issues on their services linked to ours.    - **Control failures**, where automated systems designed to catch anomalies fail to perform, indicating a potential incident.  3. Criteria for declaring a **Major Incident** generally includes:    - Significant **customer impact**, meaning a substantial number of users are affected.    - **Critical services affected**, especially services tied to regulatory compliance or high-revenue generation.    - An expected disruption **duration** that will exceed our recovery targets, meaning it could severely impact operability.    - **Regulatory thresholds**, where a particular incident might trigger mandatory reporting obligations.    - Any **data integrity or security concerns**, where sensitive data may be compromised or where security measures have failed.  4. Our severity levels span from critical to low, including:    - **Sev1-Critical**    - **Sev2-High**    - **Sev3-Medium**    - **Sev4-Low**     Important properties for triage include:    - **Severity**: To prioritize incidents.    - **Status**: Which tracks the lifecycle as incidents progress through investigation, containment, recovery, etc.    - **Start time**: When the incident was detected or reported.    - **Detected time**: When we became aware of the incident through any detection mechanism.    - **Affected service**: Understanding which specific business service or IT service is impacted.    - **Impact scope**: The extent of the effect, such as enterprise-wide or limited to specific users.    - **Current workaround**: If any temporary measures are in place to mitigate the issue.    - **Suspected root cause**: Early insights that help focus investigation and resolution efforts.  5. Our formal role for managing major incidents is an **Incident Commander**. This person is responsible for making critical decisions, coordinating the response among resolver groups, and ensuring proper communication with stakeholders. Other roles participate in the process, such as Service Owners and Technical Leads, but the Incident Commander takes charge during such events and oversees the incident from declaration to resolution.  This gives us a robust framework for incident detection and classification, aligned with our operational needs. What aspect would you like to explore further, or do you have any follow-up questions?

### Turn 3 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    description: Record of a disruption or issue affecting services or technology; may be classified as a Major Incident when enhanced coordination and communication are required.\n    properties:\n      severity:\n        description: Priority level for response and triage, such as Sev1-Critical, Sev2-High, Sev3-Medium, or Sev4-Low.\n      status:\n        description: Lifecycle state as the incident progresses through investigation, containment, recovery, and resolution.\n      start time:\n        description: When the incident began or was first reported as starting.\n      detected time:\n        description: When IT operations became aware of the incident through a detection mechanism.\n      impact scope:\n        description: Extent of impact, such as enterprise-wide or limited to specific users.\n      current workaround:\n        description: Temporary measure in place to mitigate the issue while recovery continues.\n      suspected root cause:\n        description: Early view of the likely cause used to focus investigation and resolution.\n  Major Incident:\n    description: Classification for an Incident that requires enhanced coordination, decision-making, and communication.\n    properties:\n      customer impact:\n        description: Degree to which customers or users are affected; significant impact may justify major-incident declaration.\n      expected disruption duration:\n        description: Expected duration of disruption, especially whether it may exceed recovery targets.\n      regulatory threshold met:\n        description: Whether the incident meets a threshold that may trigger mandatory regulatory reporting.\n      data integrity or security concern:\n        description: Whether sensitive data may be compromised, data integrity is at risk, or security measures have failed.\n  Detection Channel:\n    description: Source or mechanism through which an Incident is detected, such as Alerts, user reports, business reports, third-party notifications, or control failures.\n    properties:\n      channel type:\n        description: Detection route, such as Alert, user report, business report, third-party notification, or control failure.\n  Incident Commander:\n    description: Formal role responsible for taking charge of a Major Incident, making critical decisions, coordinating resolver groups, and ensuring stakeholder communication.\n  Technical Lead:\n    description: Role that provides technical leadership and investigation direction during an Incident or Major Incident.\nrelationships:\n  classified as:\n    from: Incident\n    to: Major Incident\n    description: An Incident is classified as a Major Incident when it meets criteria requiring enhanced coordination and communication.\n  detected through:\n    from: Incident\n    to: Detection Channel\n    description: An Incident is detected through a monitoring alert, user report, business report, third-party notification, control failure, or similar channel.\n  affects business service:\n    from: Incident\n    to: Business Service\n    description: An Incident impacts a specific Business Service.\n  affects IT service:\n    from: Incident\n    to: IT Service\n    description: An Incident impacts a specific IT Service.\n  managed by:\n    from: Major Incident\n    to: Incident Commander\n    description: A Major Incident is managed by an Incident Commander from declaration to resolution.\n  supported by technical lead:\n    from: Incident\n    to: Technical Lead\n    description: An Incident is supported by a Technical Lead for technical investigation and resolution direction.\n  service owner participates in:\n    from: Incident\n    to: Owner\n    description: A Service Owner or other accountable Owner participates in incident response decisions for affected services."
}
```

### Turn 3 — tool

Applied. Added 5, updated 0 existing item(s).

### Turn 3 — assistant

Captured. I’ve added the incident layer with:

- **Incident** as the base record
- **Major Incident** as a classification of an Incident
- Detection through a **Detection Channel**
- Incident impact links to **Business Service** and **IT Service**
- **Incident Commander** as the accountable lead for Major Incidents
- **Technical Lead** and **Owner** participation in response

One clarification before we move on: you mentioned both **start time** and **detected time**. Should I treat these as distinct like this?

- **start time** = when the disruption actually began, if known or estimated
- **detected time** = when the bank became aware of it

Or do you use **start time** more as the time the incident was first reported/opened?

Next, I’d like to understand **major-incident governance and decision rights**.

Could you walk me through:

1. Who can **declare** a Major Incident?
   - Incident Commander?
   - Major Incident Manager?
   - Service Owner?
   - Operations command center?
2. Who can **change severity** or declassify a Major Incident?
3. What are the key **decision points** during a Major Incident?
   - declare major incident
   - invoke workaround
   - fail over to DR
   - initiate emergency change
   - notify executives
   - trigger regulatory assessment/reporting
   - declare service restored
4. Do you use formal groups such as a **resolver group**, **crisis team**, **technology command bridge**, **business command bridge**, or **executive stakeholder group**?
5. Are there time-based escalation rules, for example “if Sev1 not contained within X minutes, escalate to executive group”?

### Turn 4 — user

Yes, you’ve captured the distinction between **start time** and **detected time** correctly:  - **Start time** refers to when the disruption actually began, based on our assessment or estimation of the incident. - **Detected time** indicates when the bank became aware of the incident, through alerts or reports.  Now, let’s move on to **major-incident governance and decision rights**.  1. The authority to **declare** a Major Incident typically rests with the **Incident Commander** or an authorized duty manager. These are roles explicitly tasked with managing incidents. In some cases, the **Major Incident Manager** may also have this authority, depending on organizational structure. The **Service Owner** may be consulted, but they do not usually have the unilateral authority to declare a Major Incident unless they are acting as the Incident Commander.  2. The ability to **change severity** or declassify a Major Incident is primarily the responsibility of the **Incident Commander**. However, in certain scenarios, the **Major Incident Manager** can also make these adjustments when they are overseeing the response. Key stakeholders such as the **Service Owner** or **Technical Leads** might provide input, but they typically do not have direct authority over severity changes.  3. Key **decision points** during a Major Incident include:    - **Declare Major Incident**: Initiating the Major Incident process once criteria are met.    - **Invoke Workaround**: Deciding on temporary measures to mitigate the incident impact while the resolution is pursued.    - **Fail Over to DR**: Implementing a disaster recovery plan if the service is critical and cannot be restored in a reasonable time.    - **Initiate Emergency Change**: Acting to apply quick fixes for issues that directly impact the service.    - **Notify Executives**: Providing updates to senior management on the incident status and impact.    - **Trigger Regulatory Assessment/Reporting**: Evaluating whether the incident requires any compliance reporting to regulators based on its nature and impact.    - **Declare Service Restored**: Confirming that services have resumed to an acceptable operational level.  4. We do utilize various formal groups to facilitate governance during a major incident, including:    - **Resolver Groups**: These are specialized teams assigned to address the technical aspects of the incident.    - **Crisis Team**: A group that may be activated for managing high-impact incidents, coordinating both IT and business responses.    - **Technology Command Bridge**: A centralized group focused on the technical resolution of the incident.    - **Business Command Bridge**: Engages business stakeholders to ensure alignment and communication between IT and business services.    - **Executive Stakeholder Group**: Often involved in high-severity incidents to receive updates and provide strategic governance.  5. Yes, we have established **time-based escalation rules**. For example, if a **Sev1-Critical** incident is not resolved or contained within a specified timeframe (like 30 minutes), it triggers an escalation to the **executive group** for review and potential intervention. These rules help ensure timely decision-making and resource allocation during critical incidents.  Let me know if you’d like to explore any of these topics further or if there's another area you would like to layer into the model!

### Turn 4 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Incident:\n    properties:\n      start time:\n        description: When the disruption actually began, based on assessment or estimation.\n      detected time:\n        description: When the bank became aware of the incident through alerts or reports.\n  Major Incident Manager:\n    description: Role that may oversee the Major Incident response and may have authority to declare, change severity, or declassify a Major Incident depending on organizational structure.\n  Duty Manager:\n    description: Authorized duty role explicitly tasked with incident management and able to declare a Major Incident.\n  Decision Point:\n    description: Formal decision made during a Major Incident, such as declaring a Major Incident, invoking a workaround, failing over to DR, initiating an emergency change, notifying executives, triggering regulatory assessment/reporting, or declaring service restored.\n    properties:\n      decision type:\n        description: The type of decision being made.\n      decision status:\n        description: Whether the decision is pending, approved, rejected, executed, or superseded.\n      decision time:\n        description: When the decision was made.\n  Resolver Group:\n    description: Specialized team assigned to address technical aspects of an Incident or Major Incident.\n  Crisis Team:\n    description: Group activated for high-impact incidents to coordinate both IT and business responses.\n  Technology Command Bridge:\n    description: Centralized group focused on technical resolution during a Major Incident.\n  Business Command Bridge:\n    description: Group that engages business stakeholders to align IT response with business service impact and communication needs.\n  Executive Stakeholder Group:\n    description: Senior management group involved in high-severity incidents to receive updates and provide strategic governance.\nrelationships:\n  declared by incident commander:\n    from: Major Incident\n    to: Incident Commander\n    description: A Major Incident may be declared by the Incident Commander when criteria are met.\n  declared by duty manager:\n    from: Major Incident\n    to: Duty Manager\n    description: A Major Incident may be declared by an authorized Duty Manager.\n  declared by major incident manager:\n    from: Major Incident\n    to: Major Incident Manager\n    description: A Major Incident may be declared by a Major Incident Manager depending on organizational structure.\n  severity changed by incident commander:\n    from: Major Incident\n    to: Incident Commander\n    description: The Incident Commander has primary authority to change severity or declassify a Major Incident.\n  severity changed by major incident manager:\n    from: Major Incident\n    to: Major Incident Manager\n    description: A Major Incident Manager may change severity or declassify a Major Incident when overseeing the response.\n  has decision point:\n    from: Major Incident\n    to: Decision Point\n    description: A Major Incident has formal decision points during response and recovery.\n  assigned to resolver group:\n    from: Incident\n    to: Resolver Group\n    description: An Incident is assigned to specialized Resolver Groups for technical investigation and resolution.\n  crisis team activated for:\n    from: Major Incident\n    to: Crisis Team\n    description: A Crisis Team may be activated for high-impact Major Incidents.\n  uses technology command bridge:\n    from: Major Incident\n    to: Technology Command Bridge\n    description: A Major Incident uses a Technology Command Bridge for centralized technical resolution coordination.\n  uses business command bridge:\n    from: Major Incident\n    to: Business Command Bridge\n    description: A Major Incident uses a Business Command Bridge to coordinate with business stakeholders.\n  escalated to executive stakeholder group:\n    from: Major Incident\n    to: Executive Stakeholder Group\n    description: A high-severity or time-breaching Major Incident is escalated to the Executive Stakeholder Group.\nrules:\n  Major Incident declaration authority:\n    description: A Major Incident is declared by the Incident Commander, an authorized Duty Manager, or in some structures the Major Incident Manager; Service Owners and Technical Leads may provide input but do not normally have unilateral declaration authority.\n  Major Incident severity authority:\n    description: Changing severity or declassifying a Major Incident is primarily the Incident Commander's responsibility; the Major Incident Manager may also do so when overseeing the response.\n  Sev1 time-based executive escalation:\n    description: If a Sev1-Critical incident is not resolved or contained within the specified timeframe, for example 30 minutes, it is escalated to the Executive Stakeholder Group for review and potential intervention.\nactions:\n  Declare Major Incident:\n    description: Initiate the Major Incident process once declaration criteria are met.\n  Invoke Workaround:\n    description: Approve temporary measures to mitigate impact while resolution is pursued.\n  Fail Over to DR:\n    description: Implement a disaster recovery plan when a critical service cannot be restored in a reasonable time.\n  Initiate Emergency Change:\n    description: Apply an urgent fix for an issue directly impacting service.\n  Notify Executives:\n    description: Provide senior management with updates on incident status and impact.\n  Trigger Regulatory Assessment/Reporting:\n    description: Evaluate whether the incident requires compliance reporting to regulators and initiate reporting when required.\n  Declare Service Restored:\n    description: Confirm that services have resumed to an acceptable operational level."
}
```

### Turn 4 — tool

Applied. Added 18, updated 1 existing item(s).

### Turn 4 — assistant

Confirmed and added.

I updated **Incident** timing so:

- **start time** = estimated/assessed time the disruption actually began
- **detected time** = when the bank became aware through alerts or reports

I also added the governance layer:

- Declaration authority:
  - **Incident Commander**
  - authorized **Duty Manager**
  - sometimes **Major Incident Manager**
- Severity/declassification authority:
  - primarily **Incident Commander**
  - sometimes **Major Incident Manager**
- Formal **Decision Point** model for major-incident decisions
- Governance groups:
  - **Resolver Group**
  - **Crisis Team**
  - **Technology Command Bridge**
  - **Business Command Bridge**
  - **Executive Stakeholder Group**
- Time-based escalation rule, including the Sev1 30-minute example
- Actions such as **Declare Major Incident**, **Invoke Workaround**, **Fail Over to DR**, **Initiate Emergency Change**, **Notify Executives**, **Trigger Regulatory Assessment/Reporting**, and **Declare Service Restored**

Next, I’d like to cover **recovery, disaster recovery, and emergency changes**, because these are decision-heavy and tied closely to evidence and audit.

Could you explain:

1. What do you call the recovery plan artifacts?
   - **Recovery Plan**
   - **Disaster Recovery Plan**
   - **Runbook**
   - **Service Continuity Plan**
2. How do you decide between:
   - workaround
   - technical fix
   - failover to DR
   - full disaster recovery invocation
3. What are the key properties of a recovery option?
   - expected recovery time
   - risk
   - approval required
   - customer impact
   - data-loss exposure
   - rollback plan
4. How does **Emergency Change** work during a Major Incident?
   - Who can approve it?
   - Is there a retrospective approval?
   - What evidence is required?
5. How do you determine and record that a service is restored?
   - technical recovery complete?
   - business validation?
   - customer validation?
   - monitoring stable for a period?

### Turn 5 — user

Let’s delve into the topic of recovery, disaster recovery, and emergency changes. These are critical areas that impact how we respond to and manage incidents effectively.  1. The artifacts we use for recovery planning include:    - **Recovery Plan**: A detailed document outlining steps to restore an IT service after an incident.    - **Disaster Recovery Plan**: A specific type of recovery plan focusing on restoring operations after a significant disruption or disaster.    - **Runbook**: These are operational procedures that guide technical staff on how to diagnose and resolve specific issues, including recovery.    - **Service Continuity Plan**: Often embodies broader business continuity considerations, ensuring that essential business functions continue during disruptions.  2. The decision-making process between options can include:    - **Workaround**: Used when immediate mitigation is needed to reduce impact (e.g., temporary processes to maintain service).    - **Technical Fix**: Implementation of a software or configuration change to resolve the underlying issue without full restoration.    - **Failover to DR**: Invocation of backup resources or processes when a service is deemed critical and cannot be restored quickly enough.    - **Full Disaster Recovery Invocation**: Engaging comprehensive and structured recovery efforts when the situation extends beyond just one service, usually due to a catastrophic failure.  3. Key properties of a recovery option are:    - **Expected Recovery Time**: Time estimated to restore the service to its operational state.    - **Risk**: Assessment of potential risks associated with the chosen recovery method.    - **Approval Required**: Identification of who must approve the recovery option before implementation.    - **Customer Impact**: Evaluation of how recovery choices may affect customers.    - **Data-Loss Exposure**: Consideration of what data might be lost depending on the recovery option.    - **Rollback Plan**: A predefined method for returning to the original state if the recovery attempt fails.  4. Regarding **Emergency Change** during a Major Incident:    - **Approval**: Typically, emergency changes can be approved by someone with emergency-change authority, which usually includes the **Incident Commander** or authorized members of the **Crisis Team**.    - **Retrospective Approval**: Yes, emergency changes often require retrospective review and approval to ensure proper governance and documentation after they are executed.    - **Evidence Required**: Here, documented evidence such as change requests, implementation records, and post-implementation reviews must be retained to confirm what was changed and the rationale behind it.  5. To determine and record that a service is restored, we look for:    - **Technical Recovery Complete**: Confirmation from the IT teams that systems and infrastructures are operational.    - **Business Validation**: Confirmation from the business or service owners that they can resume operations.    - **Customer Validation**: Feedback from customers that services are functioning as expected, ensuring no lingering issues remain from the incident.    - **Monitoring Stable for a Period**: Ensuring that the service shows stable performance metrics over a defined timeframe, oftentimes through monitoring tools.  This detailed understanding allows us to manage recovery effectively, ensuring we take the right steps during a Major Incident and carefully document our actions for future auditability. Would you like to explore any specific areas further, or is there another section of our operations you want to layer in?

### Turn 5 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Recovery Plan:\n    description: Detailed document outlining steps to restore an IT Service after an Incident.\n    properties:\n      expected recovery time:\n        description: Estimated time to restore the service to its operational state using the plan.\n      risk:\n        description: Assessment of risks associated with the recovery method.\n      approval required:\n        description: Who must approve use of the recovery option before implementation.\n      customer impact:\n        description: How the recovery choice may affect customers.\n      data-loss exposure:\n        description: Data that might be lost depending on the recovery option.\n      rollback plan:\n        description: Predefined method for returning to the prior state if the recovery attempt fails.\n  Disaster Recovery Plan:\n    description: Recovery planning artifact focused on restoring operations after a significant disruption or disaster.\n    properties:\n      expected recovery time:\n        description: Estimated time to restore operations using the disaster recovery approach.\n      risk:\n        description: Assessment of risks associated with invoking disaster recovery.\n      approval required:\n        description: Who must approve disaster recovery invocation.\n      customer impact:\n        description: How disaster recovery choices may affect customers.\n      data-loss exposure:\n        description: Data that might be lost depending on the disaster recovery option.\n      rollback plan:\n        description: Predefined method for returning from the disaster recovery state if needed.\n  Runbook:\n    description: Operational procedure that guides technical staff on how to diagnose and resolve specific issues, including recovery.\n    properties:\n      expected recovery time:\n        description: Estimated time to complete the runbook procedure.\n      risk:\n        description: Risks associated with executing the runbook.\n      approval required:\n        description: Who must approve the runbook execution when approval is needed.\n      rollback plan:\n        description: Method for returning to the prior state if the runbook step fails.\n  Service Continuity Plan:\n    description: Planning artifact that covers broader business continuity considerations to ensure essential business functions continue during disruptions.\n    properties:\n      approval required:\n        description: Who must approve continuity measures.\n      customer impact:\n        description: Expected customer impact under continuity arrangements.\n      risk:\n        description: Risks associated with continuity measures.\n  Recovery Option:\n    description: Option considered during an Incident or Major Incident to mitigate or restore service, such as Workaround, Technical Fix, Failover to DR, or Full Disaster Recovery Invocation.\n    properties:\n      option type:\n        description: Type of recovery option, such as Workaround, Technical Fix, Failover to DR, or Full Disaster Recovery Invocation.\n      expected recovery time:\n        description: Estimated time to restore the service to its operational state.\n      risk:\n        description: Assessment of potential risks associated with the chosen recovery method.\n      approval required:\n        description: Who must approve the recovery option before implementation.\n      customer impact:\n        description: Evaluation of how the recovery choice may affect customers.\n      data-loss exposure:\n        description: What data might be lost depending on the recovery option.\n      rollback plan:\n        description: Predefined method for returning to the original state if the recovery attempt fails.\n  Emergency Change:\n    description: Urgent change applied during a Major Incident to resolve an issue directly impacting service.\n    properties:\n      approval status:\n        description: Whether the emergency change is approved, retrospectively approved, rejected, or pending review.\n      rationale:\n        description: Reason for the change and why emergency handling is justified.\n      implementation record:\n        description: Record of what was implemented during the emergency change.\n      retrospective review required:\n        description: Whether post-execution review and approval are required.\n  Emergency-change Authority:\n    description: Role or group authorized to approve Emergency Changes, usually including the Incident Commander or authorized members of the Crisis Team.\n  Service Restoration:\n    description: Confirmation that a service has resumed to an acceptable operational level after an Incident or Major Incident.\n    properties:\n      technical recovery complete:\n        description: Confirmation from IT teams that systems and infrastructure are operational.\n      business validation:\n        description: Confirmation from the business or Service Owner that operations can resume.\n      customer validation:\n        description: Feedback or evidence that customers experience the service as functioning as expected.\n      monitoring stable period:\n        description: Defined timeframe over which monitoring shows stable performance metrics.\nrelationships:\n  uses recovery plan:\n    from: IT Service\n    to: Recovery Plan\n    description: An IT Service uses a Recovery Plan to restore service after an Incident.\n  uses disaster recovery plan:\n    from: IT Service\n    to: Disaster Recovery Plan\n    description: An IT Service uses a Disaster Recovery Plan for significant disruption or disaster scenarios.\n  uses runbook:\n    from: Application\n    to: Runbook\n    description: An Application uses Runbooks to guide diagnosis, resolution, and recovery steps.\n  supported by service continuity plan:\n    from: Business Service\n    to: Service Continuity Plan\n    description: A Business Service is supported by a Service Continuity Plan to maintain essential business functions during disruption.\n  specializes recovery plan:\n    from: Disaster Recovery Plan\n    to: Recovery Plan\n    description: A Disaster Recovery Plan is treated as a specific kind of Recovery Plan focused on significant disruption or disaster.\n  considers recovery option:\n    from: Major Incident\n    to: Recovery Option\n    description: A Major Incident considers recovery options such as Workaround, Technical Fix, Failover to DR, or Full Disaster Recovery Invocation.\n  initiates emergency change:\n    from: Major Incident\n    to: Emergency Change\n    description: A Major Incident may initiate an Emergency Change to apply an urgent fix.\n  approved by emergency-change authority:\n    from: Emergency Change\n    to: Emergency-change Authority\n    description: An Emergency Change is approved by someone with emergency-change authority.\n  approved by incident commander:\n    from: Emergency Change\n    to: Incident Commander\n    description: An Emergency Change may be approved by the Incident Commander.\n  approved by crisis team:\n    from: Emergency Change\n    to: Crisis Team\n    description: An Emergency Change may be approved by authorized members of the Crisis Team.\n  results in service restoration:\n    from: Major Incident\n    to: Service Restoration\n    description: A Major Incident results in a Service Restoration once the service has resumed to an acceptable operational level.\nrules:\n  Recovery option selection:\n    description: Workaround is used for immediate mitigation, Technical Fix resolves the underlying issue without full restoration, Failover to DR is used when a critical service cannot be restored quickly enough, and Full Disaster Recovery Invocation is used for catastrophic or multi-service disruption.\n  Emergency Change governance:\n    description: Emergency Changes during a Major Incident require approval by emergency-change authority, usually the Incident Commander or authorized Crisis Team members, and often require retrospective review and approval after execution.\n  Service restoration confirmation:\n    description: Service Restoration is recorded when technical recovery is complete, business validation is obtained, customer validation is considered where applicable, and monitoring remains stable for a defined period.\nactions:\n  Execute Technical Fix:\n    description: Implement a software or configuration change to resolve the underlying issue without full restoration.\n  Full Disaster Recovery Invocation:\n    description: Engage comprehensive and structured recovery efforts when disruption extends beyond one service or reflects catastrophic failure.\n  Complete Retrospective Approval:\n    description: Review and approve an Emergency Change after execution to satisfy governance and documentation requirements.\n  Record Service Restoration:\n    description: Document that the service has resumed to an acceptable operational level based on technical recovery, validation, and monitoring stability."
}
```

### Turn 5 — tool

Applied. Added 15, updated 0 existing item(s).

### Turn 5 — assistant

Captured the recovery and emergency-change layer.

I added:

- Recovery artifacts:
  - **Recovery Plan**
  - **Disaster Recovery Plan**
  - **Runbook**
  - **Service Continuity Plan**
- **Recovery Option** with decision properties:
  - option type
  - expected recovery time
  - risk
  - approval required
  - customer impact
  - data-loss exposure
  - rollback plan
- **Emergency Change** and **Emergency-change Authority**
- **Service Restoration** with confirmation criteria:
  - technical recovery complete
  - business validation
  - customer validation
  - monitoring stable period
- Rules for:
  - recovery option selection
  - emergency change governance
  - service restoration confirmation

Next, let’s cover **evidence, communications, and audit trail**, since those are central in a bank and feed both post-incident review and regulatory reporting.

Could you walk me through:

1. What evidence must be retained during a Major Incident?
   - incident timeline?
   - decisions and approvals?
   - bridge notes?
   - monitoring screenshots/metrics?
   - change records?
   - communications?
   - customer impact analysis?
2. Do you have a formal **Incident Timeline** or **Event Log**? What entries matter?
3. What communication artifacts do you produce?
   - executive updates?
   - business stakeholder updates?
   - customer communications?
   - regulator notifications?
   - internal technology updates?
4. Who approves communications before they are sent?
   - Incident Commander?
   - Communications team?
   - Legal/Compliance?
   - Service Owner?
   - Executive group?
5. Are there communication cadence rules, such as “Sev1 executive update every 30 minutes until restored”?

### Turn 6 — user

Let’s go through the crucial aspects of evidence, communications, and the audit trail that are essential for our Major Incident management.  1. The evidence that must be retained during a Major Incident includes:    - **Incident Timeline**: A chronological record of events and actions taken during the incident.    - **Decisions and Approvals**: Documentation of key decisions made, along with any approvals required for actions taken.    - **Bridge Notes**: Notes from incident command bridge meetings that capture discussions and strategic decisions.    - **Monitoring Screenshots/Metrics**: Evidence from monitoring tools that show system performance and metrics over the incident duration.    - **Change Records**: Details of any changes that were implemented as part of the incident response, especially emergency changes.    - **Communications**: Copies of all communications sent out during the incident, to maintain a record of information flow.    - **Customer Impact Analysis**: Documented analysis reflecting the incident's impact on customers and the business.  2. Yes, we maintain a formal **Incident Timeline** or **Event Log**. Key entries that matter typically include:    - Time of detection    - Time of declaration as a Major Incident    - Key decisions made and by whom    - Actions taken, including workaround implementations or escalations    - Notifications sent and timings    - Recovery milestones achieved throughout the incident  3. The communication artifacts we produce during a Major Incident include:    - **Executive Updates**: High-level summaries intended for senior management and executives, which outline the current status and response actions.    - **Business Stakeholder Updates**: More detailed communications aimed at business units directly affected by the incident, keeping them informed of impacts and recovery efforts.    - **Customer Communications**: Notifications to customers regarding service outages, expected recovery times, and any impacts on their banking experience.    - **Regulator Notifications**: Submissions to relevant regulatory bodies if the incident triggers reporting obligations.    - **Internal Technology Updates**: Messages sent to technical teams regarding the incident’s status, ongoing actions, and resource needs.  4. The approval for communications usually comes from multiple sources:    - The **Incident Commander** typically has the final authorization for major communications.    - The **Communications Team** may assist with crafting messages and ensuring clarity and appropriateness.    - **Legal/Compliance** may review messages, especially those going to customers or regulators, to mitigate legal risks.    - **Service Owners** might approve communications that directly concern their areas of accountability.    - In certain situations, the **Executive Group** may also need to provide approval for high-level communications.  5. Yes, we enforce **communication cadence rules** during incidents. For example, for a **Sev1-Critical** incident, there could be a requirement for executive updates every 30 minutes until the incident is resolved. This cadence ensures that stakeholders remain informed and that executive management is aware of ongoing responses.  This structured approach allows us to maintain transparency, accountability, and a thorough record in support of both incident handling and post-incident review processes. Is there another area you’d like to build upon or clarify further?

### Turn 6 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Evidence Artifact:\n    description: Evidence retained during a Major Incident to support transparency, accountability, audit, review, and regulatory reporting.\n    properties:\n      evidence type:\n        description: Type of evidence, such as Incident Timeline, Decisions and Approvals, Bridge Notes, Monitoring Screenshots/Metrics, Change Records, Communications, or Customer Impact Analysis.\n      retention requirement:\n        description: Required retention expectation for audit, post-incident review, or regulatory purposes.\n  Incident Timeline:\n    description: Formal chronological record, also called an Event Log, of events and actions taken during an Incident or Major Incident.\n    properties:\n      entry type:\n        description: Timeline entry type, such as detection, major-incident declaration, decision, action, notification, escalation, or recovery milestone.\n      entry time:\n        description: Time the timeline event occurred.\n      actor:\n        description: Person, role, or group responsible for the logged event or action.\n  Bridge Notes:\n    description: Notes from incident command bridge meetings that capture discussions, status, actions, and strategic decisions.\n  Monitoring Screenshots/Metrics:\n    description: Evidence from monitoring tools showing system performance and metrics over the incident duration.\n  Change Record:\n    description: Details of changes implemented as part of incident response, especially Emergency Changes.\n  Customer Impact Analysis:\n    description: Documented analysis reflecting the incident's impact on customers and the business.\n    properties:\n      affected customer count:\n        description: Number or estimate of customers affected.\n      affected business function:\n        description: Business function or capability impacted by the incident.\n      impact duration:\n        description: Duration of customer or business impact.\n      impact severity:\n        description: Severity of the customer or business impact.\n  Communication Artifact:\n    description: Communication produced during a Major Incident to inform stakeholders, customers, technical teams, executives, or regulators.\n    properties:\n      communication type:\n        description: Type of communication, such as Executive Update, Business Stakeholder Update, Customer Communication, Regulator Notification, or Internal Technology Update.\n      audience:\n        description: Intended recipients of the communication.\n      sent time:\n        description: Time the communication was sent.\n      approval status:\n        description: Whether the communication is drafted, approved, sent, or rejected.\n  Communications Team:\n    description: Team that assists with crafting incident communications and ensuring clarity and appropriateness.\n  Legal/Compliance:\n    description: Function that reviews customer or regulator-facing communications to mitigate legal and compliance risk.\n  Executive Group:\n    description: Executive-level group that may approve high-level communications during certain Major Incidents.\nrelationships:\n  retains evidence:\n    from: Major Incident\n    to: Evidence Artifact\n    description: A Major Incident retains evidence for audit, review, transparency, accountability, and regulatory needs.\n  has incident timeline:\n    from: Major Incident\n    to: Incident Timeline\n    description: A Major Incident maintains a chronological Incident Timeline or Event Log.\n  timeline includes decision point:\n    from: Incident Timeline\n    to: Decision Point\n    description: The Incident Timeline records key decisions made and who made them.\n  timeline includes emergency change:\n    from: Incident Timeline\n    to: Emergency Change\n    description: The Incident Timeline records emergency changes or other recovery actions taken during the incident.\n  timeline includes service restoration:\n    from: Incident Timeline\n    to: Service Restoration\n    description: The Incident Timeline records recovery milestones and service restoration.\n  has bridge notes:\n    from: Major Incident\n    to: Bridge Notes\n    description: A Major Incident retains notes from command bridge meetings.\n  has monitoring evidence:\n    from: Major Incident\n    to: Monitoring Screenshots/Metrics\n    description: A Major Incident retains monitoring screenshots or metrics as evidence of system behavior and recovery.\n  has change record:\n    from: Emergency Change\n    to: Change Record\n    description: An Emergency Change has a Change Record documenting what was changed and why.\n  has customer impact analysis:\n    from: Major Incident\n    to: Customer Impact Analysis\n    description: A Major Incident has documented analysis of customer and business impact.\n  produces communication:\n    from: Major Incident\n    to: Communication Artifact\n    description: A Major Incident produces communications such as executive updates, business stakeholder updates, customer communications, regulator notifications, and internal technology updates.\n  communication authorized by incident commander:\n    from: Communication Artifact\n    to: Incident Commander\n    description: Major communications are typically finally authorized by the Incident Commander.\n  communication drafted by communications team:\n    from: Communication Artifact\n    to: Communications Team\n    description: The Communications Team assists with drafting and shaping incident communications.\n  communication reviewed by legal/compliance:\n    from: Communication Artifact\n    to: Legal/Compliance\n    description: Legal/Compliance reviews communications, especially customer or regulator-facing messages.\n  communication approved by service owner:\n    from: Communication Artifact\n    to: Owner\n    description: Service Owners may approve communications concerning their areas of accountability.\n  communication approved by executive group:\n    from: Communication Artifact\n    to: Executive Group\n    description: The Executive Group may approve high-level communications in certain situations.\nrules:\n  Major Incident evidence retention:\n    description: During a Major Incident, retain the Incident Timeline, decisions and approvals, Bridge Notes, Monitoring Screenshots/Metrics, Change Records, Communications, and Customer Impact Analysis.\n  Incident Timeline required entries:\n    description: The Incident Timeline or Event Log should include time of detection, time of Major Incident declaration, key decisions and decision makers, actions taken, workaround implementations, escalations, notifications and timings, and recovery milestones.\n  Communication approval:\n    description: The Incident Commander typically gives final authorization for major communications; Communications Team drafts, Legal/Compliance reviews customer or regulator-facing messages, Service Owners may approve service-specific communications, and the Executive Group may approve high-level communications.\n  Sev1 executive communication cadence:\n    description: For a Sev1-Critical incident, executive updates are required on a defined cadence, for example every 30 minutes, until the incident is resolved.\nactions:\n  Retain Major Incident Evidence:\n    description: Preserve required evidence artifacts for audit, review, accountability, and regulatory purposes.\n  Send Executive Update:\n    description: Send a high-level incident summary to senior management and executives.\n  Send Business Stakeholder Update:\n    description: Send a business-focused update to affected business units covering impacts and recovery efforts.\n  Send Customer Communication:\n    description: Notify customers about service outages, expected recovery times, and impacts on their banking experience.\n  Send Regulator Notification:\n    description: Submit required incident notification to relevant regulatory bodies when reporting obligations are triggered.\n  Send Internal Technology Update:\n    description: Inform technical teams of incident status, ongoing actions, and resource needs."
}
```

### Turn 6 — tool

Applied. Added 20, updated 0 existing item(s).

### Turn 6 — assistant

Captured the evidence, communications, and audit-trail layer.

I added:

- **Evidence Artifact**
- **Incident Timeline**, also capturing your “Event Log” terminology
- **Bridge Notes**
- **Monitoring Screenshots/Metrics**
- **Change Record**
- **Customer Impact Analysis**
- **Communication Artifact**
- Approval/supporting roles:
  - **Communications Team**
  - **Legal/Compliance**
  - **Executive Group**

I also modeled rules for:

- Required Major Incident evidence retention
- Required Incident Timeline/Event Log entries
- Communication approval responsibilities
- Sev1 executive communication cadence, e.g. every 30 minutes until resolved

Next, let’s cover **post-incident review, root cause, remediation, and lessons learned**.

Could you describe:

1. What do you call the review after a Major Incident?
   - **Post-Incident Review**
   - **PIR**
   - **Root Cause Analysis**
   - **Problem Review**
2. What outputs are required?
   - root cause
   - contributing factors
   - timeline validation
   - lessons learned
   - remediation actions
   - control improvements
   - risk acceptance
3. How do you track remediation?
   - action owner
   - due date
   - priority
   - status
   - evidence of completion
4. Who approves closure of the review and actions?
   - Incident Commander?
   - Service Owner?
   - Problem Manager?
   - Risk/Compliance?
   - Executive group?
5. Are there deadlines, for example PIR must be completed within X business days for Sev1/Major Incidents?

### Turn 7 — user

Let’s discuss the essential elements of post-incident review, root cause analysis, remediation, and lessons learned.  1. After a Major Incident, we perform a **Post-Incident Review** (PIR). This is often referred to informally as a **PIR**, and it may incorporate elements of a **Root Cause Analysis** as part of the broader review. However, the focus remains on understanding the incident's impact and outcomes rather than solely on the technical root causes.  2. Required outputs from the Post-Incident Review include:    - **Root Cause**: Identifying the underlying cause of the incident.    - **Contributing Factors**: Documenting any additional factors that played a role in the incident’s occurrence or impact.    - **Timeline Validation**: Confirming the accuracy of the incident timeline previously recorded.    - **Lessons Learned**: Insights garnered from the response process, including what worked well and what did not.    - **Remediation Actions**: Specific actions to address the identified root causes and improve future incident response.    - **Control Improvements**: Recommendations for enhancing existing controls to mitigate risks.    - **Risk Acceptance**: Documenting any remaining risks that have been formally accepted following the incident.  3. We track remediation through several key properties:    - **Action Owner**: The individual or role responsible for implementing the remediation action.    - **Due Date**: The timeline by which the action must be completed.    - **Priority**: The urgency of the action based on potential risk or impact.    - **Status**: The current state of the remediation action (e.g., open, in progress, completed).    - **Evidence of Completion**: Documentation or records that demonstrate the action has been successfully finished.  4. The approval for closure of the review and actions generally comes from several roles including:    - The **Incident Commander** who oversees the review process.    - The **Service Owner** for services directly impacted by the incident.    - The **Problem Manager** if root causes and remediation actions are linked to known problems.    - Risk and Compliance representatives may review and approve findings, particularly those involving changes to controls or acceptance of risks.    - In certain cases, the **Executive Group** may also need to be informed or approve significant findings or changes stemming from the review.  5. Yes, we have established deadlines for completing the Post-Incident Review. Typically, for **Sev1** or Major Incidents, the PIR must be completed within **five business days** of the incident resolution to ensure timely lessons are learned and remedial actions can be implemented without delay.  This structure ensures that we learn from incidents effectively and make necessary improvements to our processes and controls. Would you like to go deeper into any specific areas or is there another aspect you wish to explore next?

### Turn 7 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Post-Incident Review:\n    aliases:\n      - PIR\n    description: Review performed after a Major Incident to understand impact, outcomes, response effectiveness, and root cause elements.\n    properties:\n      root cause:\n        description: Underlying cause of the incident.\n      contributing factors:\n        description: Additional factors that played a role in the incident’s occurrence or impact.\n      timeline validation:\n        description: Confirmation of the accuracy of the recorded Incident Timeline.\n      lessons learned:\n        description: Insights from the response process, including what worked well and what did not.\n      control improvements:\n        description: Recommendations for enhancing controls to mitigate risks.\n      risk acceptance:\n        description: Remaining risk that has been formally accepted following the incident.\n      closure status:\n        description: Whether the review is open, pending approval, closed, or rejected.\n      due date:\n        description: Date by which the PIR must be completed.\n  Remediation Action:\n    description: Specific action identified through the Post-Incident Review to address root causes, contributing factors, control gaps, or response improvements.\n    properties:\n      action owner:\n        description: Individual or role responsible for implementing the remediation action.\n      due date:\n        description: Date by which the remediation action must be completed.\n      priority:\n        description: Urgency of the action based on potential risk or impact.\n      status:\n        description: Current state of the remediation action, such as open, in progress, or completed.\n      evidence of completion:\n        description: Documentation or records demonstrating the action has been successfully completed.\n  Problem Manager:\n    description: Role involved when root causes and remediation actions are linked to known problems.\n  Risk/Compliance:\n    description: Risk and compliance representatives who review findings involving controls, regulatory obligations, or risk acceptance.\nrelationships:\n  followed by post-incident review:\n    from: Major Incident\n    to: Post-Incident Review\n    description: A Major Incident is followed by a Post-Incident Review.\n  validates timeline:\n    from: Post-Incident Review\n    to: Incident Timeline\n    description: A Post-Incident Review confirms the accuracy of the recorded Incident Timeline.\n  identifies remediation action:\n    from: Post-Incident Review\n    to: Remediation Action\n    description: A Post-Incident Review identifies Remediation Actions to address root causes, control gaps, and response improvements.\n  remediation action owned by:\n    from: Remediation Action\n    to: Owner\n    description: A Remediation Action is owned by an accountable individual or role.\n  closure approved by incident commander:\n    from: Post-Incident Review\n    to: Incident Commander\n    description: The Incident Commander may approve closure of the Post-Incident Review.\n  closure approved by service owner:\n    from: Post-Incident Review\n    to: Owner\n    description: The Service Owner approves closure for reviews involving services under their accountability.\n  closure approved by problem manager:\n    from: Post-Incident Review\n    to: Problem Manager\n    description: The Problem Manager approves or supports closure when root causes and remediation actions are linked to known problems.\n  closure reviewed by risk/compliance:\n    from: Post-Incident Review\n    to: Risk/Compliance\n    description: Risk/Compliance reviews and may approve findings involving controls, regulatory obligations, or risk acceptance.\n  closure approved by executive group:\n    from: Post-Incident Review\n    to: Executive Group\n    description: The Executive Group may approve or be informed of significant findings or changes stemming from the review.\nrules:\n  PIR required outputs:\n    description: A Post-Incident Review must include root cause, contributing factors, timeline validation, lessons learned, remediation actions, control improvements, and any risk acceptance.\n  Remediation tracking:\n    description: Remediation Actions are tracked by action owner, due date, priority, status, and evidence of completion.\n  PIR closure approval:\n    description: Closure of the Post-Incident Review and actions may require approval from the Incident Commander, Service Owner, Problem Manager, Risk/Compliance, and in significant cases the Executive Group.\n  Sev1 or Major Incident PIR deadline:\n    description: For Sev1 or Major Incidents, the Post-Incident Review must typically be completed within five business days of incident resolution.\nactions:\n  Complete Post-Incident Review:\n    description: Complete the review after a Major Incident, including impact, outcomes, response effectiveness, root cause, and lessons learned.\n  Validate Incident Timeline:\n    description: Confirm the accuracy of the incident timeline as part of the Post-Incident Review.\n  Create Remediation Action:\n    description: Create a tracked action to address root causes, contributing factors, control gaps, or response improvements.\n  Approve PIR Closure:\n    description: Approve closure of the Post-Incident Review once required outputs and approvals are complete.\n  Accept Residual Risk:\n    description: Formally document acceptance of remaining risk following the incident review."
}
```

### Turn 7 — tool

Applied. Added 13, updated 0 existing item(s).

### Turn 7 — assistant

Captured the post-incident review layer.

I added:

- **Post-Incident Review** with alias **PIR**
- **Remediation Action**
- **Problem Manager**
- **Risk/Compliance**

And modeled:

- Major Incident followed by PIR
- PIR validates the Incident Timeline
- PIR identifies Remediation Actions
- Remediation Actions are owned and tracked
- PIR closure approval/review by:
  - **Incident Commander**
  - **Service Owner / Owner**
  - **Problem Manager**
  - **Risk/Compliance**
  - **Executive Group**, where significant
- PIR deadline rule:
  - **Sev1 or Major Incident PIR typically completed within five business days of incident resolution**

Next, let’s cover the **regulatory-reporting workflow**, since you mentioned regulatory thresholds and regulator notifications several times.

Could you walk me through:

1. What do you call the regulatory assessment artifact?
   - **Regulatory Assessment**
   - **Reportability Assessment**
   - **Operational Resilience Assessment**
   - something else?
2. What criteria make an incident reportable?
   - customer harm?
   - critical business service disruption?
   - data/security impact?
   - duration threshold?
   - transaction impact?
   - geographic or regulator-specific threshold?
3. Who performs and approves the assessment?
   - Risk/Compliance?
   - Legal?
   - Incident Commander?
   - Service Owner?
   - Executive Group?
4. What regulatory reporting artifacts are produced?
   - initial notification
   - interim updates
   - final report
   - evidence pack
5. Are there deadlines or clocks?
   - assessment within X hours?
   - initial regulator notification within X hours?
   - final report within X days?
6. Is reporting tied to specific **Regulator**, **Jurisdiction**, or **Regulation** objects that you track?

### Turn 8 — user

Let’s explore the **regulatory-reporting workflow** and how we ensure compliance following incidents.  1. We refer to the regulatory assessment artifact as a **Reportability Assessment**. This assessment helps determine whether an incident meets the criteria for regulatory reporting obligations.  2. An incident may be deemed reportable based on various criteria, including:    - **Customer Harm**: If customers are negatively impacted by the incident, this raises the reporting threshold.    - **Critical Business Service Disruption**: Disruption to key business services that affects a significant number of users or processes.    - **Data/Security Impact**: Incidents that affect data confidentiality, integrity, or availability often trigger reporting needs.    - **Duration Threshold**: If the incident exceeds a specific duration, this can require reporting.    - **Transaction Impact**: If business transactions are disrupted or halted, this can necessitate regulatory notification.    - **Geographic or Regulator-Specific Threshold**: Some incidents must be reported based on specific legislation or regulations for different jurisdictions.  3. The responsibility to perform and approve the assessment usually lies with:    - **Risk/Compliance**: They typically lead the assessment as their role involves understanding regulatory obligations.    - **Legal**: May be involved to interpret the requirements accurately and reduce legal exposure.    - The **Incident Commander** might provide input, particularly on the incident specifics impacting the assessment.    - **Service Owners** can also be consulted but typically do not have the final approval authority.    - **Executive Group** involvement may be necessary for high-severity incidents or ones with significant reputational or compliance implications.  4. The regulatory reporting artifacts produced include:    - **Initial Notification**: An initial communication sent to the regulator informing them of the incident and basic details.    - **Interim Updates**: Regular updates provided to the regulator as new information becomes available or resolution efforts progress.    - **Final Report**: A comprehensive summary submitted after the incident is resolved, detailing findings and any corrective actions taken.    - **Evidence Pack**: Documentation and evidence supporting the incident report that may be required during or after the reporting process.  5. Yes, we do impose deadlines or clocks regarding reporting:    - The **Reportability Assessment** may need to be completed within **a specified number of hours** (e.g., 24 hours) post-incident detection.    - The **initial regulator notification** must typically be made within **a specific timeframe** (e.g., 48 hours) of the incident being declared.    - The **final report** is generally required within **a defined number of days** (e.g., 10 business days) after the incident resolution.  6. Yes, we maintain specific objects for **Regulator**, **Jurisdiction**, and **Regulation** that we track to ensure compliance with various reporting obligations. This allows us to correctly associate incidents with applicable regulations and address them appropriately in our reporting workflow.  This structured approach ensures that we remain compliant with regulatory requirements while effectively responding to incidents. Would you like to expand on any specific aspect or is there another area you want to investigate next?

### Turn 8 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Reportability Assessment:\n    description: Assessment used to determine whether an Incident or Major Incident meets criteria for regulatory reporting obligations.\n    properties:\n      customer harm:\n        description: Whether customers are negatively impacted in a way that raises the reporting threshold.\n      critical business service disruption:\n        description: Whether a key Business Service is disrupted and affects significant users or processes.\n      data/security impact:\n        description: Whether data confidentiality, integrity, availability, or security is affected.\n      duration threshold:\n        description: Whether the incident exceeds a reportable duration threshold.\n      transaction impact:\n        description: Whether business transactions are disrupted or halted.\n      geographic or regulator-specific threshold:\n        description: Whether jurisdiction-specific legislation or regulator-specific criteria apply.\n      assessment status:\n        description: Current status of the assessment, such as pending, in progress, reportable, not reportable, or approved.\n      assessment due time:\n        description: Deadline by which the Reportability Assessment must be completed.\n  Legal:\n    description: Function involved in interpreting regulatory requirements and reducing legal exposure in reportability decisions and communications.\n  Regulatory Reporting Artifact:\n    description: Artifact produced for regulator-facing reporting after a reportable incident.\n    properties:\n      artifact type:\n        description: Type of reporting artifact, such as Initial Notification, Interim Update, Final Report, or Evidence Pack.\n      due time:\n        description: Deadline for producing or submitting the artifact.\n      submission status:\n        description: Whether the artifact is drafted, approved, submitted, rejected, or superseded.\n      submitted time:\n        description: When the artifact was submitted.\n  Regulator:\n    description: Regulatory body that may receive reportable incident notifications and reports.\n  Jurisdiction:\n    description: Geographic or legal jurisdiction that determines applicable regulatory obligations and thresholds.\n  Regulation:\n    description: Specific regulation or legislation defining incident reporting obligations, criteria, and deadlines.\nrelationships:\n  has reportability assessment:\n    from: Incident\n    to: Reportability Assessment\n    description: An Incident has a Reportability Assessment to determine whether regulatory reporting is required.\n  reportability assessment led by risk/compliance:\n    from: Reportability Assessment\n    to: Risk/Compliance\n    description: Risk/Compliance typically leads the Reportability Assessment.\n  reportability assessment reviewed by legal:\n    from: Reportability Assessment\n    to: Legal\n    description: Legal may review the Reportability Assessment to interpret requirements and reduce legal exposure.\n  reportability assessment informed by incident commander:\n    from: Reportability Assessment\n    to: Incident Commander\n    description: The Incident Commander provides incident specifics that inform the Reportability Assessment.\n  reportability assessment consults service owner:\n    from: Reportability Assessment\n    to: Owner\n    description: Service Owners may be consulted on service impact but typically do not provide final approval.\n  reportability assessment escalated to executive group:\n    from: Reportability Assessment\n    to: Executive Group\n    description: The Executive Group may be involved for high-severity incidents or significant reputational or compliance implications.\n  produces regulatory reporting artifact:\n    from: Reportability Assessment\n    to: Regulatory Reporting Artifact\n    description: A reportable assessment produces regulatory reporting artifacts such as Initial Notification, Interim Updates, Final Report, and Evidence Pack.\n  reporting artifact sent to regulator:\n    from: Regulatory Reporting Artifact\n    to: Regulator\n    description: A regulatory reporting artifact is submitted to the relevant Regulator.\n  incident occurs in jurisdiction:\n    from: Incident\n    to: Jurisdiction\n    description: An Incident occurs in or affects a Jurisdiction relevant to regulatory reporting obligations.\n  jurisdiction governed by regulation:\n    from: Jurisdiction\n    to: Regulation\n    description: A Jurisdiction is governed by Regulations that define incident reporting obligations.\n  regulation enforced by regulator:\n    from: Regulation\n    to: Regulator\n    description: A Regulation is enforced by a Regulator.\nrules:\n  Reportability criteria:\n    description: An incident may be reportable based on customer harm, critical Business Service disruption, data/security impact, duration threshold, transaction impact, or geographic/regulator-specific threshold.\n  Reportability Assessment authority:\n    description: Risk/Compliance typically leads and approves the Reportability Assessment; Legal may review, the Incident Commander provides incident-specific input, Service Owners may be consulted, and the Executive Group may be involved for high-severity or high-implication cases.\n  Reportability Assessment deadline:\n    description: A Reportability Assessment may need to be completed within a specified number of hours, for example 24 hours after incident detection.\n  Initial regulator notification deadline:\n    description: Initial regulator notification must typically be made within a specific timeframe, for example 48 hours after the incident is declared.\n  Final regulatory report deadline:\n    description: The final regulatory report is generally required within a defined number of days, for example 10 business days after incident resolution.\nactions:\n  Complete Reportability Assessment:\n    description: Determine whether an Incident or Major Incident meets regulatory reporting obligations.\n  Submit Initial Notification:\n    description: Send an initial communication to the Regulator with basic incident details.\n  Submit Interim Update:\n    description: Provide the Regulator with updates as new information becomes available or resolution progresses.\n  Submit Final Report:\n    description: Submit a comprehensive post-resolution summary with findings and corrective actions.\n  Compile Evidence Pack:\n    description: Assemble supporting documentation and evidence for regulatory reporting."
}
```

### Turn 8 — tool

Applied. Added 16, updated 0 existing item(s).

### Turn 8 — assistant

Captured the regulatory-reporting workflow.

I added:

- **Reportability Assessment**
- **Legal**
- **Regulatory Reporting Artifact**
- **Regulator**
- **Jurisdiction**
- **Regulation**

And modeled:

- Incident has a Reportability Assessment
- Risk/Compliance leads the assessment
- Legal reviews where needed
- Incident Commander provides incident-specific input
- Service Owner may be consulted
- Executive Group may be involved for high-severity or reputational/compliance-significant incidents
- Reportability Assessment produces:
  - **Initial Notification**
  - **Interim Update**
  - **Final Report**
  - **Evidence Pack**
- Reporting artifacts are sent to the relevant Regulator
- Incident reporting is tied to Jurisdiction, Regulation, and Regulator
- Deadline rules:
  - assessment often within 24 hours of detection
  - initial notification often within 48 hours of declaration
  - final report often within 10 business days after resolution

We have now covered the main lifecycle: service dependencies → incident detection/classification → major-incident governance → recovery/emergency change → evidence/communications → PIR/remediation → regulatory reporting.

One final area I’d like to capture is **ongoing governance, controls, and management reporting**, since you lead IT operations governance as well as major-incident management.

Could you describe:

1. What governance forums oversee this process?
   - Major Incident Review Board?
   - Operational Resilience Forum?
   - Change Advisory Board?
   - Risk Committee?
2. What metrics or KPIs/KRIs do you track?
   - number of Sev1/Sev2 incidents
   - MTTA / MTTD / MTTR
   - RTO/RPO breaches
   - repeat incidents
   - overdue remediation actions
   - regulatory-reporting timeliness
   - communication cadence adherence
3. What controls are tested or monitored?
   - evidence completeness
   - PIR completion within SLA
   - emergency-change retrospective approval
   - reportability assessment completion
   - service ownership completeness
4. Are there formal policy or standard documents we should model?
   - Major Incident Management Standard
   - Operational Resilience Policy
   - Emergency Change Standard
   - Regulatory Reporting Procedure
5. Who receives governance reporting, and who can require corrective action?

### Turn 9 — user

Let’s cover the area of ongoing governance, controls, and management reporting in our operational framework.  1. Governance forums that oversee the processes include:    - **Major Incident Review Board**: This forum evaluates significant incidents, their handling, and outcomes to ensure ongoing improvement.    - **Operational Resilience Forum**: Focuses on the bank's ability to continue critical operations during disruptions, emphasizing resilience planning and strategies.    - **Change Advisory Board** (CAB): Reviews proposed changes to ensure they align with operational needs and risk appetite.    - **Risk Committee**: Oversees overall risk management across the bank, including risks associated with incidents and operational failures.  2. Metrics and KPIs/KRIs we track include:    - Number of **Sev1/Sev2 incidents**: This helps us understand our operational risk exposure.    - **MTTA (Mean Time to Acknowledge)**, **MTTD (Mean Time to Detect)**, and **MTTR (Mean Time to Resolve)**: These metrics assess our response effectiveness.    - **RTO/RPO breaches**: Monitoring if our recovery objectives are consistently met.    - **Repeat incidents**: Identifying incidents that recur within a specified timeframe to target root causes.    - **Overdue remediation actions**: Tracking action items from PIRs that have not been completed within set deadlines.    - **Regulatory-reporting timeliness**: Ensuring we meet reporting deadlines set by regulatory authorities.    - **Communication cadence adherence**: Evaluating whether we’re following established communication practices during incidents.  3. Controls that are tested or monitored include:    - **Evidence Completeness**: Ensuring all required documentation is present during incidents.    - **PIR Completion within SLA**: Monitoring whether Post-Incident Reviews meet Service Level Agreements for timeliness.    - **Emergency-Change Retrospective Approval**: Verifying that emergency changes are reviewed after implementation.    - **Reportability Assessment Completion**: Ensuring assessments are performed within required timelines.    - **Service Ownership Completeness**: Ensuring all services have designated owners responsible for oversight.  4. Formal policy or standard documents we should model include:    - **Major Incident Management Standard**: Guidelines for managing incidents and the responsibilities of involved parties.    - **Operational Resilience Policy**: Framework supporting the bank's resilience efforts.    - **Emergency Change Standard**: Procedures governing the management of emergency changes.    - **Regulatory Reporting Procedure**: Standards guiding the process for reporting incidents to regulatory bodies.  5. Governance reporting is typically sent to:    - **Executive Management**: To provide insights into operational effectiveness and incident trends.    - **Risk Committee**: For oversight of risks related to incidents and operational processes.    - **Specific stakeholders**: Such as Service Owners and operational leaders who can require corrective action based on governance findings.  This governance structure is vital to ensuring that we maintain accountability, compliance, and continuous improvement in our operations. Would you like to delve deeper into any of these aspects or is there a different area you want to cover before concluding?

### Turn 9 — assistant

**Tool call: `apply_ontology_yaml`**

```
{
  "yaml": "classes:\n  Major Incident Review Board:\n    description: Governance forum that evaluates significant incidents, their handling, and outcomes to ensure ongoing improvement.\n  Operational Resilience Forum:\n    description: Governance forum focused on the bank's ability to continue critical operations during disruptions, including resilience planning and strategies.\n  Change Advisory Board:\n    aliases:\n      - CAB\n    description: Governance forum that reviews proposed changes to ensure they align with operational needs and risk appetite.\n  Risk Committee:\n    description: Governance forum that oversees overall risk management across the bank, including risks associated with incidents and operational failures.\n  Metric:\n    description: KPI or KRI used to assess incident management, recovery, reporting, resilience, and operational risk performance.\n    properties:\n      metric type:\n        description: Type of metric, such as number of Sev1/Sev2 incidents, MTTA, MTTD, MTTR, RTO/RPO breaches, repeat incidents, overdue remediation actions, regulatory-reporting timeliness, or communication cadence adherence.\n      threshold:\n        description: Target, tolerance, or trigger level used for governance review or corrective action.\n      reporting period:\n        description: Period over which the metric is measured.\n      trend:\n        description: Direction or pattern of performance, such as improving, stable, or deteriorating.\n  Control:\n    description: Governance control tested or monitored to ensure incident-management compliance, completeness, and timeliness.\n    properties:\n      control type:\n        description: Type of control, such as Evidence Completeness, PIR Completion within SLA, Emergency-Change Retrospective Approval, Reportability Assessment Completion, or Service Ownership Completeness.\n      control status:\n        description: Whether the control is effective, ineffective, not tested, or requires remediation.\n      test frequency:\n        description: How often the control is tested or monitored.\n      breach status:\n        description: Whether the control has breached its expected standard or SLA.\n  Policy or Standard Document:\n    description: Formal policy, standard, or procedure governing incident management, resilience, emergency change, or regulatory reporting.\n    properties:\n      document type:\n        description: Type of document, such as Major Incident Management Standard, Operational Resilience Policy, Emergency Change Standard, or Regulatory Reporting Procedure.\n      applicability:\n        description: Scope of processes, services, roles, or obligations covered by the document.\n  Governance Report:\n    description: Management reporting package that communicates metrics, controls, trends, findings, and corrective-action needs to oversight stakeholders.\n    properties:\n      reporting period:\n        description: Period covered by the governance report.\n      key findings:\n        description: Main issues, trends, breaches, or observations requiring management attention.\n      corrective action required:\n        description: Whether corrective action is required based on governance findings.\n  Executive Management:\n    description: Senior management audience receiving governance reporting on operational effectiveness and incident trends.\n  Operational Leader:\n    description: Operational stakeholder who receives governance findings and may require or drive corrective action.\nrelationships:\n  review board evaluates major incident:\n    from: Major Incident Review Board\n    to: Major Incident\n    description: The Major Incident Review Board evaluates significant incidents and their handling.\n  review board evaluates PIR:\n    from: Major Incident Review Board\n    to: Post-Incident Review\n    description: The Major Incident Review Board evaluates PIR outcomes and lessons learned.\n  operational resilience forum oversees business service:\n    from: Operational Resilience Forum\n    to: Business Service\n    description: The Operational Resilience Forum oversees resilience of critical business operations and services.\n  operational resilience forum oversees continuity plan:\n    from: Operational Resilience Forum\n    to: Service Continuity Plan\n    description: The Operational Resilience Forum oversees resilience planning and continuity strategies.\n  CAB reviews emergency change:\n    from: Emergency Change\n    to: Change Advisory Board\n    description: Emergency Changes may be reviewed by the Change Advisory Board, especially for retrospective governance.\n  risk committee oversees control:\n    from: Risk Committee\n    to: Control\n    description: The Risk Committee oversees controls related to incidents and operational failures.\n  governance report includes metric:\n    from: Governance Report\n    to: Metric\n    description: Governance Reports include KPIs and KRIs used to assess operational performance and risk.\n  governance report includes control:\n    from: Governance Report\n    to: Control\n    description: Governance Reports include control test or monitoring results.\n  governance report includes remediation action:\n    from: Governance Report\n    to: Remediation Action\n    description: Governance Reports include overdue or significant remediation actions.\n  governance report sent to executive management:\n    from: Governance Report\n    to: Executive Management\n    description: Governance reporting is sent to Executive Management for insight into operational effectiveness and incident trends.\n  governance report sent to risk committee:\n    from: Governance Report\n    to: Risk Committee\n    description: Governance reporting is sent to the Risk Committee for oversight of operational and incident-related risk.\n  governance report sent to service owner:\n    from: Governance Report\n    to: Owner\n    description: Governance reporting is sent to Service Owners where findings relate to their accountable services.\n  governance report sent to operational leader:\n    from: Governance Report\n    to: Operational Leader\n    description: Governance reporting is sent to operational leaders who can require or drive corrective action.\n  policy governs major incident:\n    from: Policy or Standard Document\n    to: Major Incident\n    description: Policy or standard documents such as the Major Incident Management Standard govern Major Incident management.\n  policy governs service continuity plan:\n    from: Policy or Standard Document\n    to: Service Continuity Plan\n    description: Policy or standard documents such as the Operational Resilience Policy govern resilience and continuity planning.\n  policy governs emergency change:\n    from: Policy or Standard Document\n    to: Emergency Change\n    description: Policy or standard documents such as the Emergency Change Standard govern Emergency Changes.\n  policy governs reportability assessment:\n    from: Policy or Standard Document\n    to: Reportability Assessment\n    description: Policy or standard documents such as the Regulatory Reporting Procedure govern reportability assessments and regulatory reporting.\nrules:\n  Governance metrics tracked:\n    description: Governance reporting tracks number of Sev1/Sev2 incidents, MTTA, MTTD, MTTR, RTO/RPO breaches, repeat incidents, overdue remediation actions, regulatory-reporting timeliness, and communication cadence adherence.\n  Governance controls monitored:\n    description: Governance controls include Evidence Completeness, PIR Completion within SLA, Emergency-Change Retrospective Approval, Reportability Assessment Completion, and Service Ownership Completeness.\n  Corrective action authority:\n    description: Executive Management, the Risk Committee, Service Owners, and operational leaders receive governance reporting and may require corrective action based on findings.\nactions:\n  Produce Governance Report:\n    description: Compile and distribute management reporting covering metrics, control results, trends, findings, and corrective-action needs.\n  Monitor Governance Control:\n    description: Test or monitor incident-management controls for completeness, timeliness, and compliance.\n  Require Corrective Action:\n    description: Require a corrective action in response to governance findings, control failures, or deteriorating metrics."
}
```

### Turn 9 — tool

Applied. Added 16, updated 0 existing item(s).

### Turn 9 — assistant

Captured the ongoing governance, controls, and management-reporting layer.

I added governance forums:

- **Major Incident Review Board**
- **Operational Resilience Forum**
- **Change Advisory Board** / **CAB**
- **Risk Committee**

I added operating governance objects:

- **Metric**
- **Control**
- **Policy or Standard Document**
- **Governance Report**
- **Executive Management**
- **Operational Leader**

And modeled:

- Review Board evaluates Major Incidents and PIRs
- Operational Resilience Forum oversees Business Services and Service Continuity Plans
- CAB reviews Emergency Changes, especially retrospectively
- Risk Committee oversees controls
- Governance Reports include metrics, controls, and remediation actions
- Governance Reports are sent to Executive Management, Risk Committee, Service Owners, and Operational Leaders
- Policy/standard documents govern:
  - Major Incident management
  - service continuity / operational resilience
  - emergency change
  - reportability assessment and regulatory reporting

I also added rules for:

- Governance metrics tracked:
  - Sev1/Sev2 incident count
  - MTTA, MTTD, MTTR
  - RTO/RPO breaches
  - repeat incidents
  - overdue remediation actions
  - regulatory-reporting timeliness
  - communication cadence adherence
- Governance controls monitored:
  - evidence completeness
  - PIR completion within SLA
  - emergency-change retrospective approval
  - reportability assessment completion
  - service ownership completeness
- Corrective-action authority:
  - Executive Management
  - Risk Committee
  - Service Owners
  - Operational Leaders

At this point, I believe we have covered the core domain model needed for your IT operations governance and major-incident management operating model:

1. Service and dependency structure  
2. Incident detection and classification  
3. Major-incident governance and decision rights  
4. Recovery, DR, and emergency change  
5. Evidence, communications, and audit trail  
6. Post-incident review, remediation, and lessons learned  
7. Regulatory-reporting workflow  
8. Ongoing governance, controls, metrics, and management reporting  

If you agree, the model is now broadly complete. The only remaining refinements I’d suggest would be naming/terminology cleanup, such as confirming whether you prefer **Executive Group** or **Executive Stakeholder Group**, and whether **Risk/Compliance**, **Legal/Compliance**, and **Legal** should remain separate or be consolidated according to your bank’s vocabulary.
