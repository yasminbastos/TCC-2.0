package com.zella.app

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class BackgroundSosHeadlessService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig {
    val data = Arguments.createMap().apply {
      putDouble("triggeredAt", intent?.getDoubleExtra("triggeredAt", 0.0) ?: 0.0)
    }
    return HeadlessJsTaskConfig(
      "ZellaBackgroundSosTask",
      data,
      60_000L,
      true
    )
  }
}
