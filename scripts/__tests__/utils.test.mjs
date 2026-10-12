import { describe, it, expect } from '@jest/globals';
import { lddGroupNames } from '../utils.js';

describe('lddGroupNames', () => {
  it('strips the number prefix', () => {
    expect(lddGroupNames('010.Titles')).toBe('Titles');
  });

  it('replaces all underscores with spaces', () => {
    expect(lddGroupNames('140.Key_Figures')).toBe('Key Figures');
    expect(lddGroupNames('150.Key_Figures_and_more')).toBe(
      'Key Figures / more',
    );
    expect(lddGroupNames('160.Very_Long_Group_Name')).toBe(
      'Very Long Group Name',
    );
  });

  it('turns the first _and_ into a slash', () => {
    expect(lddGroupNames('130.Hosting_and_Components')).toBe(
      'Hosting / Components',
    );
  });
});
