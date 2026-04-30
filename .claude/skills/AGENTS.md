# Skills Organization & Usage Guide

## Skills Directory Structure

Skills are organized into categories for easy access and context management.

---

## Category Overview

| Category | Path | Skills Count |
|----------|------|-------------|
| **Design & Frontend** | `.claude/skills/deploy/01-DESIGN/` | 5 |
| **Security** | `.claude/skills/deploy/02-SECURITY/` | 2 |
| **Debug & Testing** | `.claude/skills/deploy/03-DEBUG/` | 2 |
| **Backend** | `.claude/skills/deploy/04-BACKEND/` | 4 |
| **Process** | `.claude/skills/deploy/05-PROCESS/` | 6 |

---

## 01-DESIGN (Design & Frontend)

**Purpose:** UI/UX design, frontend development, React patterns

| Skill | Trigger Keywords | Description |
|-------|-----------------|-------------|
| `frontend-design` | "build UI", "create component", "design" | Creative, distinctive frontend interfaces |
| `frontend-patterns` | "React patterns", "component" | General frontend patterns |
| `tailwind-design-system` | "Tailwind", "design tokens" | Tailwind v4 patterns |
| `web-design-guidelines` | "accessibility", "a11y", "review UI" | Accessibility/UX audit |
| `vercel-react-best-practices` | "React", "performance", "Next.js" | 60+ Vercel React rules |

---

## 02-SECURITY (Security)

**Purpose:** Security auditing, vulnerability scanning

| Skill | Trigger Keywords | Description |
|-------|-----------------|-------------|
| `security-review` | "auth", "API", "secrets", "security" | Security checklist for code |
| `security-scan` | "vulnerability", "scan", "audit" | Vulnerability scanning |

---

## 03-DEBUG (Debug & Testing)

**Purpose:** Debugging, test-driven development

| Skill | Trigger Keywords | Description |
|-------|-----------------|-------------|
| `systematic-debugging` | "bug", "debug", "error" | Debugging methodology |
| `tdd-workflow` | "test", "TDD", "write tests" | Test-driven development |

---

## 04-BACKEND (Backend)

**Purpose:** Backend development, deployment, database

| Skill | Trigger Keywords | Description |
|-------|-----------------|-------------|
| `backend-patterns` | "NestJS", "TypeORM", "backend" | NestJS/TypeORM patterns |
| `fullstack-developer` | "web app", "API", "fullstack" | Full-stack architecture |
| `deployment-patterns` | "deploy", "Docker", "Vercel" | Deployment patterns |
| `python-patterns` | "Python", "scripts" | Python automation |

---

## 05-PROCESS (Process)

**Purpose:** Workflow, code quality, continuous improvement

| Skill | Trigger Keywords | Description |
|-------|-----------------|-------------|
| `brainstorming` | "requirements", "explore", "design" | Requirements exploration |
| `coding-standards` | "best practices", "standards" | TS/JS coding standards |
| `continuous-learning` | "extract patterns", "learn" | Save learnings as skills |
| `requesting-code-review` | "review", "quality" | Code review |
| `subagent-driven-development` | "implement", "delegate" | Multi-agent execution |
| `verification-loop` | "verify", "check" | Session verification |

---

## Workflow Stages & Skill Invocation

### Stage 1: Requirements & Planning
**Duration:** Session start - 5-10 min

```
/brainstorming     # Explore requirements
/frontend-design  # Visual direction
```

### Stage 2: Implementation
**Duration:** 30 min - 2 hours

```
/tdd-workflow                 # Write tests first
/frontend-design             # UI implementation
/coding-standards           # Code quality
/security-review (if API)  # Security for endpoints
```

### Stage 3: Security Audit
**Duration:** 10-15 min (per endpoint)

```
/security-review    # Checklist for auth/input
/security-scan    # Vulnerability scan
```

### Stage 4: Verification
**Duration:** 10-20 min

```
/verification-loop    # Session verification
/requesting-code-review # Quality check
```

### Stage 5: Deployment
**Duration:** 15-30 min

```
/deployment-patterns    # Docker/Vercel
/python-patterns     # Scripts (if needed)
```

---

## How Skills Load

Skills load **contextually** based on keywords in your prompt. Only 3-5 skills load per conversation.

### Best Practice

1. **Don't manually load all skills** - let contextual loading work
2. **Use slash commands** for explicit invocation
3. **Invoke security skills explicitly** - don't rely on auto-load

### Context Window Strategy

- Max 20 skills in project config
- Active: 5-8 per session
- Security skills: invoke explicitly

---

## Commands Reference

### Design Commands
| Command | Category | When |
|---------|----------|------|
| `/frontend-design` | 01-DESIGN | Build distinctive UI components |
| `/web-design-guidelines` | 01-DESIGN | A11y/UX audit |
| `/tailwind-design-system` | 01-DESIGN | Tailwind patterns |

### Security Commands
| Command | Category | When |
|---------|----------|------|
| `/security-review` | 02-SECURITY | Review auth/API code |
| `/security-scan` | 02-SECURITY | Vulnerability scan |

### Debug Commands
| Command | Category | When |
|---------|----------|------|
| `/systematic-debugging` | 03-DEBUG | Debug methodology |
| `/tdd` | 03-DEBUG | Test-driven development |

### Backend Commands
| Command | Category | When |
|---------|----------|------|
| `/backend-patterns` | 04-BACKEND | NestJS/TypeORM |
| `/deployment-patterns` | 04-BACKEND | Docker/Vercel |

### Process Commands
| Command | Category | When |
|---------|----------|------|
| `/brainstorming` | 05-PROCESS | Explore requirements |
| `/verification-loop` | 05-PROCESS | Check session progress |
| `/requesting-code-review` | 05-PROCESS | Quality verification |

---

## Total Skills: 19

organized in 5 categories