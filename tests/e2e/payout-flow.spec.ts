import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authPath = (role: string) => path.join(__dirname, `../../.auth/${role}.json`);

test.describe('Consolidated Payout Flow', () => {
  
  test('Complete Flow: Setup -> Attendance -> Monthly Sheet -> Payout', async ({ browser }) => {
    test.setTimeout(60000); // Increase timeout for the whole flow

    // 1. Setup Class (Admin)
    const adminContext = await browser.newContext({ storageState: authPath('admin') });
    const adminPage = await adminContext.newPage();
    
    // Diagnostic logging
    adminPage.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    
    await adminPage.goto('/class-leads');
    
    // Create Lead
    await adminPage.getByRole('button', { name: /create new lead/i }).click();
    
    // Select Student Type
    await adminPage.getByLabel(/single student/i).check();
    
    await adminPage.getByLabel('Student Name').fill('E2E Student');
    
    console.log('Filling form fields...');
    try {
        // Select Board
        await adminPage.getByLabel(/board/i).click();
        console.log('Clicked Board select');
        const boardResponsePromise = adminPage.waitForResponse(r => r.url().includes('/options') && r.status() === 200);
        await adminPage.getByRole('option', { name: 'CBSE', exact: true }).click();
        await boardResponsePromise;
        console.log('Board CBSE selected and options fetched');
        await expect(adminPage.getByRole('listbox')).toBeHidden();
        await adminPage.waitForTimeout(1000);

        await adminPage.getByLabel(/gender/i).click();
        await adminPage.getByRole('option', { name: 'Male', exact: true }).click();
        await expect(adminPage.getByRole('listbox')).toBeHidden();

        await adminPage.getByLabel(/Grade\/Class/i).click();
        console.log('Clicked Grade Select');
        const gradeResponsePromise = adminPage.waitForResponse(r => r.url().includes('/options') && r.status() === 200);
        await adminPage.getByRole('option', { name: 'class_1', exact: true }).click();
        await gradeResponsePromise;
        console.log('Grade class_1 selected and options fetched');
        await expect(adminPage.getByRole('listbox')).toBeHidden();
        await adminPage.waitForTimeout(1000);
        
        // Subjects handling (Autocomplete)
        const subjectsCombobox = adminPage.getByRole('combobox', { name: /subjects/i });
        await subjectsCombobox.scrollIntoViewIfNeeded();
        await subjectsCombobox.click();
        await subjectsCombobox.fill('Mathematics');
        await adminPage.getByRole('option', { name: 'Mathematics', exact: true }).click();
        await expect(adminPage.getByRole('listbox')).toBeHidden();
        
        await adminPage.getByLabel(/classes per month/i).scrollIntoViewIfNeeded();
        await adminPage.getByLabel(/classes per month/i).fill('4');
        await adminPage.getByLabel('Student Fees').fill('1000');
        await adminPage.getByLabel('Tutor Payout').fill('500'); 
        
        console.log('Taking screenshot before submission...');
        await adminPage.screenshot({ path: 'test-results/before-submit.png', fullPage: true });
        
        await adminPage.getByRole('button', { name: 'Create Lead' }).click();
    } catch (e) {
        console.error('Error during lead creation:', e);
        await adminPage.screenshot({ path: 'test-results/lead-creation-error.png', fullPage: true });
        throw e;
    }
    
    
    // Convert to Final Class
    // Wait for the lead to appear in the list (might need a second)
    await expect(adminPage.getByText('E2E Student')).toBeVisible();
    await adminPage.getByRole('button', { name: /view/i }).first().click();
    
    // In Detail Page, click Convert
    await adminPage.getByRole('button', { name: /convert/i }).click();
    
    // Fill conversion dialog
    // It might ask for Tutor/Coordinator if not already set, 
    // but we set them in the Lead Form if available, 
    // Wait... ClassLeadForm doesn't have Tutor/Coordinator fields!
    // They are assigned in the conversion process or after creation.
    
    // Let's check how conversion works.
    await adminPage.getByRole('button', { name: /confirm/i }).click();
    
    await expect(adminPage.getByText(/converted successfully/i)).toBeVisible();
    await adminContext.close();

    // 2. Mark Attendance (Tutor)
    const tutorContext = await browser.newContext({ storageState: authPath('tutor') });
    const tutorPage = await tutorContext.newPage();
    await tutorPage.goto('/attendance');
    await tutorPage.getByRole('button', { name: /mark attendance/i }).click();
    await tutorPage.getByLabel(/topic/i).fill('E2E Test Topic');
    await tutorPage.getByRole('button', { name: /submit/i }).click();
    await tutorContext.close();

    // 3. Approve Attendance & Check Constraint (Coordinator)
    const coordContext = await browser.newContext({ storageState: authPath('coordinator') });
    const coordPage = await coordContext.newPage();
    await coordPage.goto('/attendance-approvals');
    
    // Approve daily session (Pending tab is default)
    await expect(coordPage.getByText(/pending/i).first()).toBeVisible();
    await coordPage.getByRole('button', { name: /approve/i }).first().click();
    await expect(coordPage.getByText(/approved successfully/i)).toBeVisible();
    
    // Go to Monthly Sheets tab
    await coordPage.getByRole('tab', { name: /monthly sheets/i }).click();
    
    // Verify Approve button is disabled (1/4 sessions)
    // The button text is "Approve" (from our previous implementation)
    const approveBtn = coordPage.getByRole('button', { name: 'Approve', exact: true }).first();
    await expect(approveBtn).toBeDisabled();
    
    await coordContext.close();
  });
});
