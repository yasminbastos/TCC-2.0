package com.zella.app

import android.content.Context
import android.content.Intent
import android.os.SystemClock
import com.facebook.react.HeadlessJsTaskService

object VolumeUpSosTrigger {
  private const val REQUIRED_PRESSES = 3
  private const val PRESS_WINDOW_MS = 3_000L
  private const val TRIGGER_COOLDOWN_MS = 5_000L

  private var pressCount = 0
  private var sequenceStartedAt = 0L
  private var lastTriggerAt = 0L

  @Synchronized
  fun recordVolumeUp(context: Context, eventTime: Long = SystemClock.elapsedRealtime()) {
    if (!BackgroundSosService.isEnabled(context)) return
    if (eventTime - lastTriggerAt < TRIGGER_COOLDOWN_MS) return

    if (sequenceStartedAt == 0L || eventTime - sequenceStartedAt > PRESS_WINDOW_MS) {
      sequenceStartedAt = eventTime
      pressCount = 1
      return
    }

    pressCount += 1
    if (pressCount < REQUIRED_PRESSES) return

    pressCount = 0
    sequenceStartedAt = 0L
    lastTriggerAt = eventTime

    val taskIntent = Intent(context, BackgroundSosHeadlessService::class.java)
      .putExtra("triggeredAt", eventTime.toDouble())
    HeadlessJsTaskService.acquireWakeLockNow(context)
    context.startService(taskIntent)
  }
}
