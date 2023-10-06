function hexStringToUint8Array(hexString) {
    var arr = [], i;
    for (i = 0; i < hexString.length; i += 2) {
        arr.push(parseInt(hexString.substr(i, 2), 16));
    }
    return new Uint8Array(arr);
}


function acuriteGetChannel(byte) {
    const channelStrs = ["C", "E", "B", "A"]; // 'E' stands for error
  
    const channel = (byte & 0xC0) >> 6;
    return channelStrs[channel];
  }

  
function acuriteTowerDecode(bb) {

    // Initialize variables
    var exception = 0;
    const channelStr = acuriteGetChannel(bb[0]); 
    const sensorId = ((bb[0] & 0x3F) << 8) | bb[1];
    const batteryLow = (bb[2] & 0x40) === 0;
    const humidity = (bb[3] & 0x7F);

    // Sanity check for humidity
    if (humidity > 100 && humidity !== 127) {
        return { status: 'DECODE_FAIL_SANITY' };
    }

    // Decode temperature
    const tempRaw = ((bb[4] & 0x7F) << 7) | (bb[5] & 0x7F);
    const tempC = (tempRaw - 1000) * 0.1;

    // Sanity check for temperature
    if (tempC < -40 || tempC > 70) {
        return { status: 'DECODE_FAIL_SANITY' };
    }

    // Check for exception in temperature bits 12-14
    if ((tempRaw & 0x3800) !== 0) {
        exception++;
    }

    // Create data object
    const data = {
        model: 'Acurite-Tower',
        id: sensorId,
        channel: channelStr,
        battery_ok: !batteryLow,
        temperature_C: tempC.toFixed(1),
        humidity: humidity !== 127 ? humidity : null,
        mic: 'CHECKSUM',
        raw_bytes: Array.from(bb).map(b => b.toString(16)).join('')
    };

    // Append exception if any
    if (exception) {
        data.exception = exception;
    }
    
    return data;
}

function fineoffsetWS80Decode(bb) {
    // Initialize variables
    const id = (bb[1] << 16) | (bb[2] << 8) | bb[3];
    const lightRaw = (bb[4] << 8) | bb[5];
    const lightLux = lightRaw * 10;
    const batteryMv = bb[6] * 20;
    const batteryLvl = batteryMv < 1400 ? 0 : (batteryMv - 1400) / 16;
    const flags = bb[7];
    const tempRaw = ((bb[7] & 0x03) << 8) | bb[8];
    const tempC = (tempRaw - 400) * 0.1;
    const humidity = bb[9];
    const windAvg = ((bb[7] & 0x10) << 4) | bb[10];
    const windDir = ((bb[7] & 0x20) << 3) | bb[11];
    const windMax = ((bb[7] & 0x40) << 2) | bb[12];
    const uvIndex = bb[13];
    const unknown = (bb[14] << 8) | bb[15];

    // Create data object
    const data = {
        model: 'Fineoffset-WS80',
        id: id.toString(16),
        battery_ok: batteryLvl * 0.01,
        battery_mV: `${batteryMv} mV`,
        temperature_C: tempRaw !== 0x3ff ? tempC.toFixed(1) : null,
        humidity: humidity !== 0xff ? humidity : null,
        wind_dir_deg: windDir !== 0x1ff ? windDir : null,
        wind_avg_m_s: windAvg !== 0x1ff ? (windAvg * 0.1).toFixed(1) : null,
        wind_max_m_s: windMax !== 0x1ff ? (windMax * 0.1).toFixed(1) : null,
        uvi: uvIndex !== 0xff ? (uvIndex * 0.1).toFixed(1) : null,
        light_lux: lightRaw !== 0xffff ? lightLux.toFixed(1) : null,
        flags: flags.toString(16),
        unknown: unknown !== 0x3fff ? unknown : null,
        mic: 'CRC',
        raw_bytes: Array.from(bb).map(b => b.toString(16)).join('')
    };

    return data;
}

function fineoffsetWH45Decode(bb) {
    // Initialize variables
    const id = (bb[1] << 16) | (bb[2] << 8) | bb[3];
    const tempRaw = (bb[4] & 0x7) << 8 | bb[5];
    const tempC = (tempRaw - 400) * 0.1;
    const humidity = bb[6];
    const batteryBars = (bb[7] & 0x40) >> 4 | (bb[9] & 0xC0) >> 6;
    const extPower = batteryBars === 6 ? 1 : 0;
    const batteryOk = Math.min(batteryBars * 0.2, 1.0);
    const pm25Raw = (bb[7] & 0x3f) << 8 | bb[8];
    const pm25 = pm25Raw * 0.1;
    const pm10Raw = (bb[9] & 0x3f) << 8 | bb[10];
    const pm10 = pm10Raw * 0.1;
    const co2 = (bb[11] << 8) | bb[12];

    // Create data object
    const data = {
        model: 'Fineoffset-WH45',
        id: id.toString(16),
        battery_ok: batteryOk.toFixed(1),
        temperature_C: tempC.toFixed(1),
        humidity: humidity,
        pm2_5_ug_m3: pm25.toFixed(1),
        pm10_ug_m3: pm10.toFixed(1),
        co2_ppm: co2,
        ext_power: extPower,
        mic: 'CRC',
        raw_bytes: Array.from(bb).map(b => b.toString(16)).join('')
    };

    return data;
}


function calculateChecksum(bytes) {
    let checksum = 0;
    for (let i = 0; i < bytes.length; i++) {
        checksum ^= bytes[i];
    }
    return (checksum >> 4) ^ (checksum & 0x0F);
}


function check_springfield_message_type(bb) {

    // Check bit length
        const bitLength = bb.length * 8;
        if (bitLength !== 32 ) {
            //console.log("Invalid bit length");
            return null;
        }
    
        // Validate checksum
        const calculatedChecksum = calculateChecksum(bb);
        if (calculatedChecksum !== 0) {
            //console.log("Checksum validation failed");
            return null;
        }

        return SPRINGFIELD_MSGTYPE;
    }    

function decodeSpringfield(bb) {

    // Proceed with decoding (assuming the rest of the decoding logic is implemented)
    // Initialize variables
    const sid = bb[0];
    const battery = (bb[1] >> 7) & 1;
    const button = (bb[1] >> 6) & 1;
    const channel = ((bb[1] >> 4) & 0x03) + 1;
    const temp = (bb[1] & 0x0f) << 12 | (bb[2] << 4);
    const tempC = (temp >> 4) * 0.1;
    const moisture = (bb[3] >> 4) * 10;

    // Create data object
    const data = {
        model: 'Springfield-Soil',
        id: sid,
        channel: channel,
        battery_ok: !battery,
        transmit: button ? 'MANUAL' : 'AUTO',
        temperature_C: tempC.toFixed(1),
        moisture: moisture,
        button: button,
        mic: 'CHECKSUM',
        raw_bytes: Array.from(bb).map(b => b.toString(16)).join(' ')
    };

    return data;
}

const FINEOFFSET_MSGTYPE_WS80 = 0x80;
const FINEOFFSET_MSGTYPE_WH45 = 0x45;
const ACURITE_MSGTYPE_TOWER_SENSOR = 0x04;
const SPRINGFIELD_MSGTYPE = 0x0f;   // arbitrary value

function Decoder(bb, port, uplink_info) {
    // Optional: Use uplink_info for additional metadata
    if (uplink_info) {
        // do something with uplink_info fields
    }

    const acurite_message_type = bb[2] & 0x3f;
    const fineoffset_message_type = bb[0];
    const springfield_message_type = check_springfield_message_type(bb);
    
    var decoded;

    // Following code assumes that the message types are unique, this may not be the case
    if (acurite_message_type === ACURITE_MSGTYPE_TOWER_SENSOR) {
        decoded = acuriteTowerDecode(bb);
    } else if (fineoffset_message_type === FINEOFFSET_MSGTYPE_WS80) {  
        decoded = fineoffsetWS80Decode(bb);
    } else if (fineoffset_message_type === FINEOFFSET_MSGTYPE_WH45) {  
        decoded = fineoffsetWH45Decode(bb);
    } else if (springfield_message_type === SPRINGFIELD_MSGTYPE) {
        decoded = decodeSpringfield(bb);
    } else {
        decoded = { status: 'decode.js : Decoding failed, sensor not supported' };
    }

    return decoded;
}


// for chripstack
function decodeUplink(input) {
    const decoded = Decoder(input.bytes, input.fPort, input.variables);
    return { data: decoded };
}

function encodeDownlink(input) {
    // Implement your downlink encoding logic here
    return {
        bytes: [225, 230, 255, 0]  // Example bytes
    };
}

/*  
// Example usage
//const hexString = "de7044af0a81cc";
//const hexString = "80002d980000950a764005bc0a003fff973a";
//const hexString = "45003fd102a2360040c04701a193ab";
const hexString = "c1211e01";

const bytes = hexStringToUint8Array(hexString);

// Call Decoder function
const decodedData = Decoder(bytes, 1);  // Assuming port 1, you can change this as needed
console.log(decodedData);

// Call Decoder function
var input = [];
input.bytes = bytes;
input.fPort = 1;
const decodedData2 = decodeUplink(input);  // Assuming port 1, you can change this as needed
console.log(decodedData2);
*/