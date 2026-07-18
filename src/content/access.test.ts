import { canAccessProgramDay, canAccessSession } from './access';

describe('canAccessSession', () => {
  it('ücretsiz içerik herkese açık', () => {
    expect(canAccessSession({ access: 'free' }, false)).toBe(true);
  });

  it('premium içerik abonesiz kapalı, aboneye açık', () => {
    expect(canAccessSession({ access: 'premium' }, false)).toBe(false);
    expect(canAccessSession({ access: 'premium' }, true)).toBe(true);
  });
});

describe('canAccessProgramDay', () => {
  it('premium programın 1. günü herkese açık (tadına bak)', () => {
    expect(canAccessProgramDay({ access: 'premium' }, 0, false)).toBe(true);
    expect(canAccessProgramDay({ access: 'premium' }, 1, false)).toBe(false);
  });

  it('ücretsiz program ve aboneler için tüm günler açık', () => {
    expect(canAccessProgramDay({ access: 'free' }, 5, false)).toBe(true);
    expect(canAccessProgramDay({ access: 'premium' }, 5, true)).toBe(true);
  });
});
