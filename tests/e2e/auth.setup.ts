import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roles = [
  { name: 'admin', email: 'admin@test.com', password: 'Password@123' },
  { name: 'coordinator', email: 'coordinator@test.com', password: 'Password@123' },
  { name: 'tutor', email: 'tutor@test.com', password: 'Password@123' },
  { name: 'parent', email: 'parent@test.com', password: 'Password@123' },
];

for (const role of roles) {
  const authFile = path.join(__dirname, `../../.auth/${role.name}.json`);

  setup(`authenticate as ${role.name}`, async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(role.email);
    await page.locator('input[name="password"]').fill(role.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Handle "Terms and Conditions" modal if it appears
    const termsModal = page.getByText(/Terms and Conditions/i);
    if (await termsModal.isVisible({ timeout: 10000 }).catch(() => false)) {
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: /Accept and Continue/i }).click();
      await expect(termsModal).toBeHidden();
    }

    // Wait for navigation and verify we are logged in (e.g., check for dashboard or logout button)
    await expect(page).not.toHaveURL(/.*login.*/);
    
    // End of authentication steps.
    await page.context().storageState({ path: authFile });
  });
}
