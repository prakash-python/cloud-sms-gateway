package com.cloudsms.gateway.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.cloudsms.gateway.databinding.ActivityMainBinding
import com.cloudsms.gateway.services.SmsGatewayService
import com.cloudsms.gateway.utils.Constants

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val TAG = "SMS_WS"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        
        binding.deviceIdText.text = "DEVICE ID: $deviceId"
        binding.serverUrlText.text = "SERVER: ${Constants.BASE_URL}"
        
        // Request permissions and start service
        checkAndRequestPermissions()

        binding.reconnectButton.setOnClickListener {
            startGatewayService()
            binding.statusText.text = "Status: Reconnecting..."
        }
    }

    private fun checkAndRequestPermissions() {
        val permissionsNeeded = mutableListOf<String>()
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.SEND_SMS)
        }

        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), 100)
        } else {
            startGatewayService()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100) {
            // Start service regardless of whether notification permission is granted, 
            // though it's recommended to have it for foreground services on Android 13+
            startGatewayService()
        }
    }

    private fun startGatewayService() {
        val intent = Intent(this, SmsGatewayService::class.java)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Log.d(TAG, "Starting foreground service...")
                startForegroundService(intent)
            } else {
                Log.d(TAG, "Starting background service...")
                startService(intent)
            }
            Log.d(TAG, "Service start intent sent")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start service: ${e.message}")
            e.printStackTrace()
        }
    }
}
