# Enterprise Content Agent (Automation Anywhere Demo)

This example is adapted from the [LangChain Deep Agents content builder example](https://github.com/langchain-ai/deepagents/tree/main/examples/content-builder-agent) and modified to demonstrate an **Enterprise AI Copilot** deployed on **TrueFoundry**.

It showcases:

- Structured enterprise content generation  
- Research delegation via subagents  
- File-based persistence  
- Web search integration  
- TrueFoundry service deployment  
- FastAPI backend + Streamlit frontend  

---

# What This Agent Demonstrates

This project is designed for enterprise demos (e.g., Automation Anywhere brown bag sessions, customer workshops).

It demonstrates:

- Executive brief generation  
- Presales talk tracks  
- Technical runbooks  
- AI governance positioning  
- Web-grounded research  
- Structured file outputs  
- Deployment on Kubernetes via TrueFoundry  

---

# Architecture Overview

This agent is defined using three filesystem primitives from DeepAgents:

| Primitive | File | Purpose |
|------------|------|----------|
| Memory | `AGENTS.md` | Defines enterprise AI copilot behavior and tone |
| Skills | `skills/enterprise-content.md` | Mode-switching structured workflows |
| Subagents | `subagents.yaml` | Research delegation using web search |

The agent is wired together in `content_agent.py`.

---

# Repository Structure

.
├── AGENTS.md
├── skills/
│ └── enterprise-content.md
├── subagents.yaml
├── content_agent.py # FastAPI backend
├── streamlit_app.py # Streamlit frontend
├── truefoundry.yaml # Deployment configuration
└── requirements.txt

---

# How It Works

## 1️⃣ User Submits Request

Via Streamlit UI or API.

Examples:
- Executive brief  
- Customer presentation script  
- Implementation guide  
- Governance-focused talk track  

---

## 2️⃣ Skill Mode Selection

The `enterprise-content` skill supports:

- Executive Brief  
- Presales Talk Track  
- Solution Runbook  

Mode is inferred from user intent.

---

## 3️⃣ Research Delegation (Optional)

If research is required:

- The agent delegates to the `researcher` subagent  
- `web_search` tool is used  
- Results are saved under:

research/<slug>/post.md

---

## 4️⃣ Structured Content Generation

The main agent:

- Produces enterprise-ready structured output  
- Calls `write_file(...)`  
- Saves output to:

briefs/<slug>/post.md
talk-tracks/<slug>/post.md
runbooks/<slug>/post.md

---

## 5️⃣ Optional Image Generation

If required, the agent calls:

generate_enterprise_image(...)

Saved to:

<platform>/<slug>/image.png

---

## 6️⃣ Streamlit Displays Results

The UI:

- Displays assistant output  
- Fetches generated files from FastAPI `/files`  
- Renders markdown preview  

---

# Deployment on TrueFoundry

This service is deployed using `truefoundry.yaml`.

### High-Level Deployment Flow

1. GitHub repository is cloned  
2. Image is built (on TrueFoundry cluster if configured)  
3. Image pushed to container registry  
4. Kubernetes Deployment is updated  
5. Pods are rolled out  
6. Service endpoint is exposed  

This runs as a Kubernetes workload in your TrueFoundry workspace.

---

# Quick Start (Local)

## 1️⃣ Set Environment Variables

```bash
export TFY_API_KEY="..."
export TFY_BASE_URL="..."
export MAIN_LLM_MODEL="..."
export IMAGE_MODEL="..."
export TAVILY_API_KEY="..."   # Optional (for web search)
```

Or use a .env file.

## 2️⃣ Run FastAPI Backend
```bash
uvicorn content_agent:app --reload
```

## 3️⃣ Run Streamlit UI
```bash
streamlit run streamlit_app.py
```

# Example Prompts

- Prepare a 5-minute customer presentation script on how LLMs and Automation Anywhere bots work together.  
- Draft a structured implementation guide for securely deploying an AI copilot with Automation Anywhere.  
- Create a customer-facing talk track focused on AI governance and data protection.  

---

# Output Structure

research/
└── <slug>/
└── post.md

briefs/
└── <slug>/
└── post.md

talk-tracks/
└── <slug>/
└── post.md

runbooks/
└── <slug>/
├── post.md
└── image.png (optional)

---

# Security Considerations

- The agent writes files to the configured `OUTPUT_DIR`  
- Web search may retrieve external content  
- Structured output can be combined with AI Gateway guardrails  
- Output validation and redaction should be enforced at the platform layer  

---

# Requirements

- Python 3.11+  
- TrueFoundry API access  
- `TFY_API_KEY`  
- `MAIN_LLM_MODEL`  
- `IMAGE_MODEL`  
- `TAVILY_API_KEY` (optional for web search)  

---

# Extending the Agent

## Add a New Skill

Create:

skills/<new-skill>/SKILL.md

## Add a New Subagent

Modify `subagents.yaml`.

## Add a New Tool

Define with `@tool` in `content_agent.py` and add to `tools=[...]`.