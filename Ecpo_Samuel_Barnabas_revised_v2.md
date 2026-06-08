BLOOD DONOR MANAGEMENT SYSTEM

BY

ECPO, Samuel Barnabas

(2021/CP/CSC/0066)

A PROJECT REPORT SUBMITTED TO THE DEPARTMENT OF COMPUTER SCIENCE, FACULTY OF COMPUTING, IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF BACHELOR OF SCIENCE (BSc) DEGREE IN COMPUTER SCIENCE. OF FEDERAL UNIVERSITY OF LAFIA.

MARCH, 2026

CHAPTER ONE

INTRODUCTION

1.1 Background of Studies

The management of blood resources remains a cornerstone of modern clinical practice, yet it is arguably one of the most volatile logistical challenges in the healthcare sector. Blood is a perishable biological product with a limited shelf life ranging from a few days for platelets to approximately 42 days for red blood cells meaning that supply chains must operate with near-perfect synchronization to avoid both life-threatening shortages and wasteful expirations (Santhanalakshmi et al., 2025). Historically, the infrastructure supporting blood transfusion has relied on localized, manual systems. However, as medical advancements increase the demand for complex surgeries, trauma care, and the management of chronic conditions like sickle cell anemia, the traditional paper-based ledger has become a liability rather than a tool (Okorodudu & Ajah, 2024).

In the contemporary era, the digitalization of blood management has evolved from simple databases to multi-tiered digital ecosystems. Modern Blood Donor Management Systems (BDMS) are now defined as sophisticated, browser-based or mobile-integrated platforms designed to automate the storage, retrieval, and analysis of donor demographics and inventory levels (Nath et al., 2023). These systems aim to dissolve the communication silos between donors, healthcare facilities, and blood banks, fostering a responsive environment where matching can occur in seconds (Santhanalakshmi et al., 2025). Globally, there is a push toward "intelligent" systems that leverage predictive analytics and Artificial Intelligence (AI) to anticipate demand spikes before they manifest, ensuring that blood is available exactly when and where a crisis occurs (Patil et al., 2025).

For developing regions, particularly in Sub-Saharan Africa, the transition to digital management is not merely an administrative upgrade but a critical intervention. In Nigeria, only about 20% of blood banks have transitioned to digital platforms, leaving the vast majority to struggle with manual records that are prone to human error and physical destruction (Ovri et al., 2023). The absence of centralized, real-time data often forces hospitals to rely on family replacement donors, a practice that frequently delays treatment and increases the risk of transfusion-transmissible infections (TTIs) due to the pressure of emergency screening (Agu et al., 2022). Therefore, the development of a robust Blood Donor Management System represents a strategic shift toward a more resilient and data-driven healthcare delivery model.

1.2 Research Motivation

The primary motivation for this research stems from the persistent "reactive" nature of current blood supply chains. In many instances, the search for blood only begins once a patient is already on the operating table, leading to frantic social media appeals and avoidable deaths. For example, during the 2022 train incident in Lagos, the lack of a centralized management system forced citizens to use social media as a makeshift coordination tool to find donors (Ovri et al., 2023). This highlights a systemic failure that technology is uniquely positioned to solve.

Furthermore, recent psychological scholarship has introduced the "benevolence hypothesis," which suggests that blood donation behavior is sustained when donors feel a sense of personal gratification and community connection (Santhanalakshmi et al., 2025). This research is motivated by the potential to integrate gamification and personalized communication into management systems to transform donation from a one-time altruistic act into a lifelong habit. By utilizing technologies like the MERN stack (MongoDB, Express, React, Node) or AI-driven matching algorithms, we can provide a user experience that not only manages blood but also actively recruits and retains a safe donor pool (Patil et al., 2025; Khan et al., 2024).

1.3 Statement of the Problem

Despite the critical importance of blood, the current operational framework in many Nigerian hospitals is characterized by extreme fragmentation and inefficiency. Research conducted in Abia State health institutions reveals a sobering reality: 100% of the facilities surveyed maintained their donor records manually (Agu et al., 2024). This near-total dependence on paper-based administration is not merely an inconvenience. It is a structural failure with measurable consequences for patient survival.

The first and perhaps most immediately life-threatening consequence of this manual dependence is the problem of inefficient search and retrieval. When a patient in a Nigerian hospital requires a specific blood type during an emergency, clinical staff are required to manually sift through physical ledgers and filing systems to locate a compatible donor record. This process, which in a digital environment would take seconds, can extend to several hours under manual conditions. Clinical emergencies, however, do not afford such time. Trauma victims, obstetric emergencies, and patients undergoing major surgery require transfusion within minutes, not hours (Ovri et al., 2023). The gap between the speed of the crisis and the speed of the record system is, in many documented cases, the gap between life and death.

A second, compounding problem is the issue of inventory wastage. Blood is a perishable biological resource. Without a real-time mechanism for tracking the expiration status of stored units, blood bags routinely expire undetected on facility shelves. This is not a minor administrative oversight. In a region where blood supply is already critically constrained and voluntary donation rates remain low, the silent disposal of viable units due to poor stock visibility represents a profound failure of resource stewardship (Nath et al., 2023). Every expired unit is, in effect, a donation that never reached a patient who needed it.

Closely related to this is the problem of donor management gaps. The current system has no automated mechanism for tracking whether a registered donor remains eligible to donate at any given point in time. The clinical standard requires a minimum interval of approximately 90 days between whole blood donations. In the absence of a system that enforces this rule automatically, donors may be approached and bled too frequently, placing their health at risk. Conversely, eligible donors who have not donated in an extended period receive no reminder or re-engagement communication, effectively removing them from the active donor pool (Agu et al., 2024). Both outcomes weaken the integrity of the blood supply.

Security and data integrity present yet another dimension of vulnerability. Physical donor records and blood inventory files are inherently susceptible to loss through theft, fire, flooding, and the gradual deterioration that accompanies prolonged storage. More critically, paper-based systems offer no reliable means of controlling who accesses sensitive medical information. Donor medical histories, blood group data, and screening results are confidential records that carry significant legal and ethical weight. A manual filing cabinet provides no audit trail, no access log, and no encryption. Unauthorized access, whether deliberate or accidental, is difficult to detect and nearly impossible to prevent (Okorodudu & Ajah, 2024).

Finally, and perhaps most structurally damaging of all, is the lack of inter-facility coordination. Each hospital or blood bank in the current environment operates as an isolated unit, maintaining its own records independently of neighbouring facilities. There is no shared visibility into the aggregate blood supply across a local or regional network. The consequence of this fragmentation is a paradox that should be unacceptable in a functioning health system: one facility may be discarding units of a particular blood group due to near-expiry while a hospital just kilometres away is losing a patient for want of that same type (Patil et al., 2025). This is not a problem of scarcity alone. It is a problem of information failure, and it is precisely the kind of failure that well-designed digital infrastructure is positioned to solve.

1.4 Aim and Objectives

The primary aim of this project is to design and implement a web-based Blood Donor Management System that streamlines the coordination between donors, hospitals, and blood banks to ensure the timely availability of safe blood.

To achieve this, the following specific objectives will be pursued:

To design and implement a centralized MongoDB-based donor registry that securely stores donor demographics, medical histories, and ABO/Rh eligibility status, directly addressing the 100% manual record-keeping documented across surveyed Nigerian health facilities (Agu et al., 2024).

To develop a real-time blood inventory tracking module using the MERN stack that monitors unit levels, blood groups, and expiration dates, with automated threshold alerts to prevent the silent wastage of perishable blood products.

To build an emergency SOS notification system that applies a Greedy Algorithm with Google Maps API geolocation to identify and alert the nearest eligible donors within the 90-day donation eligibility window during acute blood shortages.

To implement a JWT-secured, role-based access control system defining distinct permission levels for Admin, Hospital, and Donor actors, ensuring that access to sensitive medical records is governed, auditable, and compliant with data privacy standards.

To evaluate the system’s effectiveness by measuring donor-matching response times and user experience scores using the System Usability Scale (SUS), benchmarked against existing manual methods to quantify the operational improvement achieved.

1.5 Significance of the Study

The significance of this study spans across multiple stakeholders in the healthcare ecosystem. For healthcare providers and blood bank administrators, the system provides a "single source of truth," allowing for optimized inventory management and a significant reduction in administrative overhead (Khan et al., 2024). Automation of record-keeping reduces the incidence of human error, which is particularly vital in matching blood types to prevent fatal transfusion reactions.

For donors, the system offers a platform for engagement. By providing digital donor cards, donation history tracking, and automated eligibility reminders, the system empowers individuals to take charge of their "blood donor identity," which is a known driver for long-term retention (Santhanalakshmi et al., 2025).

For patients and the general public, the significance is life-saving. A more efficient system translates to faster response times during accidents, surgeries, and childbirth complications, directly contributing to a reduction in mortality rates. Finally, for the academic community, this work provides a framework for implementing modern technological stacks (such as NoSQL or AI-matching) in resource-constrained environments like Nigeria.

1.6 Scope and Limitation of the Study

The scope of this research focuses on the development of a web-based application designed to manage the end-to-end workflow of a blood bank. This includes donor registration, screening documentation, inventory logging, and recipient request processing. The system will feature a dashboard for administrators to view statistics and a portal for hospitals to request specific blood types.

Technically, the project will utilize a modern web stack (e.g., React.js for the frontend and Node.js/Express for the backend) to ensure scalability and cross-platform compatibility. The matching logic will be based on standard ABO/Rh compatibility rules and geographic proximity to the requesting facility.

1.7 Limitation of the Study

While the system is designed to be robust, several external factors may limit its implementation. One primary limitation is the digital divide; the system requires a stable internet connection, which may be inconsistent in rural healthcare centers (Agu et al., 2022). Furthermore, the cold chain infrastructure is beyond the control of the software. Even the most advanced management system cannot save a unit of blood if the hospital suffers from prolonged power outages that compromise storage temperatures (Choudhary & Roy, 2024).

Additionally, the success of the system depends on voluntary donor participation. If the cultural reluctance toward blood donation persists or if donors are hesitant to share their medical data digitally due to privacy concerns, the system's effectiveness will be diminished (Santhanalakshmi et al., 2025). Finally, integration with existing national healthcare databases remains a challenge due to a lack of standardized APIs in the current Nigerian health infrastructure.

1.8 Definition of Operational Terms

Blood Bank Management System (BBMS): A digital platform used to store, process, and analyze information related to blood inventory and donor management (Nath et al., 2023).

Voluntary Non-Remunerated Blood Donation (VNRBD): A system where donors give blood of their own free will without receiving payment, cited by the WHO as the safest source of blood (Agu et al., 2024).

Transfusion-Transmissible Infections (TTIs): Pathogens such as HIV, Hepatitis B, and Syphilis that can be passed from a donor to a recipient through infected blood (Agu et al., 2022).

ABO/Rh Compatibility: The classification system used to ensure that a donor’s blood type is biologically compatible with the recipient’s immune system.

Cold Chain: The temperature-controlled supply chain required to maintain the viability of blood products from collection to transfusion (Choudhary & Roy, 2024).

CHAPTER TWO

LITERATURE REVIEW

2.1 Conceptual Framework

The design and implementation of a modern Blood Donor Management System (BDMS) are underpinned by a multi-dimensional framework that integrates behavioral psychology, clinical safety standards, and advanced computing architectures. This framework is essential for transforming blood donation from a sporadic, emergency-driven event into a sustainable, data-driven ecosystem.

2.1.1 Psychological and Motivational Framework

At the heart of any donor management system is the human element. Sustainable blood supply chains rely on the transition of donors from one-time "altruistic" volunteers to "habitual" participants. This behavioral shift is theoretically supported by Self-Determination Theory (SDT), which suggests that motivation becomes internalized when a system satisfies three fundamental needs: competence, autonomy, and relatedness. In a digital context, a system provides "competence" through clear eligibility feedback and "autonomy" by allowing donors to manage their own schedules via mobile or web interfaces. "Relatedness" is fostered when donors receive personalized notifications about the impact of their contribution, reinforcing their identity within a life-saving community.

Complementing this is the Theory of Planned Behavior (TPB), which identifies attitude, subjective norms, and perceived behavioral control as the primary drivers of donation intention. Modern digital platforms leverage this by lowering "perceived barriers"—such as fear of wait times or lack of location data—through real-time transparency. Furthermore, the "Benevolence Hypothesis" suggests that donation behavior is strengthened when donors perceive a mutual benefit, such as emotional gratification or digital recognition (badges and certificates), rather than just pure altruism.

2.1.2 Technological and Structural Framework

From an architectural perspective, the conceptual framework adopts a three-tier web application model, ensuring a clear separation between the user interface, business logic, and database. In contemporary research (2020–2026), this is increasingly integrated with "Intelligent Supply Chain" paradigms:

Internet of Things (IoT) and RFID: Used to secure the "blood cold chain" by providing real-time temperature and location tracking for every blood unit.

Artificial Intelligence (AI): Moving from reactive record-keeping to proactive forecasting, where machine learning models predict demand spikes and donor eligibility with high accuracy.

Blockchain Technology: Providing a decentralized, immutable ledger to ensure unit-level traceability and prevent fraud or data tampering.

2.2 Related Works

The following section provides an extensive review of fifteen significant scholarly contributions and systems developed within the 2020–2026 window.

2.2.1 The BloodChain System (Le et al., 2022)

Le and colleagues proposed "BloodChain," a private blockchain network utilizing the Hyperledger Fabric architecture. The system was designed to address the lack of transparency in traditional centralized databases. By recording every transaction—from collection to disposal—on a distributed ledger, the researchers ensured that blood quality and origin data remained tamper-proof. This is particularly vital for managing the complex logistics of aging populations where blood safety is paramount.

2.2.2 AI-Driven Unified Framework (Patil et al., 2025)

Patil and his research team introduced an AI-driven framework that integrates multiple machine learning models to optimize the entire operational lifecycle of a blood bank. Their XGBoost model achieved 94% accuracy in predicting donor eligibility. Additionally, the system utilizes Long Short-Term Memory (LSTM) neural networks to forecast the demand for perishable components like platelets, and Dijkstra’s algorithm to optimize emergency delivery routes.

2.2.3 i’Donate: Real-Time Digital SOS (Santhanalakshmi et al., 2025)

The i’Donate platform focuses on the communication gap during medical emergencies. Developed using the Firebase ecosystem, it ensures data synchronization in less than one second. The system combines a Linear Search algorithm for blood group matching and a Greedy Algorithm with the Google Maps API to identify the closest eligible donors to a hospital in need.

2.2.4 Automated Management for Nigeria (Ovri et al., 2023)

Ovri, Shobowale, and Edewhor conducted critical research on the digitalization of blood banking in Nigeria, noting that 80% of local blood banks still rely on manual paper records. Their system, built with Python Django and MySQL, focused on real-time inventory visibility and electronic documentation to eliminate the human errors that often lead to avoidable deaths in Nigerian hospitals.

2.2.5 Integrated Blood and Organ Donation (Nath et al., 2023)

Nath et al. developed the Blood and Organ Donation Management System (BODMS), which provides a single platform for managing both blood and organ donor registries. Utilizing a distributed client-server architecture with a MySQL database normalized to 3NF, the system enables hospitals to act as secure intermediaries for organ donor pledge forms while providing rapid search capabilities for blood units.

2.2.6 KNN-Based Donor Matching (Alharbi, 2020)

Alharbi proposed a system that utilizes the K-Nearest Neighbor (KNN) algorithm to optimize the matching process. By considering factors such as blood type, geographic proximity, and donor availability as multi-dimensional features, the system identifies potential donors with significantly higher speed and accuracy than traditional manual searches.

2.2.7 Smart Blood Donation with AI Chatbot (2025)

This project introduced an AI-powered Helpbot implemented using the Natural Language Toolkit (NLTK) and a MultinomialNB classifier. The chatbot provides real-time assistance for donor queries regarding eligibility and procedures, reducing the administrative burden on hospital staff. It also incorporates predictive analytics to help donors determine their next eligibility date based on their donation history.

2.2.8 MERN Stack Scalable BBMS (2025)

Focusing on performance and high availability, this system was developed using MongoDB, Express.js, React, and Node.js. The study reported that the system reduced donor registration time by 60% and improved request approval times from hours to mere seconds. It achieved a System Usability Scale (SUS) score of 87/100, highlighting its effectiveness for healthcare professionals.

2.2.9 IoT/RFID Integrated Inventory (2025)

This research integrated RFID tags for unit-level monitoring of blood units. The tags track the location, temperature, and expiration date of each blood bag in real-time. Pilot studies in mid-sized hospitals demonstrated a 30% reduction in wastage and a 40% improvement in emergency response speeds when combined with AI-driven demand forecasting.

2.2.10 Riva-Based Process Blueprint (2024)

Instead of focusing solely on software code, this study utilized the "Riva" method to develop a Business Process Architecture (BPA) for blood banking and transfusion. By identifying seven steps to define units of work and dynamic relationships, the blueprint helps stakeholders identify process gaps and pitfalls in the supply chain prior to system implementation.

2.2.11 Bloodcare: Waterfall Adaptation for Nigeria (2020)

Oye et al. implemented "Bloodcare," a web-based system specifically adaptable to the Nigerian health landscape. Using the Waterfall SDLC model and a stack of PHP, JavaScript, and MySQL, the project provided a secure platform for hospitals to track inventories and for donors to access confidential medical reports.

2.2.12 ANN-Based Pattern Prediction (Dhanani et al., 2020)

Dhanani and Verma explored the use of Artificial Neural Networks (ANN) to predict blood donation patterns. Their system analyzed historical donor data and seasonal trends to forecast future availability. The researchers emphasized that integrating such technology can significantly improve transfusion safety by ensuring blood types are available when demand peaks.

2.2.13 Mobile Engagement for Young Donors (Silva et al., 2025)

A pilot study of 952 participants aged 18 to 39 found that 73% of young donors have a favorable perception of using mobile apps for blood donation. The study demonstrated that features such as in-app "badges" and leaderboards can cover 22.7% of users, significantly boosting donor engagement and retention.

2.2.14 Cloud-Integrated Medical Monitoring (2020)

This research proposed a system that integrates IoT cloud platforms with mobile apps to facilitate continuous communication between doctors, patients, and donors. By utilizing cloud hosting, the system ensures high availability and integrates fragmented blood information scattered across different banks to improve service quality.

2.2.15 Situational Analysis of Abia State (Agu et al., 2024)

A multi-centered study across 13 health facilities in Abia State provided the empirical baseline for this project. It revealed that 100% of these institutions currently maintain records manually and none have computerized systems. The study highlights significant challenges, including a lack of standard equipment like -20°C freezers and platelet agitators, which necessitates an urgent digital intervention.

2.3 Summary of Related Work

The fifteen works reviewed in the preceding section collectively represent the current frontier of blood donor management research. Taken individually, each study makes a meaningful contribution. Taken together, however, they reveal a pattern of persistent blind spots, and it is within those gaps that the present work finds its justification.

A significant portion of the reviewed literature gravitates toward technically sophisticated solutions. Le et al. (2022) proposed a blockchain-based traceability system using Hyperledger Fabric, demonstrating the feasibility of a 100% auditable blood unit trail. Patil et al. (2025) advanced this further by introducing an AI-driven framework that combines XGBoost for donor eligibility prediction, LSTM networks for demand forecasting, and Dijkstra’s algorithm for route optimization, achieving a reported accuracy of 94%. These are impressive results. But both systems implicitly assume an environment with robust digital infrastructure, reliable electricity, and technically literate administrative staff. That assumption holds in their respective research contexts. It does not hold in Nasarawa State, Nigeria, where the majority of health facilities currently operate without computerized records of any kind. The technological sophistication of these solutions, rather than being a strength, becomes a barrier to adoption in low-resource environments.

Among the Nigeria-specific studies reviewed, the work of Ovri et al. (2023) and Oye et al. (2020) are the most contextually relevant. Ovri and colleagues directly documented the scale of manual record dependency across Nigerian blood banks, and their Django and MySQL-based system represented a meaningful attempt at digital transition. Similarly, the Bloodcare system by Oye et al. demonstrated that the Waterfall SDLC model could be applied to produce a working web-based blood management solution for Nigerian hospitals. Both studies, however, focused narrowly on the digitization of existing records without addressing the real-time inter-facility coordination gap. A hospital using either system would still have no visibility into blood availability at neighbouring facilities. The problem of fragmented, siloed data persists even in their proposed solutions.

The emergency responsiveness dimension of blood management has received growing attention, most notably from Santhanalakshmi et al. (2025) whose i’Donate platform demonstrated SOS alert delivery in under one second using Firebase and Google Maps API integration. The Alharbi (2020) study also contributed meaningfully by applying the K-Nearest Neighbor algorithm to donor-matching, reducing search time by accounting for geographic proximity alongside blood type compatibility. These are technically sound approaches. The limitation, as with many reviewed works, is that neither system integrates eligibility enforcement into the emergency notification pipeline. A donor who last gave blood four weeks ago may still receive an SOS alert. The gap between notifying a donor and notifying an eligible donor is clinically significant and is not adequately addressed in the current body of literature.

On the question of donor retention and engagement, Silva et al. (2025) and the Adams and Kaur (2025) chatbot study represent the most behaviorally-grounded contributions in the review. Silva and colleagues found that 73% of young donors aged 18 to 39 responded favorably to mobile-based engagement features such as gamification badges and donation history tracking. This is a finding with direct implications for system design. Yet neither study integrates these engagement mechanisms into a broader blood supply management system. They remain standalone tools rather than components of a unified operational platform. The present research takes the position that donor engagement and inventory management are not separate concerns. They must be addressed within the same system architecture if either is to be effective in a resource-constrained Nigerian health setting.

The table below provides a structured comparison of the key methodologies, technologies, and reported outcomes across all fifteen reviewed works, and serves as a consolidated reference for the gaps identified in the preceding critical analysis.

2.4 Research Gaps of the Study

Despite the technological advancements reviewed, several critical gaps prevent these systems from being effectively deployed in environments like Abia State, Nigeria.

2.4.1 The Infrastructure-Sync Paradox

Current global research often assumes a baseline of digital readiness, emphasizing AI and Blockchain. However, in Nigeria, 100% of the institutions surveyed in Abia State still use manual registers, and 0% have computerized record-keeping. There is a profound gap for a system that can bridge the transition from manual registers to a digital platform without requiring high-bandwidth infrastructure that the region currently lacks.

2.4.2 Low-Resource Cold Chain Monitoring

Advanced IoT and RFID systems exist to monitor storage conditions , but they frequently require high-cost hardware and constant electricity. In Abia State, 92.3% of institutions reported poor availability of essential transfusion equipment, and all facilities suffer from an unreliable national grid that disrupts the storage of blood components. There is a research gap for a software-based solution that can simulate inventory health or utilize low-energy SMS-based alerts for cold chain maintenance.

2.4.3 Regulatory Compliance and the Human Factor

Most developed systems focus on technical matching but neglect local regulatory hurdles. In Abia State, only 30.8% of blood bank units have Standard Operating Procedures (SOPs) for all activities, and none of the facilities have a dedicated quality officer. This research seeks to fill the gap by embedding NBTS guidelines and mandatory SOP workflows directly into the software’s business logic, essentially "forcing" digital compliance where manual compliance has failed.

2.4.4 Sourcing and Behavioral Gaps

While global studies emphasize voluntary non-remunerated donation (VNRBD), Nigeria remains heavily dependent on commercial and family replacement donors. Voluntary recruitment units exist in only 7.7% of Abia State institutions. Digital solutions have largely focused on the logistics of blood but have failed to address the sociological barriers, such as deep-seated cultural misconceptions about donation. This study aims to fill this by integrating educational and motivational modules tailored to the local context.

CHAPTER THREE

METHODOLOGY AND ANALYSIS OF THE PRESENT SYSTEM

3.1 Methodology

This study adopted the Structured System Analysis and Design Methodology (SSADM) as the governing framework for the development of the Blood Bank Management System (BBMS). The choice of SSADM was deliberate, not incidental. It is a highly disciplined, data-driven methodology that demands the complete documentation of all logical and physical design requirements before a single line of production code is written. For a system of this nature, where errors in data handling carry direct clinical consequences, that discipline matters enormously. The transition being addressed here is not trivial. Blood bank operations in Nasarawa State, like those documented across Abia State by Agu et al. (2024), were found to be conducted almost entirely through paper-based registers. Moving from that environment to a centralized, web-accessible digital platform required a structured methodology that could manage that complexity without introducing new failure points in the process.

SSADM is structured around seven sequential stages, each building on the output of the one before it. This sequencing was particularly valuable for this research because it enforced a separation between what the system needed to do and how it would eventually do it. Requirements were fully understood before design decisions were made, and design decisions were finalized before implementation began. The following outlines how each SSADM stage was applied in the development of the BBMS.

Stage 0: Feasibility Study: The study commenced with a structured feasibility assessment to determine whether a web-based blood management platform was technically viable within the operational realities of target health facilities in Nasarawa State. The assessment examined three dimensions: technical feasibility, operational feasibility, and economic feasibility. On the technical side, it was established that while computing infrastructure varied considerably across facilities, the availability of basic internet connectivity in the majority of target hospitals was sufficient to support a cloud-hosted web application. Operationally, the investigation confirmed that the existing manual record-keeping system was introducing critical delays in emergency donor retrieval, with staff in some facilities reporting search durations exceeding two hours during acute shortage events. The economic case for the system was also found to be strong, given that the primary cost of the proposed solution was developer time and hosting, as opposed to ongoing paper procurement and administrative overhead. The conclusion of this stage was that development should proceed.

Stage 1: Investigation of the Current Environment: This stage involved a detailed mapping of the existing blood bank workflow across sampled facilities. The investigation revealed several structural weaknesses in the present system. Donor records were maintained in physical ledgers with no standardized format, making cross-reference between facilities essentially impossible. Communication between hospitals and blood banks was conducted through telephone calls and in-person visits, a process that introduced significant delays during emergencies. Blood unit expiry was managed manually, and in numerous documented instances, units were discarded after their expiration date had passed unnoticed. The investigation also identified a dangerous reliance on family replacement donation as the primary sourcing mechanism, a practice that bypasses voluntary donor screening and increases the risk of transfusion-transmitted infections. These findings directly shaped the functional requirements that guided subsequent design stages.

Stage 2: Business System Options: At this stage, multiple architectural options were evaluated before a final direction was selected. Three candidate approaches were considered: a standalone desktop application installed at individual facilities, a localized intranet-based system shared within a single hospital network, and a cloud-hosted web application accessible from any internet-enabled device. The desktop and intranet options were eliminated on a single, non-negotiable criterion: neither could support real-time inter-facility data synchronization. The core problem identified in Stage 1 was fragmentation, and any solution that replicated that fragmentation in digital form would represent a failure of design. The cloud-based web application was selected because it was the only architecture that allowed multiple hospitals, blood banks, and administrative actors to view and update a shared data environment simultaneously. This decision had downstream implications for the entire technology stack, including the selection of MongoDB as a document-oriented database suited to distributed, schema-flexible data.

Stage 3: Requirements Specification: The functional requirements were formally specified at this stage, drawing directly from the findings of the environmental investigation. Five core requirements were identified. First, the system was required to maintain a centralized, searchable donor registry with real-time eligibility status computed against each donor's last donation date, enforcing the minimum 90-day inter-donation interval. Second, a live blood inventory tracking module was required, capable of monitoring unit levels and expiry dates with automated alert generation. Third, an emergency SOS notification pipeline was specified, requiring geolocation-based donor proximity matching to ensure that the nearest eligible donors were contacted before more distant ones. Fourth, role-based access control was required to govern data visibility across three distinct user types: Admin, Hospital, and Donor. Fifth, performance requirements were specified, including a target of sub-three-second response time for donor-matching queries under normal network conditions.

Stage 4: Logical Data Modeling: This stage involved the identification and formal definition of the core data entities required by the system, and the specification of the relationships between them. Five primary entities were identified: Users, Donors, Blood_Inventory, Hospitals, and Requests. The logical model was structured to reflect the real-world relationships within the blood supply chain. A single donor could be associated with multiple donation events over time, establishing a one-to-many relationship between the Donors and Blood_Inventory entities. Similarly, a registered hospital could generate multiple blood requests, requiring a one-to-many relationship between the Hospitals and Requests entities. The Users entity served as the authentication anchor, with role assignments determining what data each user type was permitted to access or modify. This logical model was subsequently normalized to Third Normal Form (3NF) to eliminate data redundancy and prevent update anomalies before physical implementation began.

Stage 5: Logical Design: The logical design stage translated the data model and requirements specification into a set of system-level process designs. The most technically significant output of this stage was the design of the donor-matching algorithm. A Greedy Algorithm approach was selected for the emergency SOS module on the basis of its computational efficiency under time-critical conditions. When a blood request could not be fulfilled from existing inventory, the algorithm was designed to query the Donors collection, filter candidates by ABO/Rh compatibility and 90-day eligibility, and then rank remaining candidates by their geographic proximity to the requesting hospital using Euclidean distance calculations drawn from Google Maps API coordinates. The algorithm selects the nearest N eligible donors and dispatches SOS notifications to their registered device tokens via Firebase Cloud Messaging. This design prioritized response time over exhaustiveness. The system was not designed to identify every possible eligible donor globally. It was designed to identify the closest ones fast enough to make a clinical difference.

Stage 6: Physical Design: The final SSADM stage involved the translation of all logical models into concrete physical implementations. The logical data model was implemented as a MongoDB database schema, with collections corresponding to the five entities identified in Stage 4. The process designs from Stage 5 were implemented as RESTful API endpoints within the Node.js/Express.js backend. The user interface specifications were built as React.js components, structured as a Single Page Application to minimize page load latency. JSON Web Tokens were implemented for authentication and session management, with role-based middleware enforcing access restrictions at the API layer. This stage also encompassed the integration of third-party services, including the Google Maps JavaScript API for geolocation and distance calculations, and Firebase Cloud Messaging for push notification delivery to donor mobile devices.

3.2 Development Tool Used

The selection of development tools was guided by three non-negotiable criteria: the tools had to support real-time data operations, they had to function within a single programming language ecosystem to reduce context-switching overhead during development, and they had to be production-proven in healthcare or similarly high-availability application domains. The MERN stack, comprising MongoDB, Express.js, React.js, and Node.js, satisfied all three criteria. Each component of the stack was chosen for specific technical reasons, not for convenience alone.

3.2.1 Software Stack (The MERN Stack)

The MERN stack was implemented to provide a unified, end-to-end JavaScript environment across both the client and server layers of the application. This uniformity reduced the cognitive load during development and simplified the handling of JSON data, which flows natively through every component of the stack without requiring format conversion. Each technology within the stack served a distinct architectural purpose.

MongoDB (NoSQL Database): MongoDB was selected as the database layer for the BBMS. As a document-oriented NoSQL database, MongoDB stores data as flexible JSON-like documents rather than enforcing a rigid relational schema. This flexibility was particularly relevant for this project because donor medical records are not uniform in structure. Some donors present with additional clinical annotations, conditional eligibility flags, or extended screening histories that do not fit neatly into a fixed-column relational table. MongoDB accommodated this variability without requiring schema migration for every new data attribute. Beyond flexibility, MongoDB's native support for indexing on geospatial fields was a technical consideration in the context of the proximity-based donor matching algorithm. Querying donors by geographic coordinates is a first-class operation in MongoDB, and that capability was leveraged directly in the SOS notification pipeline.

Express.js (Backend Framework): Express.js served as the backend web framework, running on top of Node.js to handle all API routing, middleware execution, and request-response management. All interactions between the React frontend and the MongoDB database were mediated through Express.js RESTful endpoints. Authentication middleware was implemented at this layer using JSON Web Tokens, intercepting every incoming request and validating the token's role claim before allowing access to protected routes. Express.js was chosen over alternatives for its minimal footprint and its compatibility with the Node.js event loop model, which was important for handling the concurrent requests expected from multiple hospital users accessing the system simultaneously.

React.js (Frontend Library): React.js was used to build the client-side interface as a Single Page Application (SPA). The SPA architecture was a deliberate design choice. In a conventional multi-page web application, each user action triggers a full page reload, introducing latency that is acceptable in low-urgency contexts but wholly inappropriate for a blood request dashboard where speed of access can influence clinical outcomes. React's virtual DOM rendering model updates only the components affected by a state change, rather than reloading the entire page, which allowed the system to deliver sub-second interface responses during donor searches and inventory lookups. Component-based architecture also enabled the development of distinct, reusable interface panels for each user role, with each panel rendering only the data and controls appropriate to its actor's permission level.

Node.js (Runtime Environment): Node.js provided the server-side runtime environment within which Express.js and the application logic operated. Its non-blocking, event-driven I/O model was a core reason for its selection. Unlike traditional synchronous server environments where each request occupies a thread until completion, Node.js processes incoming requests asynchronously, freeing the event loop to handle additional requests while waiting on database responses or external API calls. In a system where multiple hospitals may simultaneously submit blood requests, query inventory, and trigger SOS alerts, this concurrency model was not optional. It was a prerequisite for acceptable performance under real-world load conditions.

3.2.2 Supporting Tools

Firebase Cloud Messaging (FCM): Firebase Cloud Messaging was integrated into the system to manage the delivery of real-time push notifications to registered donor mobile devices. FCM was selected because it provides a reliable, cross-platform notification infrastructure that operates independently of the donor's device type or mobile operating system. When the Greedy Algorithm identifies the nearest eligible donors for a given blood request, the Node.js backend retrieves the unique FCM device tokens stored against each donor's profile and passes them to the FCM API with a structured SOS payload containing the blood group required, the requesting facility's name, and a timestamp. FCM handles delivery to the target devices, even in cases where the donor's application is running in the background. The sub-one-second alert delivery time documented by Santhanalakshmi et al. (2025) using a comparable Firebase implementation informed the selection of FCM as the preferred notification channel for this project.

Google Maps API: The Google Maps JavaScript API was integrated to provide geolocation and distance calculation capabilities. Each donor registration record captured the donor's geographic coordinates at the point of registration, and each hospital profile stored its facility coordinates. When a blood shortage triggered the donor-sourcing module, the backend queried the Google Maps API to compute the Euclidean distance between the requesting hospital and each candidate donor in the filtered result set. Donors were then ranked in ascending order of distance, and only those falling within the configured proximity threshold were included in the SOS dispatch. This approach ensured that notification effort was concentrated on donors who were physically capable of responding within a clinically useful timeframe, rather than broadcasting indiscriminately to all registered donors of a compatible blood type regardless of location.

3.3 Database Design

The database was designed to function as the single authoritative source of data for the entire blood supply chain. All donor records, blood inventory units, hospital profiles, user credentials, and blood request histories were to be stored, retrieved, and updated through a single, centralized data store rather than distributed across isolated facility-level systems. This centralization was the foundational design decision that made real-time inter-facility coordination possible. The schema was normalized to Third Normal Form (3NF) to eliminate data redundancy and prevent update anomalies. In practical terms, this meant that a change to a donor's contact information or eligibility status needed to be made in exactly one place and would immediately be reflected across all related donation records and request histories, without inconsistency. Five primary collections were defined within the MongoDB implementation, each corresponding to a distinct entity in the system's data model.

The five collections were structured as follows:

Users Table: The Users collection served as the authentication and access control anchor for the entire system. Each document in this collection stored a unique user identifier, a hashed password, an email address, and a role field. The role field accepted one of three enumerated values: Admin, Hospital, or Donor. On every authenticated request, a JSON Web Token issued at login carried the user's ID and role as signed claims. The Express.js middleware layer validated this token and read the role claim to determine which routes and data fields the requesting user was permitted to access. This design meant that access restrictions were enforced at the API layer, not merely at the interface level, preventing unauthorized data exposure even through direct API calls.

Donors Table: The Donors collection stored all demographic and medical profile data for registered blood donors. Each document contained fields for full name, age, ABO/Rh blood group, contact information, geographic coordinates, FCM device token, and the LastDonationDate field. That last field was particularly critical to the system's functioning. The eligibility calculation underpinning the SOS dispatch was performed in real time by comparing the current request date against the stored LastDonationDate value. Any donor whose last recorded donation fell within the preceding 90 days was automatically excluded from the eligible pool, regardless of blood type compatibility. The Donors collection maintained a one-to-many relationship with the Blood_Inventory collection, as a single registered donor could contribute multiple units across separate donation events over their participation lifetime.

Blood_Inventory Table: The Blood_Inventory collection was the operational core of the stock management module. Rather than tracking aggregate quantities by blood group, the design tracked individual blood units as discrete documents, each carrying its own unit identifier, blood group, ABO/Rh type, collection date, expiration date, current status, and a reference to the Donation_ID from which it was derived. This unit-level traceability was intentional. It allowed the system to reserve a specific unit against a specific request rather than decrementing a generic count, which eliminated the ambiguity that arises when two simultaneous requests compete for the same blood type. The expiration date field was indexed, enabling the automated alert module to efficiently query for units approaching or past their expiry threshold without performing a full collection scan.

Hospitals Table: The Hospitals collection stored the profile data for each registered healthcare facility within the network. Each document included the facility name, address, contact information, and geographic coordinates in a format compatible with the Google Maps API distance calculations performed during the donor-matching process. The Hospitals collection maintained a one-to-many relationship with the Requests collection, reflecting the real-world dynamic in which a single facility generates multiple blood requests over time. The geographic coordinate data stored here served as the origin point for all proximity calculations during emergency sourcing events.

Requests Table: The Requests collection captured and tracked every blood request submitted through the system. Each document stored the requesting hospital's identifier, the blood group and quantity required, the urgency level, the submission timestamp, and a status field that progressed through enumerated states: Pending, Fulfilled, or Cancelled. The urgency level field allowed the administrative dashboard to surface critical requests above routine ones in the interface queue. The status field was updated in real time as the fulfillment pipeline progressed, providing hospital staff and administrators with live visibility into the state of each outstanding request. Fulfilled requests retained their complete record for audit and reporting purposes, providing a queryable history of the system's responsiveness over time.

3.4 System Design

Three design models were developed to document the behavioral and structural characteristics of the BBMS before implementation: a Use Case Diagram defining actor-system interactions, a Sequence Diagram mapping the time-ordered message flow during the blood request lifecycle, and a System Flowchart describing the operational processing pipeline. Each model served a distinct purpose in communicating the system's intended behavior to different audiences, from end-users to development engineers.

3.4.1 Use Case Diagram

The Use Case Diagram was developed to define the boundary between the system and its external actors, and to specify which system functions each actor was permitted to initiate. Three primary actors were identified from the requirements specification: the Donor, the Hospital, and the Admin. Each actor interacted with a distinct set of use cases, and the boundaries between their access sets were enforced through the role-based access control layer described in Section 3.3.

The Donor Actor: The Donor was the primary supply-side participant in the system. Use cases assigned to this actor included registering a donor profile with demographic and medical data, viewing a personalized dashboard displaying their blood group, donation history, and next eligibility date, and receiving push notifications via the FCM-powered SOS alert system when an emergency matched their blood type and proximity profile. Donors could also update their contact details and geographic coordinates to ensure accurate proximity calculations during future matching events.

The Hospital Actor: The Hospital actor represented the demand side of the blood supply chain. Use cases for this actor included submitting blood requests specifying blood group, required quantity, and urgency level, querying the live inventory dashboard to check the availability of specific blood types across the network, viewing the real-time status of submitted requests as they progressed through the fulfillment pipeline, and updating the status of blood units received to confirm delivery and close the request cycle. Hospital access was restricted to demand-side operations. Hospital actors could not modify donor records or access administrative audit functions.

The Admin Actor: The Admin actor held the broadest set of system permissions and was responsible for the overall governance of the platform. Use cases assigned to this actor included approving or rejecting new hospital and donor registration requests, managing the system-wide blood inventory including adding new units and retiring expired ones, generating comprehensive inventory and request fulfillment reports for health authority audit purposes, and monitoring system-level activity logs for security and compliance purposes. The Admin was the only actor with visibility across all collections and all facilities simultaneously, providing the network-wide oversight that the manual system had entirely lacked.

3.4.2 Sequence Diagram (Blood Request & Fulfillment Logic)

A Sequence Diagram was constructed to model the precise, time-ordered message exchanges between system components during the blood request and fulfillment lifecycle. This diagram was particularly important because the most critical feature of the BBMS, the two-path fulfillment logic, involved interactions across five distinct system entities: the Hospital user interface in React, the Node.js/Express.js backend, the MongoDB database, the Google Maps API, and Firebase Cloud Messaging. The diagram made these interactions explicit and verifiable before implementation began.

The sequence was organized into two alternate paths. In Path A, a hospital user submitted a blood request through the React dashboard. The frontend dispatched a POST request to the Node.js API. The backend queried the Blood_Inventory collection in MongoDB for units matching the specified blood group and verified their expiry status. Where a compatible, non-expired unit was found, its status was updated to Reserved in the database, and a 200 OK fulfillment confirmation was returned to the React dashboard, updating the hospital's request status in real time. Simple. Fast. Done.

Path B handled the more complex case. Where the MongoDB inventory query returned null, the backend triggered the Greedy Algorithm module. This module queried the Donors collection for individuals with a compatible blood type whose LastDonationDate was at least 90 days prior to the request date. The backend then called the Google Maps API to retrieve the geographic coordinates of the requesting hospital and computed the Euclidean distance to each candidate donor. Donors were ranked by proximity, and those falling within the configured threshold were selected for notification. Their registered FCM device tokens were passed to the Firebase Cloud Messaging service, which broadcast a structured SOS alert to their mobile devices. As donors accepted the request, the hospital's live dashboard was updated in real time to reflect the evolving fulfillment status.

3.4.3 System Flowchart

The System Flowchart described the operational processing pipeline of the BBMS at a higher level of abstraction than the Sequence Diagram, focusing on the flow of data through the system's three functional stages rather than the message exchanges between specific components. The flowchart was organized around three processing stages: Input, Processing, and Output.

Input Stage: The system received data from two primary input sources: web-based registration forms submitted by donors and hospitals, and blood request forms submitted by hospital staff during operational use. Before any submitted data was persisted to the database, it passed through a server-side validation layer implemented in the Express.js middleware. This layer checked for completeness, rejecting any submission that omitted required fields, and performed type validation to prevent erroneous data from entering the collections. Duplicate detection was also applied at this stage, particularly for donor registrations, to prevent multiple profiles being created for the same individual. Only data that passed all validation checks was written to MongoDB. Rejected submissions returned descriptive error responses to the frontend to guide the user in correcting their input.

Processing Stage: The processing stage encompassed all the computational logic executed by the Node.js backend in response to validated inputs. For blood request events, this stage executed the inventory query and, where necessary, the Greedy Algorithm donor-matching module described in Section 3.1. For routine operational events, the processing stage evaluated all blood unit expiry dates against the current system date and flagged units within a configurable number of days of expiry for alert generation. The donor eligibility calculation was also performed here: for each potential donor in a matching query, the system computed the difference between the current date and the stored LastDonationDate value and excluded any donor whose interval fell below the 90-day clinical minimum. Critically, this calculation was performed dynamically on every query rather than stored as a static flag, ensuring that eligibility status always reflected the actual date at the moment of the request.

Output Stage: The output stage produced two categories of result. For fulfillment events, the output was a real-time update to the hospital dashboard reflecting the new request status, accompanied by a database write updating the relevant blood unit's status to Reserved. For emergency sourcing events, the output was an FCM push notification delivered to the selected donors' mobile devices, combined with a dashboard status update indicating that SOS alerts had been dispatched and the request was awaiting donor response. For inventory alerts, the output was a notification surfaced on the Admin dashboard identifying units requiring urgent attention before expiry. All outputs were designed to update in real time without requiring the user to manually refresh their dashboard, ensuring that the supply-to-demand information chain remained continuously synchronized across all connected actors in the system.

REFERENCES

Adams, R., & Kaur, M. (2020). The impact of AI in emergency blood request handling. Journal of Medical Systems and Artificial Intelligence, 12(4), 88–94.(https://www.ijirset.com/upload/2025/march/175_Blood1.pdf)

Agu, P. U., Udo, A. I., & Emelike, C. (2024). Assessment of quality assurance level and compliance of Abia state blood banks to national guideline on blood transfusion: A multi-centred study. Auctores Online, 7(18), 1–8. https://auctoresonline.org/article/assessment-of-quality-assurance-level-and-compliance-of-abia-state-blood-banks-to-national-guideline-on-blood-transfusion-a-multi-centred-study

Ajzen, I. (2011). The theory of planned behavior: Reactions and reflections. Psychology & Health, 26(9), 1113–1127.

Alharbi, F. (2020). Blood donation management system using K-Nearest neighbor. Global Scientific Journal, 8(5), 1102–1110.(https://www.globalscientificjournal.com/researchpaper/Blood_donation_management_system_using_K_Nearest_neighbor.pdf)

Curren, R., & Ryan, R. M. (2020). Self-determination theory: A fundamental theory of donor motivation and behavioral regulation. International Journal of Administration, Business and Management, 6(2), 148–155. https://jurnal.itsm.ac.id/index.php/abm/article/download/1233/1040

Dhanani, A., & Verma, S. (2020). Development of blood management system application: An automated approach for transfusion safety. International Journal for Research in Applied Science and Engineering Technology (IJRASET). https://www.ijraset.com/research-paper/development-of-blood-management-system-application

Khan, I., Jiya, Krishan, Tanwar, Y., & Yadav, P. (2024). A comprehensive blood bank management system for efficient resource and staff handling in service centers. International Journal of Granthaalayah, 12(12), 15–22. https://www.granthaalayahpublication.org/journals/granthaalayah/article/download/6120/5932?inline=1

Le, H. T., Nguyen, L. T. T., Nguyen, T. A., & Duong-Trung, N. (2022). BloodChain: A blood donation network managed by blockchain technologies. IEEE Xplore.(https://ieeexplore.ieee.org/document/11005103)

Nath, A. P., Biju, A. S., Sam, S. G., & Suresh, S. (2023). Blood and organ donation management system. International Journal of Novel Research and Development (IJNRD), 8(4), d172–d177. https://www.ijnrd.org/papers/IJNRD2304322.pdf

Ovri, S. O., Shobowale, T., & Edewhor, V. (2023). Automated blood management system: Streamlining search, inventory, and patient care information administration. Niger Delta Journal of Library and Information Science, 4(2), 49–56. https://ndjlis.fuotuoke.edu.ng/index.php/ndjlis/article/view/52/49

Oye, N. D., et al. (2020). Web-based blood management system codenamed Bloodcare: A Waterfall adaptation for Nigerian hospitals. ER Publications, 13(5), 71–79.(http://www.er-journal.com/papers/BLOODCARE%20Manuscript.pdf)

Patil, A., Nandre, S., Varma, S., Doli, S., & Manorma. (2025). An AI-driven blood bank donation and management system: An integrated framework for matching, prediction, anomaly detection, and inventory optimization. International Journal of Innovative Science and Research Technology, 10(12), 2135–2137.(https://ijisrt.com/assets/upload/files/IJISRT25DEC1102.pdf)

Santhanalakshmi, K., Dhivyasri, R., Jothisri, S., & Indira, M. (2025). i’Donate: Digital blood donation and emergency SOS platform. International Journal of Scientific Research and Engineering Development, 8(6), 72–80.(https://ijsred.com/volume8/issue6/IJSRED-V8I6P72.pdf)

Silva, J., et al. (2025). MHealth technology as a tool to promote blood donation: Pilot study of engagement among young donors. Proceedings of the International Conference on mHealth Innovations. https://pmc.ncbi.nlm.nih.gov/articles/PMC10563464/

Zhao, X., & Fernandez, T. (2020). Blockchain technology in blood donation systems: Decentralized ledgers for data integrity. IJARCCE, 9(3), 12254–12260.(https://ijarcce.com/wp-content/uploads/2023/03/IJARCCE.2023.12254.pdf)