"I want to audit this project against my Supreme Architecture Rules.

Task: Read the .cursorrules file in the root directory first. Then, scan the entire codebase (@Codebase) to verify compliance.

REPORT CARD:

1. ARCHITECTURE INTEGRITY:

[ ] Backend: Are Controllers free of business logic? (Check 2 random controllers).

[ ] Frontend: Are features separated into src/features/*?

[ ] Layering: Is there a clear separation between API and Services?

2. CLEAN CODE VIOLATIONS:

[ ] Imports: Scan for any ../../ (deep relative imports).

[ ] Types: Scan for usage of any.

[ ] Styles: Check for inline styles or css files (should be Tailwind).

3. VERDICT:

List specific files that violate the rules.

Give a score from 0 to 10.

If score < 10, provide a specific 'Fix List' to resolve the issues."