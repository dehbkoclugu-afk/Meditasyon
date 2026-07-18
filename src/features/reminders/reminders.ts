import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Günlük yerel hatırlatıcı (PLAN.md §8). Push sunucusu yok.
// Nazik metin havuzu — suçluluk kurmaz (PRODUCT.md yasakları).

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

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Günlük hatırlatıcıyı (yeniden) planlar; 7 günü dönen metinlerle doldurur. */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  // Metin dili o anki uygulama diline göre seçilir
  const { default: i18n } = await import('@/i18n');
  const pool = MESSAGES[i18n.language === 'en' ? 'en' : 'tr'];
  // Aynı saatte günlük tetikleyici; metin çeşitliliği için hafta günü kadranı
  const start = Math.floor(Math.random() * pool.length);
  for (let day = 0; day < 7; day++) {
    const message = pool[(start + day) % pool.length];
    await Notifications.scheduleNotificationAsync({
      content: { title: message.title, body: message.body, sound: false },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: (day % 7) + 1, // 1 = Pazar (expo-notifications sözleşmesi)
        hour,
        minute,
      },
    });
  }
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
