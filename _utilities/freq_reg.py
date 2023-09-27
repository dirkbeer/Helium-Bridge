def calculate_freq_registers(desired_freq_mhz, osc_freq_mhz=26.0):
    # Calculate the 24-bit FREQ value using the formula
    freq_24bit = int((desired_freq_mhz * (2 ** 16)) / osc_freq_mhz)
    
    # Extract individual bytes for FREQ2, FREQ1, and FREQ0
    freq2 = (freq_24bit & 0xFF0000) >> 16
    freq1 = (freq_24bit & 0x00FF00) >> 8
    freq0 = (freq_24bit & 0x0000FF)
    
    # Print the register values in hexadecimal format
    print(f"FREQ2 register value: 0x{freq2:02X}")
    print(f"FREQ1 register value: 0x{freq1:02X}")
    print(f"FREQ0 register value: 0x{freq0:02X}")

def calculate_frequency(freq2_hex, freq1_hex, freq0_hex, osc_freq_mhz=26.0):
    # Convert hexadecimal register values to integers
    freq2 = int(freq2_hex, 16)
    freq1 = int(freq1_hex, 16)
    freq0 = int(freq0_hex, 16)
    
    # Combine the 3 bytes into a single 24-bit value
    freq_24bit = (freq2 << 16) | (freq1 << 8) | freq0
    
    # Calculate the frequency using the formula
    frequency_mhz = (freq_24bit * osc_freq_mhz) / (2 ** 16)
    
    # Print the calculated frequency
    print(f"Calculated Frequency: {frequency_mhz:.2f} MHz")

# Example usage: Calculate frequency for FREQ2=0xD9, FREQ1=0x06, FREQ0=0x77
calculate_frequency("23", "31", "3B")


# Example usage: Calculate register values for 915 MHz
calculate_freq_registers(433.92)
