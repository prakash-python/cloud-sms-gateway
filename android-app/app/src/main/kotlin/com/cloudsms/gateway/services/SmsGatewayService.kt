package com.cloudsms.gateway.services

import android.app.*
import android.content.Intent
import android.os.IBinder
import android.telephony.SmsManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.gson.Gson
import okhttp3.*
import okio.ByteString
import java.util.concurrent.TimeUnit

class SmsGatewayService : Service() {

    private lateinit var client: OkHttpClient
    private var webSocket: WebSocket? = null
    private val gson = Gson()
    private val deviceId = "DEVICE_123" # Should be dynamic in production

    override fun onCreate() {
        super.onCreate()
        client = OkHttpClient.Builder()
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .build()
        startForegroundService()
        connectWebSocket()
    }

    private fun startForegroundService() {
        val channelId = "sms_gateway_channel"
        val channel = NotificationChannel(channelId, "SMS Gateway Service", NotificationManager.IMPORTANCE_LOW)
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("SMS Gateway Active")
            .setContentText("Listening for incoming SMS requests...")
            .setSmallIcon(android.R.drawable.stat_sys_upload)
            .build()

        startForeground(1, notification)
    }

    private fun connectWebSocket() {
        val request = Request.Builder()
            .url("ws://your-backend-url.render.com/ws/$deviceId")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                handleServerMessage(text)
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("SMS_WS", "Closing: $reason")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("SMS_WS", "Error: ${t.message}")
                // Implement reconnect logic here
            }
        })
    }

    private fun handleServerMessage(text: String) {
        try {
            val messageMap = gson.fromJson(text, Map::class.java)
            if (messageMap["type"] == "SEND_SMS") {
                val data = messageMap["data"] as Map<*, *>
                val phone = data["phone"] as String
                val body = data["message"] as String
                val logId = (data["log_id"] as Double).toInt()

                sendSMS(phone, body, logId)
            }
        } catch (e: Exception) {
            Log.e("SMS_WS", "Failed to parse message", e)
        }
    }

    private fun sendSMS(phoneNumber: String, message: String, logId: Int) {
        try {
            val smsManager = getSystemService(SmsManager::class.java)
            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            sendDeliveryReport(logId, "SENT")
        } catch (e: Exception) {
            Log.e("SMS_WS", "Failed to send SMS", e)
            sendDeliveryReport(logId, "FAILED")
        }
    }

    private fun sendDeliveryReport(logId: Int, status: String) {
        val report = mapOf(
            "type" to "DELIVERY_REPORT",
            "data" to mapOf(
                "log_id" to logId,
                "status" to status
            )
        )
        webSocket?.send(gson.toJson(report))
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
