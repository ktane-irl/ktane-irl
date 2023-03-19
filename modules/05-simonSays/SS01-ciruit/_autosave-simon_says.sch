EESchema Schematic File Version 5
EELAYER 36 0
EELAYER END
$Descr A3 16535 11693
encoding utf-8
Sheet 1 1
Title ""
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
Comment5 ""
Comment6 ""
Comment7 ""
Comment8 ""
Comment9 ""
$EndDescr
Connection ~ 5500 1500
Connection ~ 5600 6000
Connection ~ 7050 4200
Connection ~ 7150 4500
Connection ~ 7900 1500
Connection ~ 7900 2350
Connection ~ 7900 4200
Connection ~ 7900 4500
Connection ~ 7900 5100
Connection ~ 7900 5200
Connection ~ 7900 6000
Connection ~ 8800 1500
Connection ~ 9350 1500
Connection ~ 9800 1500
Connection ~ 10250 1500
Wire Wire Line
	1650 1500 5500 1500
Wire Wire Line
	1650 2050 1650 1500
Wire Wire Line
	1650 2550 1650 6000
Wire Wire Line
	1650 6000 5600 6000
Wire Wire Line
	1750 1700 2250 1700
Wire Wire Line
	1750 2050 1750 1700
Wire Wire Line
	1750 2550 1750 5050
Wire Wire Line
	1750 5050 5100 5050
Wire Wire Line
	1850 1850 2150 1850
Wire Wire Line
	1850 2050 1850 1850
Wire Wire Line
	1850 2550 1850 4950
Wire Wire Line
	1850 4950 5100 4950
Wire Wire Line
	2150 1850 2150 4850
Wire Wire Line
	2150 4850 5100 4850
Wire Wire Line
	2250 1700 2250 4750
Wire Wire Line
	2250 4750 5100 4750
Wire Wire Line
	4650 2150 7200 2150
Wire Wire Line
	4650 4150 4650 2150
Wire Wire Line
	4750 2350 7200 2350
Wire Wire Line
	4750 4050 4750 2350
Wire Wire Line
	4850 2550 7200 2550
Wire Wire Line
	4850 3950 4850 2550
Wire Wire Line
	5100 3950 4850 3950
Wire Wire Line
	5100 4050 4750 4050
Wire Wire Line
	5100 4150 4650 4150
Wire Wire Line
	5500 1500 5500 3350
Wire Wire Line
	5500 1500 7900 1500
Wire Wire Line
	5600 6000 5600 5350
Wire Wire Line
	6100 4850 7150 4850
Wire Wire Line
	7050 3600 7050 4200
Wire Wire Line
	7050 4200 7050 4750
Wire Wire Line
	7050 4750 6100 4750
Wire Wire Line
	7150 3700 8100 3700
Wire Wire Line
	7150 4500 7150 3700
Wire Wire Line
	7150 4850 7150 4500
Wire Wire Line
	7350 4200 7050 4200
Wire Wire Line
	7350 4500 7150 4500
Wire Wire Line
	7600 2350 7900 2350
Wire Wire Line
	7650 4200 7900 4200
Wire Wire Line
	7650 4500 7900 4500
Wire Wire Line
	7900 2350 7900 1500
Wire Wire Line
	7900 4200 7900 2350
Wire Wire Line
	7900 4500 7900 4200
Wire Wire Line
	7900 5000 7900 5100
Wire Wire Line
	7900 5100 7900 5200
Wire Wire Line
	7900 5200 7900 6000
Wire Wire Line
	7900 6000 5600 6000
Wire Wire Line
	7900 6000 8800 6000
Wire Wire Line
	8100 3600 7050 3600
Wire Wire Line
	8100 4500 7900 4500
Wire Wire Line
	8100 5000 7900 5000
Wire Wire Line
	8100 5100 7900 5100
Wire Wire Line
	8100 5200 7900 5200
Wire Wire Line
	8800 1500 7900 1500
Wire Wire Line
	8800 1500 9350 1500
Wire Wire Line
	8800 3300 8800 1500
Wire Wire Line
	8800 5500 8800 6000
Wire Wire Line
	9350 1500 9350 1950
Wire Wire Line
	9350 1500 9800 1500
Wire Wire Line
	9350 2250 9350 3150
Wire Wire Line
	9350 3150 9500 3150
Wire Wire Line
	9500 3150 9500 3600
Wire Wire Line
	9800 1500 9800 1950
Wire Wire Line
	9800 1500 10250 1500
Wire Wire Line
	9800 2250 9800 3700
Wire Wire Line
	9800 3700 9500 3700
Wire Wire Line
	10250 1500 10250 1950
Wire Wire Line
	10250 1500 10700 1500
Wire Wire Line
	10250 2250 10250 3800
Wire Wire Line
	10250 3800 9500 3800
Wire Wire Line
	10700 1500 10700 1950
Wire Wire Line
	10700 2250 10700 3900
Wire Wire Line
	10700 3900 9500 3900
Text Notes 5700 2100 0    50   ~ 0
TODO: Widerstände hinzufügen !!!
Text Label 1450 2600 0    50   ~ 0
GND
Text Label 1700 1500 0    50   ~ 0
5V
Text Label 1700 2700 0    50   ~ 0
CLK
Text Label 1750 1700 0    50   ~ 0
SS
Text Label 1850 1850 0    50   ~ 0
MOSI
Text Label 1900 2700 0    50   ~ 0
MISO
$Comp
L Device:R R?
U 1 1 6353DB23
P 7500 4200
AR Path="/6353DB23" Ref="R?"  Part="1" 
AR Path="/6353DB23" Ref="R?"  Part="1" 
F 0 "R?" V 7293 4200 50  0000 C CNN
F 1 "4,7 k" V 7384 4200 50  0000 C CNN
F 2 "" V 7430 4200 50  0001 C CNN
F 3 "~" H 7500 4200 50  0001 C CNN
	1    7500 4200
	0    1    1    0   
$EndComp
$Comp
L Device:R R?
U 1 1 6353ECAB
P 7500 4500
AR Path="/6353ECAB" Ref="R?"  Part="1" 
AR Path="/6353ECAB" Ref="R?"  Part="1" 
F 0 "R?" V 7293 4500 50  0000 C CNN
F 1 "4,7 k" V 7384 4500 50  0000 C CNN
F 2 "" V 7430 4500 50  0001 C CNN
F 3 "~" H 7500 4500 50  0001 C CNN
	1    7500 4500
	0    1    1    0   
$EndComp
$Comp
L Device:LED D?
U 1 1 00000000
P 9350 2100
F 0 "D?" V 9338 1950 50  0000 R CNN
F 1 "LED_RED" V 9450 2100 50  0000 R CNN
F 2 "" H 9350 2100 50  0001 C CNN
F 3 "~" H 9350 2100 50  0001 C CNN
	1    9350 2100
	0    -1   -1   0   
$EndComp
$Comp
L Device:LED D?
U 1 1 00000000
P 9800 2100
F 0 "D?" V 9788 1950 50  0000 R CNN
F 1 "LED_GREEN" V 9900 2150 50  0000 R CNN
F 2 "" H 9800 2100 50  0001 C CNN
F 3 "~" H 9800 2100 50  0001 C CNN
	1    9800 2100
	0    -1   -1   0   
$EndComp
$Comp
L Device:LED D?
U 1 1 00000000
P 10250 2100
F 0 "D?" V 10238 1950 50  0000 R CNN
F 1 "LED_BLUE" V 10350 2100 50  0000 R CNN
F 2 "" H 10250 2100 50  0001 C CNN
F 3 "~" H 10250 2100 50  0001 C CNN
	1    10250 2100
	0    -1   -1   0   
$EndComp
$Comp
L Device:LED D?
U 1 1 00000000
P 10700 2100
F 0 "D?" V 10688 1950 50  0000 R CNN
F 1 "LED_YELLOW" V 10800 2100 50  0000 R CNN
F 2 "" H 10700 2100 50  0001 C CNN
F 3 "~" H 10700 2100 50  0001 C CNN
	1    10700 2100
	0    -1   -1   0   
$EndComp
$Comp
L Connector_Generic:Conn_02x03_Odd_Even J?
U 1 1 63504B64
P 1750 2350
AR Path="/63504B64" Ref="J?"  Part="1" 
AR Path="/63504B64" Ref="J?"  Part="1" 
F 0 "J?" V 1846 2162 50  0000 R CNN
F 1 "MODULE Connector" V 1755 2162 50  0000 R CNN
F 2 "" H 1750 2350 50  0001 C CNN
F 3 "~" H 1750 2350 50  0001 C CNN
	1    1750 2350
	0    -1   -1   0   
$EndComp
$Comp
L Device:LED_BAGR D?
U 1 1 6351E6D1
P 7400 2350
AR Path="/6351E6D1" Ref="D?"  Part="1" 
AR Path="/6351E6D1" Ref="D?"  Part="1" 
F 0 "D?" H 7400 2847 50  0000 C CNN
F 1 "LED_BAGR" H 7400 2756 50  0000 C CNN
F 2 "" H 7400 2300 50  0001 C CNN
F 3 "~" H 7400 2300 50  0001 C CNN
	1    7400 2350
	1    0    0    -1  
$EndComp
$Comp
L MCU_Module:Arduino_Nano_v3.x A?
U 1 1 635060DB
P 5600 4350
AR Path="/635060DB" Ref="A?"  Part="1" 
AR Path="/635060DB" Ref="A?"  Part="1" 
F 0 "A?" H 5600 3261 50  0000 C CNN
F 1 "Arduino_Nano_v3.x" H 5600 3170 50  0000 C CNN
F 2 "Module:Arduino_Nano" H 5600 4350 50  0001 C CIN
F 3 "http://www.mouser.com/pdfdocs/Gravitech_Arduino_Nano3_0.pdf" H 5600 4350 50  0001 C CNN
	1    5600 4350
	1    0    0    -1  
$EndComp
$Comp
L Interface_Expansion:MCP23017_SO U?
U 1 1 6352C435
P 8800 4400
AR Path="/6352C435" Ref="U?"  Part="1" 
AR Path="/6352C435" Ref="U?"  Part="1" 
F 0 "U?" H 8800 5681 50  0000 C CNN
F 1 "MCP23017_SO" H 8800 5590 50  0000 C CNN
F 2 "Package_SO:SOIC-28W_7.5x17.9mm_P1.27mm" H 9000 3400 50  0001 L CNN
F 3 "http://ww1.microchip.com/downloads/en/DeviceDoc/20001952C.pdf" H 9000 3300 50  0001 L CNN
	1    8800 4400
	1    0    0    -1  
$EndComp
$EndSCHEMATC
