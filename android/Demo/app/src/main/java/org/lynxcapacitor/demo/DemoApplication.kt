package org.lynxcapacitor.demo

import android.app.Application
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.core.ImagePipelineConfig
import com.facebook.imagepipeline.memory.PoolConfig
import com.facebook.imagepipeline.memory.PoolFactory
import com.lynx.service.http.LynxHttpService
import com.lynx.service.image.LynxImageService
import com.lynx.service.log.LynxLogService
import com.lynx.tasm.LynxEnv
import com.lynx.tasm.service.LynxServiceCenter

class DemoApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        val poolFactory = PoolFactory(PoolConfig.newBuilder().build())
        val imageConfig = ImagePipelineConfig.newBuilder(this).setPoolFactory(poolFactory).build()
        Fresco.initialize(this, imageConfig)
        LynxServiceCenter.inst().registerService(LynxImageService.getInstance())
        LynxServiceCenter.inst().registerService(LynxLogService)
        LynxServiceCenter.inst().registerService(LynxHttpService)
        LynxEnv.inst().init(this, null, null, null)
        LynxEnv.inst().enableDevtool(true)
    }
}
