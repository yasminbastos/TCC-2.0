package com.zella.app

import android.app.NotificationChannel
import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.RemoteMessage
import expo.modules.notifications.service.ExpoFirebaseMessagingService
import org.json.JSONObject

class ZellaFirebaseMessagingService : ExpoFirebaseMessagingService() {
  companion object {
    private const val SOS_CHANNEL_ID = "sos-emergency-v4"
    const val SOS_NOTIFICATION_ID = 7412
  }

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val sosData = readSosData(remoteMessage)
    if (sosData == null || MainActivity.isInForeground) {
      super.onMessageReceived(remoteMessage)
      return
    }

    showFullScreenSos(remoteMessage, sosData)
  }

  private fun readSosData(remoteMessage: RemoteMessage): JSONObject? {
    return try {
      val data = remoteMessage.data
      val payload = data["body"]?.let(::JSONObject) ?: JSONObject(data as Map<*, *>)
      payload.takeIf { it.optString("type") == "SOS" }
    } catch (_: Exception) {
      null
    }
  }

  private fun showFullScreenSos(remoteMessage: RemoteMessage, data: JSONObject) {
    createSosChannel()

    val senderName = data.optString("senderName").ifBlank { "Contato de confiança" }
    val deepLink = Uri.Builder()
      .scheme("zella")
      .authority("sos-recebido")
      .appendQueryParameter("senderName", senderName)
      .appendQueryParameter("latitude", data.optString("latitude"))
      .appendQueryParameter("longitude", data.optString("longitude"))
      .appendQueryParameter("mapUrl", data.optString("mapUrl"))
      .build()

    val openSosIntent = Intent(Intent.ACTION_VIEW, deepLink, this, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      putExtra(MainActivity.EXTRA_FULL_SCREEN_SOS, true)
    }
    val requestCode = (remoteMessage.messageId ?: System.currentTimeMillis().toString()).hashCode()
    val pendingIntent = PendingIntent.getActivity(
      this,
      requestCode,
      openSosIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(this, SOS_CHANNEL_ID)
      .setSmallIcon(R.drawable.notification_icon)
      .setContentTitle("🚨 ALERTA DE EMERGÊNCIA - ZELLA")
      .setContentText("$senderName precisa de ajuda agora!")
      .setStyle(
        NotificationCompat.BigTextStyle()
          .bigText("$senderName precisa de ajuda agora! Toque para ver a localização.")
      )
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setContentIntent(pendingIntent)
      .setFullScreenIntent(pendingIntent, true)
      .setAutoCancel(false)
      .setOngoing(true)
      .build()

    // Repete o som enquanto a interface do React Native ainda está iniciando.
    // A tela de SOS cancela esta notificação assim que assume o áudio em loop.
    notification.flags = notification.flags or Notification.FLAG_INSISTENT
    getSystemService(NotificationManager::class.java).notify(SOS_NOTIFICATION_ID, notification)
  }

  private fun createSosChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val soundUri = Uri.parse("android.resource://$packageName/${R.raw.sos}")
    val audioAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()
    val channel = NotificationChannel(
      SOS_CHANNEL_ID,
      "Alerta de Emergência SOS",
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "Alertas recebidos de contatos de confiança."
      enableVibration(true)
      vibrationPattern = longArrayOf(0, 500, 250, 500, 250, 500)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      setSound(soundUri, audioAttributes)
    }
    getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }
}
