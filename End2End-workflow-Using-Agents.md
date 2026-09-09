# End-to-End QA Workflow with Natural Language

## Workflow Overview

This prompt guides you through a complete 6-step QA workflow using MCP servers and AI agents to go from user story to committed automated test scripts.

**Prerequisites:**
- Playwright MCP server configured (`.vscode/mcp.json`)
- Custom agents available: `playwright-test-planner`, `playwright-test-generator`, `playwright-test-healer`
- A user story file under `UserStory/`

---

## 🎯 STEP 1: Read User Story

**Prompt:**
```
I need to start a new testing workflow. Please read the user story from the file:
UserStory/SCRUM-101-E-commerce-Checkout-Process.md
Summarize the key requirements, acceptance criteria, and testing scope.
```

**Expected Output:**
- Summary of the user story
- List of acceptance criteria
- Application URL and test credentials
- Key features to test

---

## 📝 STEP 2: Create Test Plan

**Prompt:**
```
Based on the user story SCRUM-101 that we just reviewed, use the playwright-test-planner
agent to:

1. Read the application URL and test credentials from the user story
2. Use Playwright MCP browser tools to explore the application and understand all workflows mentioned in the acceptance criteria
3. Create a comprehensive test plan that covers all acceptance criteria including:
   - Happy path scenarios
   - Negative scenarios (validation errors, empty fields, invalid data)
   - Edge cases and boundary conditions
   - Navigation flow tests
   - UI element validation

4. Save the test plan as: specs/AgentDemoPlane-checkout-test-plan.md

Ensure each test scenario includes:
- Clear test case title
- Detailed step-by-step instructions
- Expected results for each step
- Test data requirements
```

**Expected Output:**
- Complete test plan markdown file saved to specs/AgentDemoPlane-checkout-test-plan.md
- Organized test scenarios with clear structure
- Browser exploration screenshots (if needed)

---

## 🔎 STEP 3: Perform Exploratory Testing

**Prompt:**
```
Now I need to perform manual exploratory testing using Playwright MCP browser tools.

Please read the test plan from: specs/AgentDemoPlane-checkout-test-plan.md

Then execute the test scenarios defined in that plan:
1. Use Playwright browser tools to manually execute each test scenario from the plan
2. Follow the step-by-step instructions in each test case
3. Verify expected results match actual results
4. Take screenshots at key steps and error states
5. Document your findings:
   - Test execution results for each scenario
   - Any UI inconsistencies or unexpected behaviors
   - Missing validations or bugs discovered
   - Screenshots as evidence
```

**Expected Output:**
- Manual test execution results
- Screenshots of the application at various states
- List of observations and findings
- Any issues discovered during exploration

---

## ⚙️ STEP 4: Generate Automation Scripts

**Prompt:**
```
Now I need to create automated test scripts using the playwright-test-generator agent.

Please review:
1. Test plan from: specs/AgentDemoPlane-checkout-test-plan.md (for test scenarios and steps)
2. Exploratory testing results from Step 3 (for actual element selectors and UI insights)

Using insights from the manual exploratory testing:
- Leverage the element selectors and locators that were successfully used in Step 3
- Use stable element properties (IDs, data attributes, roles) discovered during exploration
- Apply wait strategies and UI behaviors observed during manual testing
- Incorporate any workarounds for UI quirks discovered

Generate Playwright JavaScript automation scripts:
1. Create scripts for each test scenario from the test plan
2. Organize scripts into appropriate test suite files in: tests/AgentDemo-Test-checkout/
3. Use the test case names and steps from the test plan
4. Use reliable selectors and strategies from exploratory testing

Requirements for all scripts:
- Follow Playwright best practices
- Include proper assertions using expect()
- Use descriptive test names matching the format in the test plan
- Use robust element selectors discovered during manual testing
- Add comments for complex steps
- Use proper wait strategies based on actual application behavior
- Add proper test hooks (beforeEach, afterEach)
- Configure for one browser (Chrome)

After generating the scripts, run the tests to verify they pass.
```

**Expected Output:**
- Test suite files created in tests/AgentDemo-Test-checkout/ based on test plan scenarios
- Scripts using robust selectors discovered during exploratory testing
- All scripts follow Playwright best practices
- Initial test generation complete

---

## 🔧 STEP 5: Execute and Heal Automation Tests

**Prompt:**
```
Now I need to execute the generated automation scripts and heal any failures using the
playwright-test-healer agent.

1. Run all automation scripts in: tests/AgentDemo-Test-checkout/
2. Identify any failing tests
3. For each failing test, use the playwright-test-healer agent to:
   - Analyze the failure (selector issues, timing issues, assertion failures)
   - Auto-heal the test by fixing selectors, adding waits, or adjusting assertions
   - Update the test script with the fixes
4. Re-run the healed tests to verify they pass
5. Repeat the heal process until all tests are stable and passing
6. Document:
   - Initial test results (pass/fail count)
   - Healing activities performed
   - Final test results after healing
   - Any tests that couldn't be auto-healed
```

**Expected Output:**
- All automation tests executed
- Failing tests identified and healed using test-healer agent
- Healed test scripts updated in tests/AgentDemo-Test-checkout/
- Final stable test execution results
- Summary of healing activities performed

---

## 📊 STEP 6: Create Test Report

**Prompt:**
```
Now I need to generate a comprehensive test execution report summarizing the entire
QA workflow for SCRUM-101.

Please review:
1. The user story and acceptance criteria from Step 1
2. The test plan from: specs/AgentDemoPlane-checkout-test-plan.md
3. The manual exploratory testing results from Step 3
4. The automated test results and healing activities from Step 5

Create a complete test execution report and save it as:
test-results/SCRUM-101-checkout-test-report.md

The report must include:
1. Executive Summary (overall status, test counts, pass/fail metrics, coverage %)
2. Manual Test Results (exploratory testing details per scenario, with element
   selectors discovered and any observations)
3. Automated Test Results:
   - Initial test execution results (before healing)
   - Healing activities performed (root cause, fix applied, result for each issue)
   - Final test execution results (after healing) with a pass-rate table per suite
4. Defects Log (critical/high/medium/low priority, or "0 defects found")
5. Test Coverage Analysis:
   - Acceptance criteria coverage matrix (manual vs automated tests per AC)
   - Test type coverage breakdown
   - Coverage gaps and recommendations for future testing
6. Summary and Recommendations:
   - Overall quality assessment
   - Key achievements
   - Risk assessment (functional, regression, performance, security)
   - Immediate action items and future enhancements
   - Sign-off / production readiness recommendation
7. Appendix:
   - Test environment details
   - Test file structure
   - Full element selector reference

Use clear markdown formatting with tables, checkmarks (✅/❌), and headers so the
report is easy to scan by both technical and non-technical stakeholders.
```

**Expected Output:**
- Complete test execution report saved to test-results/
- Clear pass/fail metrics and coverage matrix
- Documented healing activities and root causes
- Actionable recommendations and a final sign-off status

---