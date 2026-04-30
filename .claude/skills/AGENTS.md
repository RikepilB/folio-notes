# Skills Workflow & Usage Report

## Current Skills Inventory (20 Total)

### Design & Frontend (Category A)
| Skill | Trigger Keyword | Purpose |
|-------|----------------|---------|
| **frontend-design** | "build UI", "create component", "design" | Creative, distinctive frontend |
| **tailwind-design-system** | "Tailwind", "design tokens" | Tailwind v4 patterns |
| **web-design-guidelines** | "accessibility", "a11y", "review UI" | A11y/UX audit |
| **frontend-patterns** | "React patterns", "component" | General frontend patterns |
| **vercel-react-best-practices** | "React", "performance", "Next.js" | 60+ performance rules |

### Development (Category B)
| Skill | Trigger Keyword | Purpose |
|-------|----------------|---------|
| **fullstack-developer** | "web app", "API", "fullstack" | Full-stack architecture |
| **backend-patterns** | "NestJS", "TypeORM", "backend" | NestJS/TypeORM patterns |
| **coding-standards** | "best practices", "standards" | TS/JS coding standards |
| **python-patterns** | "Python", "scripts" | Python automation |

### Security (Category C - NEW)
| Skill | Trigger Keyword | Purpose |
|-------|----------------|---------|
| **security-review** | "auth", "API", "secrets", "security" | Security checklist |
| **security-scan** | "vulnerability", "scan", "audit" | Vulnerability scanning |

### TDD & Testing (Category D)
| Skill | Trigger Keyword | Purpose |
|-------|----------------|---------|
| **tdd-workflow** | "test", "TDD", "write tests" | Test-driven development |
| **systematic-debugging** | "bug", "debug", "error" | Debugging methodology |

### Process (Category E)
| Skill | Trigger Keyword | Purpose |
|-------|----------------|---------|
| **brainstorming** | "requirements", "explore", "design" | Requirements exploration |
| **requesting-code-review** | "review", "quality" | Code review |
| **continuous-learning** | "extract patterns", "learn" | Save learnings |
| **subagent-driven-development** | "implement", "delegate" | Multi-agent execution |
| **verification-loop** | "verify", "check" | Session verification |
| **deployment-patterns** | "deploy", "Docker", "Vercel" | Deployment |

---

## Workflow Stages & Skill Invocation

### Stage 1: Requirements & Planning
**Duration:** Session start - 5-10 min

**Skills to Load:**
```
/brainstorming     # Explore requirements
/frontend-design  # Visual direction
```

**Prompts:**
- "Use /brainstorming to explore requirements for [feature]"
- "Use /frontend-design to define aesthetic direction for [page]"

**Auto-Load Triggers:**
- Any prompt mentioning "requirements", "explore", "design UI"
- Keywords: "create", "build", "new feature"

---

### Stage 2: Implementation
**Duration:** 30 min - 2 hours

**Skills to Load:**
```
/tdd-workflow                 # Write tests first
/frontend-design             # UI implementation
/coding-standards           # Code quality
/security-review (if API)  # Security for endpoints
```

**Prompts:**
- "Use TDD to implement [feature]"
- "Create UI using /frontend-design principles"
- "Add security-review to this endpoint"

**Auto-Load Triggers:**
- Keywords: "implement", "test", "create component"
- Auth/API routes → security-review auto-loads

---

### Stage 3: Security Audit
**Duration:** 10-15 min (per endpoint)

**Skills to Load:**
```
/security-review    # Checklist for auth/input
/security-scan    # Vulnerability scan
```

**Prompts:**
- "Run /security-review on [code]"
- "Use /security-scan to find vulnerabilities"

**When to Invoke:**
- Every new API endpoint
- Authentication/authorization code
- File upload handling
- Payment/sensitive features

---

### Stage 4: Verification
**Duration:** 10-20 min

**Skills to Load:**
```
/verification-loop    # Session verification
/requesting-code-review # Quality check
```

**Prompts:**
- "Use /verification-loop to check progress"
- "Run /requesting-code-review on [file]"

**Auto-Load Triggers:**
- Keywords: "verify", "check", "review"

---

### Stage 5: Deployment
**Duration:** 15-30 min

**Skills to Load:**
```
/deployment-patterns    # Docker/Vercel
/python-patterns     # Scripts (if needed)
```

**Prompts:**
- "Configure deployment using /deployment-patterns"
- "Use python-patterns for [automation]"

**When to Invoke:**
- Docker configuration
- Vercel/Railway deployment
- CI/CD pipeline

---

## Daily Usage Pattern

### Morning Session Start (5 min)
```
1. Load /brainstorming if starting new feature
2. Run /verification-loop to check previous state
3. Continue working
```

### Mid-Session Work (30-60 min)
```
1. TDD workflow: /tdd-workflow
2. Implementation: /frontend-design + /coding-standards
3. Security (if API): /security-review
4. Testing: /tdd-workflow
```

### Session End (10 min)
```
1. Run /verification-loop
2. Continuous learning auto-saves patterns
3. Stop hook persists context
```

---

## Skill Loading Optimization

### How Skills Actually Load

Skills load **contextually** based on keywords in your prompt. Only 3-5 skills load per conversation.

### Best Practice

1. **Don't manually load all skills** - let contextual loading work
2. **Use slash commands** for explicit invocation
3. **Invoke security skills explicitly** - don't rely on auto-load

### Context Window Strategy

- Max 20 skills in project config
- Active: 5-8 per session
- Security skills: invoke explicitly per the longform guide

---

## Commands Reference

### Design Commands
| Command | When |
|---------|------|
| `/frontend-design` | Build distinctive UI components |
| `/web-design-guidelines` | A11y/UX audit |

### Development Commands
| Command | When |
|---------|------|
| `/tdd` | Test-driven feature development |
| `/e2e` | End-to-end testing |
| `/test-coverage` | Check coverage |

### Security Commands
| Command | When |
|---------|------|
| `/security-review` | Review auth/API code |
| `/security-scan` | Vulnerability scan |

### Process Commands
| Command | When |
|---------|------|
| `/brainstorming` | Explore requirements |
| `/verification-loop` | Check session progress |
| `/requesting-code-review` | Quality verification |
| `/refactor-clean` | Clean dead code |

---

## Skill Staging by Project Phase

### Phase 1: Discovery (Week 1)
- /brainstorming
- /frontend-design
- /web-design-guidelines

### Phase 2: MVP Build (Week 2-4)
- /tdd-workflow
- /frontend-design
- /coding-standards
- /security-review

### Phase 3: Security Hardening (Week 5)
- /security-scan
- /security-review
- /requesting-code-review

### Phase 4: Production (Week 6+)
- /deployment-patterns
- /verification-loop

---

## Summary

**Skills at Your Disposal:** 20

**Recommended Invocations Per Session:**
- Design: 1-2 skills (frontend-design, web-design-guidelines)
- Implementation: 2-3 skills (tdd-workflow, coding-standards)
- Security: 1-2 skills (security-review when needed)
- Process: 1-2 skills (verification-loop, requesting-code-review)

**Total Active Per Session:** 5-8 skills max (optimal)

**Security Always:** Explicitly invoke for auth, APIs, secrets