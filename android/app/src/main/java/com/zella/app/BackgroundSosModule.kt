package com.zella.app

import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BackgroundSosModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "ZellaBackgroundSos"

  @ReactMethod
  fun start(promise: Promise) {
    try {
      BackgroundSosService.setEnabled(reactContext, true)
      ContextCompat.startForegroundService(
        reactContext,
        Intent(reactContext, BackgroundSosService::class.java)
      )
      promise.resolve(true)
    } catch (error: Exception) {
      BackgroundSosService.setEnabled(reactContext, false)
      promise.reject("BACKGROUND_SOS_START_FAILED", error)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    BackgroundSosService.setEnabled(reactContext, false)
    reactContext.stopService(Intent(reactContext, BackgroundSosService::class.java))
    promise.resolve(true)
  }

  @ReactMethod
  fun isEnabled(promise: Promise) {
    promise.resolve(BackgroundSosService.isEnabled(reactContext))
  }

  @ReactMethod
  fun stopIncomingSosAlert(promise: Promise) {
    reactContext.getSystemService(NotificationManager::class.java)
      .cancel(ZellaFirebaseMessagingService.SOS_NOTIFICATION_ID)
    promise.resolve(true)
  }

  @ReactMethod
  fun canUseFullScreenIntent(promise: Promise) {
    val allowed = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      reactContext.getSystemService(NotificationManager::class.java).canUseFullScreenIntent()
    } else {
      true
    }
    promise.resolve(allowed)
  }

  @ReactMethod
  fun openFullScreenIntentSettings(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        val intent = Intent(
          Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT,
          Uri.parse("package:${reactContext.packageName}")
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
      }
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("FULL_SCREEN_SETTINGS_FAILED", error)
    }
  }
}
