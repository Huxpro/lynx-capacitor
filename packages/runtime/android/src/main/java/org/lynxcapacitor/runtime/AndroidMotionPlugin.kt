package org.lynxcapacitor.runtime

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.annotation.CapacitorPlugin
import kotlin.math.max

/** Native replacement for @capacitor/motion's browser-only Android fallback. */
@CapacitorPlugin(name = "Motion")
class AndroidMotionPlugin : Plugin(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private val gravity = FloatArray(3)
    private val rotationRate = FloatArray(3)
    private var lastAccelerationTimestamp = 0L
    private var listening = false

    override fun load() {
        sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        startSensors()
    }

    override fun handleOnResume() = startSensors()

    override fun handleOnPause() = stopSensors()

    override fun handleOnDestroy() = stopSensors()

    private fun startSensors() {
        if (!::sensorManager.isInitialized || listening) return
        sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
        sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
        listening = true
    }

    private fun stopSensors() {
        if (!::sensorManager.isInitialized || !listening) return
        sensorManager.unregisterListener(this)
        listening = false
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> emitAcceleration(event)
            Sensor.TYPE_GYROSCOPE -> emitRotation(event)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

    private fun emitAcceleration(event: SensorEvent) {
        val alpha = 0.8f
        for (axis in 0..2) {
            gravity[axis] = alpha * gravity[axis] + (1f - alpha) * event.values[axis]
        }
        val interval = if (lastAccelerationTimestamp == 0L) {
            0.0
        } else {
            max(0L, event.timestamp - lastAccelerationTimestamp) / 1_000_000.0
        }
        lastAccelerationTimestamp = event.timestamp

        notifyListeners(
            "accel",
            JSObject().apply {
                put("acceleration", vector(
                    event.values[0] - gravity[0],
                    event.values[1] - gravity[1],
                    event.values[2] - gravity[2],
                ))
                put("accelerationIncludingGravity", vector(
                    event.values[0],
                    event.values[1],
                    event.values[2],
                ))
                put("rotationRate", rotationObject())
                put("interval", interval)
            },
        )
    }

    private fun emitRotation(event: SensorEvent) {
        val radiansToDegrees = (180.0 / Math.PI).toFloat()
        for (axis in 0..2) rotationRate[axis] = event.values[axis] * radiansToDegrees
        notifyListeners("orientation", rotationObject())
    }

    private fun vector(x: Float, y: Float, z: Float) = JSObject().apply {
        put("x", x.toDouble())
        put("y", y.toDouble())
        put("z", z.toDouble())
    }

    private fun rotationObject() = JSObject().apply {
        put("alpha", rotationRate[2].toDouble())
        put("beta", rotationRate[0].toDouble())
        put("gamma", rotationRate[1].toDouble())
    }
}
