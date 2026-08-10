package org.lynxcapacitor.runtime

import android.content.Context
import com.lynx.jsbridge.LynxMethod
import com.lynx.jsbridge.LynxModule
import com.lynx.jsbridge.LynxNativeModule
import com.lynx.react.bridge.Callback
import com.lynx.react.bridge.JavaOnlyArray
import com.lynx.tasm.behavior.LynxContext

@LynxNativeModule(name = "CapacitorBridge")
class LynxCapacitorBridge(context: Context) : LynxModule(context) {
    private val eventSender: (String) -> Unit = { resultJson ->
        (context as? LynxContext)?.sendGlobalEvent(
            RESULT_EVENT,
            JavaOnlyArray.of(resultJson),
        )
    }

    init {
        LynxCapacitorRuntime.setEventSender(eventSender)
    }

    @LynxMethod
    fun getPlatform(): String = "android"

    @LynxMethod
    fun getPluginHeaders(): String = LynxCapacitorRuntime.pluginHeaders()

    @LynxMethod
    fun handleCall(payload: String, callback: Callback) {
        LynxCapacitorRuntime.handleCall(payload, callback)
    }

    override fun destroy() {
        LynxCapacitorRuntime.clearEventSender(eventSender)
    }

    private companion object {
        const val RESULT_EVENT = "lynx-capacitor-result"
    }
}
