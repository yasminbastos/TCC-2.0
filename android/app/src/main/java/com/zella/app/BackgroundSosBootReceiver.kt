package com.zella.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class BackgroundSosBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (!BackgroundSosService.isEnabled(context)) return
    try {
      ContextCompat.startForegroundService(
        context,
        Intent(context, BackgroundSosService::class.java)
      )
    } catch (_: Exception) {
      // Some Android versions/OEMs defer foreground services after boot.
      // The app starts it again the next time the user opens Zella.
    }
  }
}
