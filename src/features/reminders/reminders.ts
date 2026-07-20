import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { catalog } from '@/content/catalog';
import { localDateKey } from '@/features/stats/streak';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

// Günlük yerel hatırlatıcı (PLAN §8). Push sunucusu yok.
// Tek-atımlık 7 bildirim (reminder-0..6) planlanır; her açılış/seans sonrası
// yeniden senkronlanır — bugün seans yapıldıysa bugünün bildirimi kurulmaz
// ("uygulama açılınca o günün bildirimi iptal" kuralı).
// Devam eden program varsa metin programın sıradaki gününü söyler (deep link'li).

const MESSAGES: Record<'tr' | 'en', { title: string; body: string }[]> = {
  tr: [
    { title: 'Kısa bir mola?', body: '2 dakikan varsa bir nefes egzersizi seni bekliyor.' },
    { title: 'Bugünü yumuşat', body: 'Kısa bir seansla zihnine alan aç.' },
    { title: 'Sakin bir an', body: 'Hazır olduğunda başla — birkaç dakika yeter.' },
    { title: 'Nefes hatırlatması', body: 'Dört say al, altı say ver. Gerisi kolay.' },
    { title: 'Kendine bir dakika', body: 'Gün ne kadar dolu olsa da bir dakikan var.' },
    { title: 'Akşam ritüeli', body: 'Uykudan önce zihnini yavaşlatmak ister misin?' },
    { title: 'Küçük bir duraklama', body: 'Bir seans, günün geri kalanını değiştirebilir.' },
    { title: 'Yanındayız', body: 'Bugün nasıl hissediyorsan öyle gel.' },
    { title: 'Sessiz bir köşe', body: 'Kulaklığını tak, birkaç dakikalığına kaybol.' },
    { title: 'Bugünün seansı hazır', body: 'Sana uygun bir öneri seni bekliyor.' },
  ],
  en: [
    { title: 'A short pause?', body: 'A breathing exercise is waiting if you have 2 minutes.' },
    { title: 'Soften the day', body: 'Make room in your mind with a short session.' },
    { title: 'A calm moment', body: "Begin when you're ready — a few minutes is enough." },
    { title: 'Breath reminder', body: 'In for four, out for six. The rest is easy.' },
    { title: 'A minute for you', body: 'However full the day is, you have one minute.' },
    { title: 'Evening ritual', body: 'Slow your mind down before sleep?' },
    { title: 'A small pause', body: 'One session can change the rest of the day.' },
    { title: "We're here", body: 'Come as you feel today.' },
    { title: 'A quiet corner', body: 'Put on your headphones and drift for a few minutes.' },
    { title: "Today's session is ready", body: 'A suggestion picked for you is waiting.' },
  ],
};

const REMINDER_IDS = Array.from({ length: 7 }, (_, i) => `reminder-${i}`);

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function cancelDailyReminders(): Promise<void> {
  await Promise.all(
    REMINDER_IDS.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})),
  );
}

/** Devam eden program varsa {program, sıradaki gün no}; yoksa null. */
function activeProgramDay(): { title: string; day: number; programId: string } | null {
  const programs = useProgress.getState().programs;
  for (const program of catalog.programs) {
    const progress = programs[program.id];
    if (!progress) continue;
    if (progress.completedDays.length >= program.days.length) continue;
    const lang = require('@/i18n').default.language === 'en' ? 'en' : 'tr'; // eslint-disable-line @typescript-eslint/no-require-imports
    return { title: program.title[lang as 'tr' | 'en'], day: progress.unlockedDay + 1, programId: program.id };
  }
  return null;
}

/**
 * Önümüzdeki 7 günü tek-atımlık bildirimlerle planlar.
 * Açılışta, ayar değişince ve seans tamamlanınca çağrılır.
 */
export async function syncDailyReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await cancelDailyReminders();
    const { reminder } = useSettings.getState();
    if (!reminder.enabled) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;

    const { default: i18n } = await import('@/i18n');
    const en = i18n.language === 'en';
    const pool = MESSAGES[en ? 'en' : 'tr'];
    const program = activeProgramDay();
    const today = localDateKey(new Date());
    const doneToday = useStats.getState().streak.lastActiveDate === today;
    const start = Math.floor(Math.random() * pool.length);

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(reminder.hour, reminder.minute, 0, 0);
      if (date.getTime() <= Date.now()) continue; // saat geçtiyse o günü atla
      if (i === 0 && doneToday) continue; // bugün zaten meditasyon yapıldı

      // Program sürüyorsa ilk bildirim programın sıradaki gününü çağırır
      const content =
        program && i === 0
          ? {
              title: en ? `${program.title} · Day ${program.day}` : `${program.title} · Gün ${program.day}`,
              body: en ? 'Your next session is ready.' : 'Sıradaki seansın hazır.',
              sound: false as const,
              data: { url: `/program/${program.programId}` },
            }
          : {
              ...pool[(start + i) % pool.length],
              sound: false as const,
              data: { url: '/' },
            };

      await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_IDS[i],
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  } catch {
    // bildirim planlaması kritik değil
  }
}

/** Eski API ile uyumluluk: ayar ekranı/onboarding çağırır. */
export async function scheduleDailyReminder(_hour: number, _minute: number): Promise<void> {
  await syncDailyReminders();
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await cancelDailyReminders();
}
