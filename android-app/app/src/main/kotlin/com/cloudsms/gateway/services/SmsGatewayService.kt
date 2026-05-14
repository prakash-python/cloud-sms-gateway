package com.cloudsms.gateway.services

import android.app.*
import android.content.*
import android.os.*
import android.provider.Settings
import android.telephony.SmsManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.cloudsms.gateway.activities.MainActivity
import com.cloudsms.gateway.utils.Constants
import com.google.gson.Gson
import com.google.gson.JsonObject
import okhttp3.*
import java.util.concurrent.TimeUnit

class SmsGatewayService : Service() {

    private val TAG = "SMS_WS"
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()
    private var webSocket: WebSocket? = null
    private val gson = Gson()
    private val handler = Handler(Looper.getMainLooper())
    private var deviceId: String = ""
    
    companion object {
        const val ACTION_STATE_CHANGED = "com.cloudsms.gateway.STATE_CHANGED"
        const val EXTRA_STATE = "state"
        
        const val STATE_DISCONNECTED = "DISCONNECTED"
        const val STATE_CONNECTING = "CONNECTING"
        const val STATE_CONNECTED = "CONNECTED"
        const val STATE_RECONNECTING = "RECONNECTING"
    }

    override fun onCreate() {
        super.onCreate()
        deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        startForeground(1, createNotification("Starting Gateway..."))
        connectWebSocket()
    }

    private fun broadcastState(state: String) {
        val intent = Intent(ACTION_STATE_CHANGED)
        intent.putExtra(EXTRA_STATE, state)
        sendBroadcast(intent)
        
        val notificationText = when(state) {
            STATE_CONNECTED -> "Gateway Online"
            STATE_CONNECTING -> "Establishing connection..."
            STATE_RECONNECTING -> "Syncing securely..."
            else -> "Service running"
        }
        updateNotification(notificationText)
    }

    private fun connectWebSocket() {
        broadcastState(STATE_CONNECTING)
        val wsUrl = "${Constants.WS_URL}/$deviceId"
        
        val request = Request.Builder()
            .url(wsUrl)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "Connected successfully")
                broadcastState(STATE_CONNECTED)
                sendDeviceInfo()
                startHeartbeat()
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = gson.fromJson(text, JsonObject::class.java)
                    if (json.get("type").asString == "SEND_SMS") {
                        val data = json.getAsJsonObject("data")
                        val phone = data.get("phone").asString
                        val message = data.get("message").asString
                        val logId = data.get("log_id").asInt
                        sendSms(phone, message, logId)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing message: ${e.message}")
                }
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                broadcastState(STATE_DISCONNECTED)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                broadcastState(STATE_RECONNECTING)
                reconnect()
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                broadcastState(STATE_DISCONNECTED)
                reconnect()
            }
        })
    }

    private fun sendSms(phone: String, message: String, logId: Int) {
        try {
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                this.getSystemService(SmsManager::class.java)
            } else {
                SmsManager.getDefault()
            }
            
            val sentIntent = PendingIntent.getBroadcast(this, logId, Intent("SMS_SENT").putExtra("log_id", logId), PendingIntent.FLAG_IMMUTABLE)
            val deliveredIntent = PendingIntent.getBroadcast(this, logId, Intent("SMS_DELIVERED").putExtra("log_id", logId), PendingIntent.FLAG_IMMUTABLE)

            smsManager.sendTextMessage(phone, null, message, sentIntent, deliveredIntent)
            reportDeliveryStatus(logId, "SENT")
        } catch (e: Exception) {
            reportDeliveryStatus(logId, "FAILED")
        }
    }

    private fun reportDeliveryStatus(logId: Int, status: String) {
        val report = mapOf(
            "type" to "DELIVERY_REPORT",
            "data" to mapOf("log_id" to logId, "status" to status)
        )
        webSocket?.send(gson.toJson(report))
    }

    private fun sendDeviceInfo() {
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        
        val info = mapOf(
            "type" to "DEVICE_INFO",
            "data" to mapOf(
                "device_id" to deviceId,
                "device_name" to Build.MODEL,
                "phone_model" to Build.MODEL,
                "android_version" to Build.VERSION.RELEASE,
                "battery_level" to batteryLevel,
                "sim_count" to 1
            )
        )
        webSocket?.send(gson.toJson(info))
    }

    private fun startHeartbeat() {
        handler.removeCallbacksAndMessages(null)
        handler.postDelayed(object : Runnable {
            override fun run() {
                val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
                val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
                
                val heartbeat = mapOf(
                    "type" to "HEARTBEAT",
                    "data" to mapOf("device_id" to deviceId, "battery_level" to batteryLevel)
                )
                webSocket?.send(gson.toJson(heartbeat))
                handler.postDelayed(this, 30000)
            }
        }, 30000)
    }

    private fun reconnect() {
        handler.postDelayed({ connectWebSocket() }, 5000)
    }

    private fun createNotification(content: String): Notification {
        val channelId = "sms_gateway_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "CloudSMS Service", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("CloudSMS Gateway Active")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.stat_notify_chat)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(content: String) {
        val notification = createNotification(content)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(1, notification)
    }

    override fun onBind(intent: Intent?): IBinder? = null
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_STICKY
}
