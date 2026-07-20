import { activeDaysThisWeek, advanceStreak, effectiveStreak, localDateKey } from './streak';

const empty = { current: 0, best: 0, lastActiveDate: null };

describe('advanceStreak', () => {
  it('ilk seans seriyi 1 yapar', () => {
    expect(advanceStreak(empty, '2026-07-18')).toEqual({
      current: 1,
      best: 1,
      lastActiveDate: '2026-07-18',
    });
  });

  it('ardışık gün +1, aynı gün değişmez', () => {
    const day1 = advanceStreak(empty, '2026-07-18');
    const sameDay = advanceStreak(day1, '2026-07-18');
    expect(sameDay.current).toBe(1);
    const day2 = advanceStreak(day1, '2026-07-19');
    expect(day2.current).toBe(2);
    expect(day2.best).toBe(2);
  });

  it('gün atlanınca 1e döner, best kalır', () => {
    const s = advanceStreak(
      { current: 5, best: 5, lastActiveDate: '2026-07-18' },
      '2026-07-21',
    );
    expect(s.current).toBe(1);
    expect(s.best).toBe(5);
  });

  it('ay sınırında ardışıklık doğru', () => {
    const s = advanceStreak({ current: 3, best: 3, lastActiveDate: '2026-07-31' }, '2026-08-01');
    expect(s.current).toBe(4);
  });
});

describe('effectiveStreak', () => {
  it('dün aktifse seri sürer, 2+ gün geçtiyse 0', () => {
    const s = { current: 4, best: 6, lastActiveDate: '2026-07-17' };
    expect(effectiveStreak(s, '2026-07-18')).toBe(4);
    expect(effectiveStreak(s, '2026-07-20')).toBe(0);
  });
});

describe('localDateKey', () => {
  it('yerel günü YYYY-MM-DD üretir', () => {
    expect(localDateKey(new Date(2026, 6, 18, 23, 59))).toBe('2026-07-18');
  });
});

describe('activeDaysThisWeek', () => {
  it('pazartesiden bugüne sayar', () => {
    // 2026-07-20 Pazartesi
    expect(activeDaysThisWeek(['2026-07-19', '2026-07-20'], '2026-07-20')).toBe(1);
    expect(activeDaysThisWeek(['2026-07-20', '2026-07-21', '2026-07-25'], '2026-07-22')).toBe(2);
  });
});
