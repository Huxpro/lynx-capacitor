package org.lynxcapacitor.runtime

import android.app.Activity
import android.app.Application
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.getcapacitor.Bridge
import com.getcapacitor.HeadlessResultListener
import com.getcapacitor.Plugin
import com.getcapacitor.PluginMethod
import com.lynx.react.bridge.Callback
import java.util.concurrent.ConcurrentHashMap
import org.json.JSONArray
import org.json.JSONObject

/** Owns the headless Capacitor Bridge and routes its results to Lynx callbacks. */
object LynxCapacitorRuntime : Application.ActivityLifecycleCallbacks, HeadlessResultListener {
    private const val TAG = "LynxCapacitor"
    private const val GENERATED_REGISTRY =
        "com.lynxcapacitor.generated.LynxCapacitorPluginRegistry"

    private val callbacks = ConcurrentHashMap<String, Callback>()
    @Volatile private var eventSender: ((String) -> Unit)? = null
    @Volatile private var bridge: Bridge? = null
    @Volatile private var bridgeActivity: AppCompatActivity? = null
    @Volatile private var installed = false

    @Synchronized
    fun install(application: Application) {
        if (installed) return
        application.registerActivityLifecycleCallbacks(this)
        installed = true
    }

    fun handleCall(payload: String, callback: Callback) {
        val callbackId = try {
            JSONObject(payload).optString("callbackId", PluginCallIds.DANGLING)
        } catch (error: Exception) {
            callback.invoke(errorResult("-1", "Invalid bridge payload: ${error.message}"))
            return
        }

        if (eventSender == null && callbackId != PluginCallIds.DANGLING) {
            callbacks[callbackId] = callback
        }

        val current = bridge
        if (current == null) {
            callbacks.remove(callbackId)
            callback.invoke(errorResult(callbackId, "No AppCompatActivity is available"))
            return
        }
        current.handleCall(payload)
    }

    fun setEventSender(sender: (String) -> Unit) {
        eventSender = sender
    }

    fun clearEventSender(sender: (String) -> Unit) {
        if (eventSender === sender) eventSender = null
    }

    fun pluginHeaders(): String {
        val headers = JSONArray()
        bridge?.plugins?.forEach { plugin ->
            val methods = JSONArray()
            plugin.methods.forEach { method ->
                val header = JSONObject().put("name", method.name)
                if (method.returnType != PluginMethod.RETURN_NONE) {
                    header.put("rtype", method.returnType)
                }
                methods.put(header)
            }
            headers.put(JSONObject().put("name", plugin.id).put("methods", methods))
        }
        return headers.toString()
    }

    override fun onResult(callbackId: String, resultJson: String) {
        try {
            val result = JSONObject(resultJson)
            val message =
                "LC_RESULT ${result.optString("pluginId")}.${result.optString("methodName")}" +
                    " success=${result.optBoolean("success")} save=${result.optBoolean("save")}"
            if (result.optBoolean("save")) Log.d(TAG, message) else Log.i(TAG, message)
        } catch (_: Exception) {
            Log.i(TAG, "LC_RESULT callback=$callbackId malformed")
        }
        eventSender?.invoke(resultJson) ?: callbacks[callbackId]?.invoke(resultJson) ?: return
        val keepAlive = try {
            JSONObject(resultJson).optBoolean("save", false)
        } catch (_: Exception) {
            false
        }
        if (!keepAlive) callbacks.remove(callbackId)
    }

    override fun onEvent(eventName: String, target: String, dataJson: String?) {
        Log.d(TAG, "Capacitor event $target.$eventName: ${dataJson.orEmpty()}")
    }

    override fun onActivityPreCreated(activity: Activity, savedInstanceState: Bundle?) = Unit

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) = Unit

    @Synchronized
    fun attach(activity: Activity) {
        if (activity !is AppCompatActivity || bridgeActivity === activity) return
        bridge?.onDestroy()
        callbacks.clear()
        bridgeActivity = activity
        bridge = Bridge(activity, discoverPluginClasses(), null, this)
        Log.i(TAG, "LC_BRIDGE_READY plugins=${bridge?.plugins?.size ?: 0} webView=false")
    }

    /**
     * Forwards a warm-start intent to Capacitor plugins.
     *
     * Hosts using a singleTask/singleTop Activity must call this from their
     * Activity.onNewIntent override. Cold-start URLs are captured directly
     * from the Activity intent when the bridge is attached.
     */
    fun onNewIntent(intent: Intent) {
        val current = bridge
        if (current == null) {
            Log.w(TAG, "Ignoring onNewIntent before a Capacitor bridge is attached")
            return
        }
        bridgeActivity?.intent = intent
        current.onNewIntent(intent)
        Log.i(TAG, "LC_DEEP_LINK android delivered")
    }

    @Suppress("UNCHECKED_CAST")
    private fun discoverPluginClasses(): List<Class<out Plugin>> {
        val generated = try {
        val registry = Class.forName(GENERATED_REGISTRY)
        val value = registry.getMethod("pluginClasses").invoke(null)
        when (value) {
            is Array<*> -> value.filterIsInstance<Class<*>>()
                .filter { Plugin::class.java.isAssignableFrom(it) }
                .map { it as Class<out Plugin> }
            is Collection<*> -> value.filterIsInstance<Class<*>>()
                .filter { Plugin::class.java.isAssignableFrom(it) }
                .map { it as Class<out Plugin> }
            else -> emptyList()
        }
    } catch (error: Exception) {
        Log.e(TAG, "Generated plugin registry is unavailable", error)
        emptyList()
        }
        return generated + AndroidMotionPlugin::class.java
    }

    override fun onActivityStarted(activity: Activity) {
        if (activity === bridgeActivity) bridge?.onStart()
    }

    override fun onActivityResumed(activity: Activity) {
        if (activity === bridgeActivity) bridge?.onResume()
    }

    override fun onActivityPaused(activity: Activity) {
        if (activity === bridgeActivity) bridge?.onPause()
    }

    override fun onActivityStopped(activity: Activity) {
        if (activity === bridgeActivity) bridge?.onStop()
    }

    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {
        if (activity === bridgeActivity) bridge?.saveInstanceState(outState)
    }

    @Synchronized
    override fun onActivityDestroyed(activity: Activity) {
        if (activity !== bridgeActivity) return
        bridge?.onDestroy()
        bridge = null
        bridgeActivity = null
        callbacks.clear()
    }

    private fun errorResult(callbackId: String, message: String): String = JSONObject()
        .put("callbackId", callbackId)
        .put("success", false)
        .put("error", JSONObject().put("message", message).put("code", "UNAVAILABLE"))
        .toString()

    private object PluginCallIds {
        const val DANGLING = "-1"
    }
}
