### Helium Bridge

Helium Bridge is an Arduino application and printed circuit board (PCB) for ESP32 devices. It bridges data packets from sensors transmitting in the industrial, scientific, and medical (ISM) bands to LoRaWAN. 

With a Helium Bridge device connecting to the Helium network,

* Commercial consumer sensors and IoT devices can be connected to the internet
* Data can be used for environmental modeling, weather dashboards, home automation, etc.
* Off-grid deployment simple since this is a compact, low power, inexpensive device 
* Many sensor devices can be relayed, and the code can be easily extended support over 100+ more
  
The Helium Bridge software and PCB design was sponsored by an innovation grant from the [Helium Foundation](https://www.helium.foundation/) to be made available open source. This work is freely available for use under its [MIT License](https://github.com/dirkbeer/Helium-Bridge/blob/main/LICENSE), copyright (c) 2023 Dirk Beer and [Gristle King, Inc](https://gristleking.com/). 

![image](https://github.com/dirkbeer/Helium-Bridge/assets/6425332/b7afec78-9378-4a55-8d24-4b64e4c9f2e4)


The Arduino code builds on these outstanding projects:

* [LMIC-node](https://github.com/lnlp/LMIC-node), an example LoRaWAN application for a node for The Things Network that helps get your node up and running quickly.
* [rtl_433_ESP](https://github.com/NorthernMan54/rtl_433_ESP), an Arduino library for use on ESP32 boards with a CC1101 transceiver or SX127X Transceivers with the device decoders from the rtl_433 package.
* [rtl_433](https://github.com/merbanan/rtl_433), which (despite the name) is a generic data receiver, mainly for the 433.92 MHz, 868 MHz (SRD), 315 MHz, 345 MHz, and 915 MHz ISM bands.

A previous version of this project with code specifically for the FineOffset WS-80, with some additional data handling for that device, is available at [Helium_Bridge_WS80](https://github.com/dirkbeer/Helium_Bridge_WS80). The PCB design is the same for both projects.

## Application
* Currently supports these sensor devices (easily extended on demand)
  * Fine Offset WS-80 weather station
  * Fine Offset WH-45 indoor air quality monitor
  * Acurite Tower temperature and humidity sensor
        
## Helium Bridge Device
* PCB board design for
  * LILYGO® TTGO LoRa32 V2.1_1.6 [link](https://www.lilygo.cc/products/lora3)
  * CC1101 RF Tranceiver Module "CC1101 868MHz" (green, squarish, no pins) [link](https://www.ebay.com/itm/311955775989)
  * Treedix 5V 150mA Polysilicon Solar Panel [link](https://www.amazon.com/gp/product/B0831CMJB9)
  * uxcell 5-Pin Micro USB Type B Male Connector [link](https://www.amazon.com/gp/product/B014GMP4E4)

## Getting started
# Build a Helium Bridge device
You can start from scratch using our [PCB design](https://github.com/dirkbeer/Helium-Bridge/tree/main/pcb/LoRaWan_Bridge_18650_CC1101SMD), or buy a PCB or complete device from [Gristle King, Inc](https://gristleking.com/)
1. If desired, have the PCB printed
  * Open the PCB design files in `/pcb/LoRaWan_Bridge_18650_CC1101SMD` using Kicad 7.0
  * Export a Gerber zip file
  * Order a PCB and solder mask from online services. We used OSH Park and OSH Stencils.
2. In addition to the items listed above, you will need:
  * Solder paste and a method to reflow solder surface mount devices (SMDs)
  * 2.54mm pitch male and female straight single row pin headers for the Lyligo board, like the ones included in this kit [link](https://www.amazon.com/gp/product/B07CK3RCKS). You could also solder the board directly to the PCB, but it's very hard to unsolder if you run into problems.
  * An 18650 battery holder with through pins [link](https://www.digikey.com/short/39pht8dp)
  * A battery connector pigtail for connecting the Lilygo board to the battery [link]()
  * An SMD U.FL connector

********************************
*** editing in progress here ***
********************************

# Run the Helium Bridge software
1. Set up a new Device on a Helium Console. Edit `keyfiles/lorawan-keys_example.h` with your keys and save it as `keyfiles/lorawan-keys.h`
2. Configure the PlatformIO project. In the `platformio.ini` file, under `[env:ttgo_lora32_v21_rtl433_cc1101]` `build flags =`, specify
  * `'-DOOK_MODULATION=true' '-DRF_MODULE_FREQUENCY=433.92'` for 433MHz devices like the Acurite
  * `'-DOOK_MODULATION=false' '-DRF_MODULE_FREQUENCY=915.00'` for 915MHz devices like the Fine Offset devices
3. Upload and Monitor All using PlatformIO.
  * If LoRaWAN is working correctly, you should see the device sucessfully joining on the Helium Console.
  * If the sensor decoding is working correctly, and you have one of the supported sensors up and running nearby, you should see JSON sensor data in the PlatformIO terminal
4. Set up a custom decoder Function in the Helium Console
  * Copy the content of `decoder.js` as the custom script. Test the script with this example sensor data: `de7044af0a81cc`. You should see temperature and humidity. Save.
  * Connect your Device to the Function you just created, and to an Integration like MQTT.
  * If everything is working, you should see data packets received in the Console, and decoded data in the Console debugger and to your Integration

## Using the device
1. If desired, switch between 433MHz and 915MHz reception by sending a Downlink to the Device
  * Downlink settings should be FPort: _100_, Payload type: _Text_, Confirmation: _None_
  * For 433MHz, send a `4`, for 915MHz, send a `9`
  * It may take several tries. The downlink should restart the device, so when it's successful, you will see JOIN requests in Console.
