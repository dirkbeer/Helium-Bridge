### Helium Bridge

Helium Bridge is an Arduino application and printed circuit board (PCB) for ESP32 devices. It bridges data packets from sensors transmitting in the ISM bands (industrial, scientific, and medical) to LoRaWAN.

With a Helium Bridge device connecting to the Helium network,

* Off-the-shelf consumer and commercial sensors and IoT devices can be connected to the internet
* Data can be used for environmental modeling, weather dashboards, home automation, etc.
* Off-grid deployment simple since this is a compact, low power, inexpensive device 
* Many sensor devices can be relayed, and the code can be easily extended support over 100+ more
  
The Helium Bridge software and PCB design was sponsored by an innovation grant from the [Helium Foundation](https://www.helium.foundation/) to be made available open source. This work is freely available for use under its [MIT License](https://github.com/dirkbeer/Helium-Bridge/blob/main/LICENSE), copyright (c) 2023 Dirk Beer and [Gristle King, Inc](https://gristleking.com/). 

![image](https://github.com/dirkbeer/Helium-Bridge/assets/6425332/b7afec78-9378-4a55-8d24-4b64e4c9f2e4)


The Arduino code builds on these outstanding projects:

* [LMIC-node](https://github.com/lnlp/LMIC-node), an example LoRaWAN application for a node for The Things Network that helps get your node up and running quickly.
* [rtl_433_ESP](https://github.com/NorthernMan54/rtl_433_ESP), an Arduino library for use on ESP32 boards with a CC1101 transceiver or SX127X Transceivers with the device decoders from the rtl_433 package.
* [rtl_433](https://github.com/merbanan/rtl_433), which (despite the name) is a generic data receiver, mainly for the 433.92 MHz, 868 MHz (SRD), 315 MHz, 345 MHz, and 915 MHz ISM bands.

A version of this project with code specifically for the bridging the Ecowitt/FineOffset WS-80 Weather station to Helium, which includes some additional features and data handling for that device, is available at [Helium_Bridge_WS80](https://github.com/dirkbeer/Helium_Bridge_WS80). The PCB design is the same for both projects.

## Application
* Currently supports these 4 sensor devices (easily extended to more sensors on demand)
  * Ecowitt/Fine Offset WS-80 weather station
  * Ecowitt/Fine Offset WH-45 indoor air quality monitor
  * Acurite Tower temperature and humidity sensors
  * Springfield Soil moisture sensors
        
## Helium Bridge Device
* The bridge device can be built using our PCB board design and these components:
  * LILYGO® TTGO LoRa32 V2.1_1.6 board [link](https://www.lilygo.cc/products/lora3)
  * CC1101 RF Tranceiver Module "CC1101 868MHz" (green, squarish, no pins) [link](https://www.ebay.com/itm/311955775989)
  * 5V Polysilicon Solar Panel like this (don't use 6V panels, they may damage the Lilygo board) [link](https://www.amazon.com/gp/product/B0831CMJB9)
  * 18650 3.7V rechargeable battery
    
## Getting started
# Build a Helium Bridge device
1. Have the PCB printed: 
  * Locate the Gerber file: `Helium-Bridge/pcb/LoRaWan_Bridge_18650_CC1101SMD-Gerber.zip`
  * Order a PCB from an online service using the Gerber zip file. We used OSH Park.
  * Order a solder mask from an online services. We used OSH Stencils. When you upload the Gerber zip file there, use the layer `lorawan_bridge_18650_cc1101smd_f_paste.gbr` for the stencil.
2. In addition to the items listed above, you will need:
  * Solder paste and a method to reflow solder surface mount devices (SMDs). We used and highly recommend a DIY reflow oven like this: [link](https://whizoo.com/pages/buildguide).
  * 2.54mm pitch male and female straight single row pin headers for the Lilygo board, like the ones included in this kit [link](https://www.amazon.com/gp/product/B07CK3RCKS). You could also solder the board directly to the PCB, but it's very hard to unsolder if you run into problems.
  * A 5-Pin Micro USB Type B Male Connector for the solar panel [link](https://www.amazon.com/gp/product/B014GMP4E4)
  * An 18650 battery holder with through pins [link](https://www.digikey.com/short/39pht8dp)
  * A battery connector pigtail for connecting the Lilygo board battery input to the PCB
  * A 433MHz or 915MHz antenna with a U.FL connection
  * An SMD U.FL connector for the CC1101 antenna, like this [link](https://a.co/d/ePDIYed)
3. Use the solder mask to apply solder paste the the CC1101 and UF.L pads on the PCB, carefully place the CC1101 module and UF.L connector, and bake in the reflow oven at the temperature specified for your solder paste.
4. Once the PCB is cool, use a multimeter to test for shorts between adjacent pads of the CC1101 module and between the U.FL center pin and ground, and for good connections from pads to the module.
5. Solder the female pin headers, the battery holder, and the battery pigtail to the PCB. Pay attention to the polarity of the battery holder and pigtail.
6. Plug in the Lilygo board. To avoid damage to the devices, before you power it up, be sure to connect antennas to both the CC1101 U.FL connection and the Lilygo LoRa antenna connection.
7. Initial testing is best done without the battery or solar panel. Watch the polarity on the battery!
8. To use a solar panel, solder it to a 5-pin Micro-USB connector and plug it in to the Lilygo board.

# Run the Helium Bridge software
1. Set up a new Device on a Helium or Chirpstack Console. Edit `keyfiles/lorawan-keys_example.h` with your keys and save it as `keyfiles/lorawan-keys.h`
2. Configure the PlatformIO project. In the `platformio.ini` file, under `[env:ttgo_lora32_v21_rtl433_cc1101]` `build flags =`, specify
  * `'-DOOK_MODULATION=true' '-DRF_MODULE_FREQUENCY=433.92'` for 433MHz devices like the Acurite
  * `'-DOOK_MODULATION=false' '-DRF_MODULE_FREQUENCY=915.00'` for 915MHz devices like the Fine Offset devices
3. Upload and Monitor All using PlatformIO.
  * If LoRaWAN is working correctly, you should see the device sucessfully joining on the Helium or Chirpstack Console.
  * If the sensor decoding is working correctly, and you have one of the supported sensors up and running nearby, you should see JSON sensor data in the PlatformIO terminal
4. Use our script as the decoder Function on the Helium Console or JavaScript Codec on the Chripstack Console (it should work on both without modification)
  * Copy the content of `decoder.js` as the custom script. On Helium console, you can test the script with this example sensor data: `de7044af0a81cc`. You should see temperature and humidity. Save.
  * Connect the Function to the Device (Helium) or create an Application using the Device profile (Chripstack)
  * If everything is working, you should see data packets received in the Console, and decoded data in the Console debugger 

## Using the device
1. If desired, switch between 433MHz and 915MHz reception by sending a Downlink to the Device
  * Downlink settings should be FPort: _100_
  * On Helium Console, use payload type: _Text_. For 433MHz, send a `4`, for 915MHz, send a `9`
  * On Chirpstack Console, use payload type: _Hex_. For 433MHz, send a `34`, for 915MHz, send a `39`
2. You will have to wait for an uplink to occur, and *it may take several tries* for the downlink to be received and acted on by the bridge.
  * A limitation of LoRaWAN Class A devices like this one is that they can only receive a downlink if they have autonomously sent an uplink. You can make sure that uplinks happen periodically using `DO_WORK_INTERVAL_SECONDS` in `platformio.ini`. This is a heartbeat interval to ensure you can get a downlink command to the device even it it's not receiving & bridging any sensor packets.
  * When you are successful, the downlink will restart the device and will see JOIN requests in Console. If there are supported sensors nearby on the frequency you've switched to, you will see their data come in.
