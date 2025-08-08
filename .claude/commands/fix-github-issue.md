Please implement and fix the GitHub issue: $ARGUMENTS.

This command is designed to work with task issues created by `/plun-github-issue`. Follow GitHub best practices throughout the implementation.

## Implementation Workflow

### 1. Issue Analysis
- Use `gh issue view <issue_number>` to get issue details
- Check if issue is part of an Epic (look for "Part of #X" in description)
- Verify issue status and assignee
- Understand acceptance criteria and requirements

### 2. Branch Management
- Create feature branch: `git checkout -b issue-<number>-<short-description>`
- For task types:
  - `[TASK]` → `git checkout -b task/<issue-number>-<description>`
  - `[SUBTASK]` → `git checkout -b subtask/<issue-number>-<description>`
  - `[TEST]` → `git checkout -b test/<issue-number>-<description>`

### 3. Implementation
- Search codebase for relevant files and dependencies
- Follow project conventions from CLAUDE.md
- Implement changes incrementally
- Use TodoWrite tool to track implementation progress
- Follow TypeScript strict mode and project coding standards

### 4. Testing & Validation
- Run existing tests: `npm run test`
- Add new tests as specified in issue requirements
- Run type checking: `npm run typecheck`
- Run linting: `npm run lint`
- Fix any issues before proceeding
- For E2E tasks: `npm run test:e2e`

### 5. Code Quality
- Ensure code follows project conventions (2-space indentation, strict TypeScript)
- Add proper type definitions with `I` prefix for interfaces
- Use descriptive variable names for musical elements
- No comments unless explicitly required
- Verify accessibility attributes for SVG elements

### 6. Commit & PR Workflow
- Stage changes: `git add .`
- Create meaningful commit message following conventional commits:
  - `feat: implement <feature>` for new features
  - `fix: resolve <issue>` for bug fixes  
  - `test: add <test-description>` for tests
  - `refactor: improve <component>` for refactoring
- Link to issue: `git commit -m "<message> (#<issue-number>)"`
- Push branch: `git push -u origin <branch-name>`

### 7. Pull Request Creation
- Create PR linking to issue: `gh pr create --title "<type>: <description> (#<issue-number>)" --body "Closes #<issue-number>"`
- Add PR description with:
  - Summary of changes
  - Testing performed
  - Breaking changes (if any)
  - Screenshots/demos (for UI changes)
- Request review if applicable
- Link to parent Epic if part of larger task

### 8. Issue Management
- Update issue with progress comments
- Mark issue as complete when merged
- Update Epic checklist if part of larger task
- Close issue with `gh issue close <issue-number> --comment "Implemented in PR #<pr-number>"`

## Task-Specific Guidelines

### [TASK] Issues
- Focus on core implementation
- Ensure feature completeness
- Include integration tests
- Update documentation if needed

### [SUBTASK] Issues  
- Implement specific component
- Ensure compatibility with main task
- Include unit tests for component
- Follow existing architectural patterns

### [TEST] Issues
- Achieve specified coverage requirements
- Include both positive and negative test cases
- Add performance benchmarks if specified
- Mock external dependencies appropriately
- Add visual regression tests for SVG rendering

## Best Practices
- Always run full test suite before committing
- Use meaningful commit messages with issue references
- Keep changes focused and atomic
- Update Epic progress when completing sub-issues
- Follow security best practices (no secrets in code)
- Ensure accessibility compliance for SVG output
- Use GitHub CLI for all GitHub operations

Remember: This workflow integrates with the task breakdown created by `/plun-github-issue` for comprehensive project management.
