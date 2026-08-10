package org.lynxcapacitor.demo

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder
import com.lynxcapacitor.generated.LynxGeneratedLibraryRegistry
import org.lynxcapacitor.runtime.LynxCapacitorRuntime
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private lateinit var lynxView: LynxView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val builder = LynxViewBuilder()
            .setTemplateProvider(AssetTemplateProvider(this))
        LynxGeneratedLibraryRegistry.setup(builder)
        lynxView = builder.build(this)
        setContentView(lynxView)
        LynxCapacitorRuntime.attach(this)

        val density = resources.displayMetrics.density
        val safeTop = (resources.getIdentifier("status_bar_height", "dimen", "android")
            .takeIf { it != 0 }
            ?.let(resources::getDimensionPixelSize) ?: 0) / density
        val initData = JSONObject()
            .put("safeArea", JSONObject().put("top", safeTop).put("bottom", 0))
            .toString()
        lynxView.renderTemplateUrl("main.lynx.bundle", initData)
    }

    override fun onDestroy() {
        lynxView.destroy()
        super.onDestroy()
    }
}
