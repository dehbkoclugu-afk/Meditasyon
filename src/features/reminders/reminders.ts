import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Günlük yerel hatırlatıcı (PLAN.md §8). Push sunucusu yok.
// Nazik metin havuzu — suçluluk kurmaz (PRODUCT.md yasakları).

const MESSAGES: { title: string; body: string }[] = [
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
];

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
  // Aynı saatte günlük tetikleyici; metin çeşitliliği için hafta günü kadranı
  const start = Math.floor(Math.random() * MESSAGES.length);
  for (let day = 0; day < 7; day++) {
    const message = MESSAGES[(start + day) % MESSAGES.length];
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
