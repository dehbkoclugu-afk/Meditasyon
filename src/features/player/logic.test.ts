import { fadeVolume, findProgramDay, isSessionCompleted, sleepTimerSeconds } from './logic';
import { catalog } from '@/content/catalog';

describe('isSessionCompleted', () => {
  it('%80 eşiği', () => {
    expect(isSessionCompleted(480, 600)).toBe(true);
    expect(isSessionCompleted(479, 600)).toBe(false);
    expect(isSessionCompleted(10, 0)).toBe(false);
  });
});

describe('findProgramDay', () => {
  it('program gününü bulur', () => {
    const hit = findProgramDay(catalog, 'baslangic-gun-3');
    expect(hit?.program.id).toBe('baslangic');
    expect(hit?.dayIndex).toBe(2);
  });

  it('program dışı seansta null döner', () => {
    expect(findProgramDay(catalog, 'uykuya-yumusak-gecis')).toBeNull();
  });
});

describe('sleepTimerSeconds', () => {
  it('dakika seçimleri ve seans sonu', () => {
    expect(sleepTimerSeconds(10, 0, 900)).toBe(600);
    expect(sleepTimerSeconds('end', 300, 900)).toBe(600);
    expect(sleepTimerSeconds(null, 0, 900)).toBeNull();
  });
});

describe('fadeVolume', () => {
  it('lineer iner, negatife düşmez', () => {
    expect(fadeVolume(0, 10)).toBe(1);
    expect(fadeVolume(5, 10)).toBe(0.5);
    expect(fadeVolume(12, 10)).toBe(0);
  });
});
