/**
 * Accessibility testing utilities using axe-core
 */
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export { axe };

