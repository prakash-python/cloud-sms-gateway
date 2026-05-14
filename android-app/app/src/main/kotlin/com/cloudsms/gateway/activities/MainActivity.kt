package com.cloudsms.gateway.activities

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.*
import android.provider.Settings
import android.util.Log
import android.view.animation.AlphaAnimation
import android.view.animation.Animation
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.cloudsms.gateway.R
import com.cloudsms.gateway.databinding.ActivityMainBinding
import com.cloudsms.gateway.services.SmsGatewayService
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val TAG = "SMS_WS"
    
    private val stateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val state = intent?.getStringExtra(SmsGatewayService.EXTRA_STATE)
            updateUIState(state ?: SmsGatewayService.STATE_DISCONNECTED)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        binding.txtDeviceId.text = "GATEWAY ID: ${deviceId.uppercase()}"
        binding.txtDeviceModel.text = Build.MODEL
        
        // Setup listeners
        binding.btnReconnect.setOnClickListener {
            checkPermissionsAndStart()
        }

        binding.btnTestConnection.setOnClickListener {
            binding.imgSyncStatus.setColorFilter(ContextCompat.getColor(this, android.R.color.holo_blue_light))
            binding.imgSyncStatus.animate().rotationBy(360f).setDuration(500).start()
        }

        // Start initial sequence
        updateUIState(SmsGatewayService.STATE_CONNECTING)
        checkPermissionsAndStart()
        updateBatteryInfo()
    }

    private fun checkPermissionsAndStart() {
        val permissions = mutableListOf(
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_PHONE_STATE
        )
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missingPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missingPermissions.toTypedArray(), 101)
        } else {
            startGatewayService()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 101) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                startGatewayService()
            } else {
                Log.w(TAG, "Permissions denied")
                updateUIState(SmsGatewayService.STATE_DISCONNECTED)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter(SmsGatewayService.ACTION_STATE_CHANGED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(stateReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(stateReceiver, filter)
        }
        updateBatteryInfo()
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(stateReceiver)
    }

    private fun updateBatteryInfo() {
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        binding.txtBatteryLevel.text = "$level%"
    }

    private fun updateUIState(state: String) {
        val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        binding.txtLastSync.text = dateFormat.format(Date())

        when(state) {
            SmsGatewayService.STATE_CONNECTED -> {
                binding.txtStatusText.text = "ONLINE"
                binding.txtStatusText.setTextColor(ContextCompat.getColor(this, android.R.color.holo_green_dark))
                binding.viewStatusDot.setBackgroundResource(R.drawable.badge_online)
                binding.layoutStatusBadge.setBackgroundColor(0x1A10B981.toInt())
                stopPulseAnimation()
            }
            SmsGatewayService.STATE_CONNECTING -> {
                binding.txtStatusText.text = "CONNECTING"
                binding.txtStatusText.setTextColor(ContextCompat.getColor(this, android.R.color.holo_orange_light))
                binding.layoutStatusBadge.setBackgroundColor(0x1AFBBF24.toInt())
                startPulseAnimation()
            }
            SmsGatewayService.STATE_RECONNECTING -> {
                binding.txtStatusText.text = "SYNCING..."
                binding.txtStatusText.setTextColor(ContextCompat.getColor(this, android.R.color.holo_blue_light))
                binding.layoutStatusBadge.setBackgroundColor(0x1A3B82F6.toInt())
                startPulseAnimation()
            }
            else -> {
                binding.txtStatusText.text = "OFFLINE"
                binding.txtStatusText.setTextColor(ContextCompat.getColor(this, android.R.color.holo_red_dark))
                binding.layoutStatusBadge.setBackgroundColor(0x1AEF4444.toInt())
                stopPulseAnimation()
            }
        }
    }

    private fun startPulseAnimation() {
        val anim = AlphaAnimation(0.4f, 1.0f)
        anim.duration = 800
        anim.repeatMode = Animation.REVERSE
        anim.repeatCount = Animation.INFINITE
        binding.layoutStatusBadge.startAnimation(anim)
    }

    private fun stopPulseAnimation() {
        binding.layoutStatusBadge.clearAnimation()
    }

    private fun startGatewayService() {
        val intent = Intent(this, SmsGatewayService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }
}
