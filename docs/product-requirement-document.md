Interactive Physiology & ECG Learning Simulator

Product Requirement Document (PRD)

Version: 0.1
Project Status: Concept Development
Target Users: Medical Students and Healthcare Learners

⸻

1. Product Overview

1.1 Product Name

Interactive Physiology & ECG Learning Simulator

⸻

1.2 Vision Statement

The goal of this project is to build an interactive medical education platform that allows medical students to intuitively understand physiological mechanisms, pathological changes, and clinical manifestations through dynamic simulation.

Traditional medical education often relies on static textbooks, diagrams, and memorization. However, human physiology is a continuously changing dynamic system.

This project aims to create a learning environment where students can:

“Understand how diseases develop and manifest, rather than simply memorize clinical findings.”

The platform will combine:

* Physiological simulation
* Interactive visualization
* Artificial intelligence tutoring
* Clinical reasoning training
* Gamified medical education

⸻

2. Background and Problem Statement

2.1 Current Challenges in Medical Education

Challenge 1: Lack of Dynamic Understanding

Many medical concepts are difficult because students only see the final outcome.

For example:

Students learn:

Myocardial infarction
        ↓
ST elevation
        ↓
Chest pain

However, they often struggle to understand the complete mechanism:

Coronary artery occlusion
        ↓
Reduced oxygen supply
        ↓
ATP depletion
        ↓
Ion channel dysfunction
        ↓
Altered cardiac action potential
        ↓
Electrical conduction abnormality
        ↓
12-lead ECG changes
        ↓
Clinical symptoms

The connection between molecular mechanisms and clinical findings is often missing.

⸻

Challenge 2: ECG Learning Is Highly Abstract

Medical students commonly struggle with:

* Understanding ECG waveforms
* Connecting electrical activity with cardiac anatomy
* Explaining why specific leads show specific changes
* Understanding pathological ECG evolution

Current learning methods are mainly:

* Static ECG images
* Text explanations
* Memorization-based approaches

There is a need for an interactive ECG learning environment.

⸻

3. Product Objectives

The product aims to:

1. Visualize physiological processes dynamically.
2. Connect cellular mechanisms with clinical manifestations.
3. Allow students to manipulate disease parameters.
4. Generate realistic ECG changes.
5. Provide AI-based medical explanations.
6. Train clinical reasoning skills.

⸻

4. Target Users

Primary Users

Medical Students

Including:

* Undergraduate medical students
* Clinical medicine students
* Medical exam candidates

Secondary Users

* Nursing students
* Physician assistant students
* Medical educators
* Clinical instructors

⸻

5. Core Product Features

⸻

Feature 1: Interactive 12-Lead ECG Simulator

Description

A real-time ECG simulation engine that generates dynamic ECG changes based on physiological parameters.

Users can modify:

Cardiac Parameters

* Heart rate
* Rhythm
* Conduction velocity
* Electrical axis

Disease Parameters

* Degree of ischemia
* Electrolyte abnormalities
* Myocardial injury level
* Conduction abnormalities

The system dynamically generates:

* P wave changes
* PR interval changes
* QRS morphology
* ST segment changes
* T wave abnormalities

⸻

Example Scenario: Acute Myocardial Infarction Simulation

User adjusts:

Coronary artery occlusion:
20%
50%
100%

The simulator displays:

Cellular Level

Oxygen deprivation
↓
ATP reduction
↓
Ion pump dysfunction
↓
Membrane potential alteration

⸻

Electrical Level

Altered action potential
↓
Injury current
↓
ST segment elevation
↓
ECG abnormality

⸻

Clinical Level

Chest pain
+
Diaphoresis
+
Elevated cardiac biomarkers

⸻

Feature 2: Physiological Mechanism Visualization

Description

A visualization engine connecting:

Molecular Mechanism
        ↓
Cellular Function
        ↓
Organ Physiology
        ↓
Clinical Manifestation

⸻

Example: Hyperkalemia Simulation

Input:

Serum potassium:
5 mmol/L
7 mmol/L
9 mmol/L

Visualization:

Increased extracellular potassium
↓
Reduced potassium gradient
↓
Altered resting membrane potential
↓
Reduced conduction velocity
↓
ECG changes

Expected ECG findings:

* Tall peaked T waves
* PR prolongation
* QRS widening
* Risk of cardiac arrest

⸻

Feature 3: Disease Simulation Engine

Description

A modular disease simulation framework.

Each disease module contains:

Disease Model
+
Physiological Parameters
+
ECG Effects
+
Clinical Symptoms
+
Learning Explanation

⸻

Initial Disease Modules

Cardiovascular

* Acute myocardial infarction
* Hyperkalemia
* Hypokalemia
* Atrial fibrillation
* Heart block

Respiratory

* Asthma
* COPD
* Pulmonary embolism

Endocrine

* Diabetes mellitus
* Thyroid disorders

Future modules can be added through a standardized disease database.

⸻

Feature 4: AI Medical Tutor

Description

An AI agent that provides personalized medical explanations.

The AI tutor can:

* Explain mechanisms
* Answer medical questions
* Provide clinical reasoning support
* Generate practice questions
* Identify knowledge gaps

⸻

Example Interaction

Student:

Why does hyperkalemia cause peaked T waves?

AI:

High extracellular potassium reduces
the potassium concentration gradient
across cardiac cell membranes.
This accelerates repolarization,
leading to increased T-wave amplitude.

⸻

Feature 5: Clinical Case Simulation Mode

Description

Transform physiological simulation into clinical decision training.

The student interacts with virtual patients.

⸻

Example Case

Patient:

65-year-old male
Chief complaint:
Chest pain for 2 hours
ECG:
ST elevation in anterior leads

Student tasks:

1. Interpret ECG
2. Identify diagnosis
3. Request investigations
4. Decide management

AI evaluates:

* Diagnostic accuracy
* Clinical reasoning
* Safety of decisions
* Knowledge application

⸻

6. User Experience Design

Design Philosophy

The platform should feel like:

* A medical simulator
* A strategy game
* A flight simulator

The user should actively control and observe:

Disease Process
        ↓
Physiological Changes
        ↓
ECG Manifestation
        ↓
Clinical Decision

⸻

7. Minimum Viable Product (MVP)

Version 0.1 Goal

Build a functional prototype demonstrating the core concept.

⸻

MVP Components

Module 1: ECG Renderer

Capabilities:

* Generate normal ECG
* Generate abnormal ECG patterns
* Display 12-lead ECG

⸻

Module 2: One Disease Simulation

Recommended first disease:

Acute Myocardial Infarction

Requirements:

* Coronary occlusion parameter
* Ischemic area visualization
* ST elevation generation
* Mechanism explanation

⸻

Module 3: Educational Explanation Panel

Display:

What changed?
↓
Why did it change?
↓
How does it appear clinically?

⸻

8. Technical Requirements

Frontend

Possible technologies:

* React
* TypeScript
* Three.js
* WebGL
* D3.js

Responsibilities:

* User interface
* Interactive visualization
* ECG rendering

⸻

Backend

Possible technologies:

* Python
* FastAPI

Responsibilities:

* Simulation engine
* Disease models
* AI integration

⸻

Artificial Intelligence Layer

Possible models:

* GPT API
* Claude API
* Local Large Language Models

Responsibilities:

* Medical explanation
* Clinical reasoning
* Personalized tutoring

⸻

Database

Store:

Disease Knowledge Base
+
Physiological Parameters
+
Clinical Cases
+
User Learning Data

⸻

9. Future Development Roadmap

⸻

Version 1.0

Expand disease library:

* More ECG abnormalities
* More physiological simulations
* More clinical cases

⸻

Version 2.0

Virtual Hospital Simulation:

Features:

* Patient admission
* History taking
* Physical examination
* Investigation ordering
* Treatment decisions

⸻

Version 3.0

AI Medical Training Ecosystem:

Architecture:

Medical Knowledge Base
        +
Clinical Guidelines
        +
AI Agents
        +
Patient Simulation
        +
Learning Analytics
        ↓
Personalized Medical Education Platform

⸻

10. Success Metrics

The project will be successful if users can:

Learning Outcomes

* Better understand physiological mechanisms
* Improve ECG interpretation ability
* Improve clinical reasoning skills

Product Outcomes

* Higher engagement compared with textbook learning
* Increased confidence before clinical placement
* Ability to safely practice clinical decisions

⸻

11. Long-Term Vision

The long-term goal is to create:

“A flight simulator for medical education.”

Just as pilots train in simulated environments before flying real aircraft, medical students should be able to practice diagnosis and decision-making in realistic virtual clinical environments.

The platform aims to become an AI-powered medical education ecosystem combining:

* Physiology simulation
* Clinical reasoning
* Artificial intelligence
* Personalized learning

⸻

Initial Git Commit Message

Initial PRD: Interactive Physiology and ECG Learning Simulator

⸻

这个版本可以直接放入 GitHub，让 Agent 读取。下一步建议不要让 AI 直接 coding，而是让它生成：

Based on this PRD, design the software architecture, database schema, and MVP development roadmap.

这样 AI 会先成为你的产品架构师，而不是直接生成一堆不可维护的代码。
