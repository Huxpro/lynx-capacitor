package org.lynxcapacitor.demo

import android.content.Context
import com.lynx.tasm.provider.AbsTemplateProvider

class AssetTemplateProvider(context: Context) : AbsTemplateProvider() {
    private val appContext = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        Thread {
            try {
                appContext.assets.open(uri).use { callback.onSuccess(it.readBytes()) }
            } catch (error: Exception) {
                callback.onFailed(error.message ?: "Unable to read $uri")
            }
        }.start()
    }
}
