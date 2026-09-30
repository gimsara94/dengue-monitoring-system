import serial
import numpy as np
import time
from datetime import datetime
import joblib
import tensorflow as tf
from tensorflow.keras.models import load_model
import warnings
import requests

# Clear the screen and suppress heavy TF logging
warnings.filterwarnings('ignore')
tf.get_logger().setLevel('ERROR')

# ==========================================
# 1. CONFIGURATION
# ==========================================
SERIAL_PORT = 'COM15'
BAUD_RATE = 115200 
WINDOW_SIZE = 3 
CALIBRATION_TARGET = 150 # 1.5 seconds of clean data

# Supabase Configuration
SUPABASE_URL = "https://bmvypwtaxhtxrozypdbo.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdnlwd3RheGh0eHJvenlwZGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzc5ODYsImV4cCI6MjA4MzgxMzk4Nn0.NAX67YKRr5Mev0hzEGj_cXXLznBEUzu2ClHtr_OUYO0"

# Patient Details (Set these to the correct IDs to link to Patient in database)
HOSPITAL_ID = 6
WARD_ID = 1
PATIENT_ID = 2

# --- CHANGE YOUR TIME VARIABLES HERE ---
RECORDING_DURATION_SECONDS = 600 # 10 minutes active recording
WAIT_INTERVAL_SECONDS = 3000     # 50 minutes standby (60 min total cycle)
# ---------------------------------------

# User Profile
current_age = 45.0
current_sex = 1 # 1=Male, 0=Female

# ==========================================
# 2. LOAD THE AI BRAIN
# ==========================================
print("Initializing Deep Learning Model...")
try:
    model = load_model('medical_bp_lstm.h5')
    scaler = joblib.load('tabular_scaler.pkl')
    tab_data = scaler.transform([[current_age, current_sex]])
    tab_input_tf = tf.convert_to_tensor(tab_data, dtype=tf.float32)
except Exception as e:
    print(f"Load Error: {e}")
    raise

def apply_ema_filter(data, alpha=0.6):
    ema = np.zeros_like(data)
    ema[0] = data[0]
    for i in range(1, len(data)):
        ema[i] = alpha * data[i] + (1 - alpha) * ema[i-1]
    return ema

# ==========================================
# 3. LIVE MONITORING LOOP
# ==========================================
live_buffer = []
calibration_buffer = []
is_calibrated = False
global_min, global_max = 0, 1

# Scheduling Variables
session_active = False
# Start the very first session immediately upon running the script
next_session_start_time = time.time() 
session_start_time = 0
last_standby_print = 0

# Data Storage
sbp_history = []
dbp_history = []

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)
    ser.reset_input_buffer()
    print(f"Connection Established on {SERIAL_PORT}")
    print("-" * 50)

    while True:
        try:
            # --- STANDBY & SCHEDULING LOGIC ---
            if not session_active:
                if time.time() >= next_session_start_time:
                    print("\nStarting Scheduled Scan.")
                    print("INSTRUCTIONS: Place finger perfectly flush on the sensor.")
                    session_active = True
                    session_start_time = time.time()
                    sbp_history.clear()
                    dbp_history.clear()
                    is_calibrated = False 
                    live_buffer.clear()
                    calibration_buffer.clear()
                    ser.reset_input_buffer()
                else:
                    # Keep the buffer clean while waiting so it doesn't crash
                    if ser.in_waiting > 0:
                        ser.reset_input_buffer() 
                    
                    # Print a quiet countdown every 60 seconds
                    if time.time() - last_standby_print >= 60:
                        mins_left = int((next_session_start_time - time.time()) / 60)
                        print(f"System in Standby. Next scan in {mins_left} minutes.", end='\r')
                        last_standby_print = time.time()
                    
                    time.sleep(0.1) # Prevent CPU pegging during standby
                    continue

            # --- ACTIVE SESSION LOGIC ---
            if session_active:
                # Check if the timer is up
                if time.time() - session_start_time >= RECORDING_DURATION_SECONDS:
                    print("\nRecording Duration Complete. Calculating Averages...")
                    
                    if len(sbp_history) > 0:
                        avg_sbp = np.mean(sbp_history)
                        avg_dbp = np.mean(dbp_history)
                        avg_pp = avg_sbp - avg_dbp
                        
                        print(f"SESSION AVERAGES -> SBP: {avg_sbp:.1f} | DBP: {avg_dbp:.1f} | PP: {avg_pp:.1f}")
                        
                        now = datetime.now()
                        payload = {
                            "hospital_id": HOSPITAL_ID,
                            "ward_id": WARD_ID,
                            "patient_id": PATIENT_ID,
                            "bp_supine_sys": int(round(avg_sbp)),
                            "bp_supine_dia": int(round(avg_dbp)),
                            "pulse_pressure": int(round(avg_pp)),
                            "chart_date": now.strftime("%Y-%m-%d"),
                            "chart_time": now.strftime("%H:%M:%S")
                        }
                        
                        endpoint = f"{SUPABASE_URL}/rest/v1/chart_vitals"
                        headers = {
                            "apikey": SUPABASE_ANON_KEY,
                            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                            "Content-Type": "application/json",
                            "Prefer": "return=minimal"
                        }
                        
                        print("Transmitting to Supabase...")
                        try:
                            response = requests.post(endpoint, json=payload, headers=headers, timeout=5.0)
                            if response.status_code in [200, 201]:
                                print("Transmission Successful.")
                            else:
                                print(f"API Warning: Received status code {response.status_code}")
                                print(response.text)
                        except requests.exceptions.RequestException as e:
                            print(f"API Connection Error: Could not transmit data. {e}")
                    else:
                        print("Session Failed: No valid heartbeat data was collected.")

                    # Schedule the next scan using the WAIT_INTERVAL_SECONDS
                    next_session_start_time = time.time() + WAIT_INTERVAL_SECONDS
                    session_active = False
                    print("-" * 50)
                    ser.reset_input_buffer()
                    continue

                # --- HARDWARE READING LOGIC ---
                if ser.in_waiting > 0:
                    raw_line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if not raw_line: continue

                    if "NO_FINGER" in raw_line:
                        if is_calibrated: 
                            print("\nContact Lost. Timer is still running. Please replace finger.")
                        is_calibrated = False
                        calibration_buffer.clear()
                        continue
                    
                    if "SATURATED" in raw_line:
                        print("SENSOR SATURATED: Use lighter pressure!", end='\r')
                        continue

                    if "SETTLING" in raw_line: continue

                    try:
                        ppg_val = float(raw_line)
                    except ValueError:
                        continue

                    # --- PHASE 1: CALIBRATION ---
                    if not is_calibrated:
                        calibration_buffer.append(ppg_val)
                        if len(calibration_buffer) % 50 == 0:
                            prog = int((len(calibration_buffer)/CALIBRATION_TARGET)*100)
                            print(f"Syncing Heartbeat... {prog}%")
                        
                        if len(calibration_buffer) >= CALIBRATION_TARGET:
                            clean_data = calibration_buffer[30:]
                            global_min, global_max = np.min(clean_data), np.max(clean_data)
                            
                            if (global_max - global_min) < 30:
                                print("Weak Signal. Try resting finger flatter.")
                                calibration_buffer.clear()
                                continue

                            is_calibrated = True
                            print("SIGNAL LOCKED. Collecting Data...\n")
                            ser.reset_input_buffer()
                        continue

                    # --- PHASE 2: REAL-TIME INFERENCE ---
                    live_buffer.append(ppg_val)
                    if len(live_buffer) >= WINDOW_SIZE:
                        raw_sig = np.array(live_buffer, dtype=float)
                        
                        scaled_sig = np.clip((raw_sig - global_min) / (global_max - global_min), 0, 1)
                        
                        filtered_sig = apply_ema_filter(scaled_sig)
                        vpg = np.gradient(filtered_sig)
                        apg = np.gradient(vpg)
                        
                        sig_stack = np.column_stack((filtered_sig, vpg, apg))
                        sig_input_tf = tf.convert_to_tensor(np.expand_dims(sig_stack, axis=0), dtype=tf.float32)
                        
                        preds = model([sig_input_tf, tab_input_tf], training=False)
                        
                        sys_val = float(preds[0][0])
                        dia_val = float(preds[0][1])
                        
                        # Store the values quietly
                        sbp_history.append(sys_val)
                        dbp_history.append(dia_val)
                        
                        # Print a quiet status update every 100 samples
                        if len(sbp_history) % 100 == 0:
                            time_left = RECORDING_DURATION_SECONDS - int(time.time() - session_start_time)
                            print(f"Collecting... {len(sbp_history)} readings saved. ({time_left} seconds remaining)", end='\r')
                        
                        live_buffer.clear()

        # Safety Net for Hardware Disconnections
        except serial.SerialException:
            print("\nHardware Disconnected. Please check your USB cable and restart the script.")
            break
        except Exception as general_error:
            continue

except KeyboardInterrupt:
    print("\nMonitoring Stopped by User.")
finally:
    if 'ser' in locals() and ser.is_open:
        ser.close()
        print("COM Port Safely Closed.")