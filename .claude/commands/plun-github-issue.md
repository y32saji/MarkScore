Please analyze and plan the implementation for the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files and dependencies
4. Break down the work into manageable sub-issues
5. Create implementation sub-issues using this naming convention:
   - `[TASK] <specific implementation detail>` for individual tasks
   - `[SUBTASK] <component-specific work>` for smaller items
   - `[TEST] <testing requirements>` for test-related work
6. Link sub-issues to parent with "Part of #<issue_number>"
7. Add appropriate labels (enhancement, bug, task, etc.)
8. Convert original issue to Epic/Parent issue with task checklist
9. Assign milestones and projects if applicable

Sub-issue naming examples:
- `[TASK] Implement music notation parser for treble clef`
- `[SUBTASK] Add SVG path generation for quarter notes`
- `[TEST] Create unit tests for note duration parsing`

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
