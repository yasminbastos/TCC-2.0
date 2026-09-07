package com.zella.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

class BackgroundSosService : Service() {
  companion object {
    private const val PREFS = "zella_background_sos"
    private const val PREF_ENABLED = "enabled"
    private const val CHANNEL_ID = "zella-background-sos"
    private const val NOTIFICATION_ID = 7401
    private const val EVENT_DEBOUNCE_MS = 80L

    fun setEnabled(context: Context, enabled: Boolean) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .edit()
        .putBoolean(PREF_ENABLED, enabled)
        .apply()
    }

    fun isEnabled(context: Context): Boolean =
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getBoolean(PREF_ENABLED, false)
  }

  private var receiverRegistered = false
  private var lastEventAt = 0L

  private val volumeReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      if (intent?.action != "android.media.VOLUME_CHANGED_ACTION") return
      if (MainActivity.isInForeground) return
      val currentVolume = intent.getIntExtra("android.media.EXTRA_VOLUME_STREAM_VALUE", -1)
      val previousVolume = intent.getIntExtra("android.media.EXTRA_PREV_VOLUME_STREAM_VALUE", -1)
      if (currentVolume < 0 || previousVolume < 0 || currentVolume <= previousVolume) return

      val now = SystemClock.elapsedRealtime()
      if (now - lastEventAt < EVENT_DEBOUNCE_MS) return
      lastEventAt = now
      VolumeUpSosTrigger.recordVolumeUp(this@BackgroundSosService, now)
    }
  }

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()

    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = PendingIntent.getActivity(
      this,
      0,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.notification_icon)
      .setContentTitle("Proteção SOS ativa")
      .setContentText("O Zella está monitorando os botões de volume.")
      .setContentIntent(pendingIntent)
      .setOngoing(true)
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()

    val foregroundType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION or
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
    } else {
      0
    }
    ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, foregroundType)
    registerVolumeReceiver()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (!isEnabled(this)) {
      stopSelf()
      return START_NOT_STICKY
    }
    return START_STICKY
  }

  override fun onDestroy() {
    if (receiverRegistered) {
      unregisterReceiver(volumeReceiver)
      receiverRegistered = false
    }
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun registerVolumeReceiver() {
    if (receiverRegistered) return
    val filter = IntentFilter("android.media.VOLUME_CHANGED_ACTION")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(volumeReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("DEPRECATION")
      registerReceiver(volumeReceiver, filter)
    }
    receiverRegistered = true
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Proteção SOS em segundo plano",
      NotificationManager.IMPORTANCE_LOW
    ).apply {
      description = "Mantém o acionamento do SOS pelos botões de volume ativo."
      setSound(null, null)
      enableVibration(false)
    }
    getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }

}
