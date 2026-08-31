package expo.modules.systemaccent

import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Exposes Android 12's Material You palette (API 31).
 *
 * The wallpaper seed color itself is never handed to apps — the system keeps it and publishes
 * the tonal palettes it derived from it as framework color resources. `system_accent1_*` is the
 * primary ramp, and Material 3's dynamic color scheme maps tone 600 to `primary` in light themes
 * and tone 200 in dark ones (dark surfaces need the lighter tone to stay legible), which is what
 * this returns. Both are read at once so JS can switch between them without another round trip.
 *
 * Returns null below API 31, and on devices whose OEM skin doesn't ship dynamic color the ramp
 * is a static blue fallback rather than an error — indistinguishable from a blue wallpaper here.
 */
class ExpoSystemAccentModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSystemAccent")

    Function("getPalette") {
      val context = appContext.reactContext ?: return@Function null
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return@Function null

      mapOf(
        "light" to context.colorHex(android.R.color.system_accent1_600),
        "dark" to context.colorHex(android.R.color.system_accent1_200),
      )
    }
  }
}

/** Framework colors are opaque, so the alpha byte is dropped rather than encoded. */
private fun Context.colorHex(resId: Int): String =
  String.format("#%06X", 0xFFFFFF and resources.getColor(resId, theme))
