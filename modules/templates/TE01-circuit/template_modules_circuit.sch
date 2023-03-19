EESchema Schematic File Version 4
EELAYER 30 0
EELAYER END
$Descr A4 11693 8268
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
$EndDescr
Wire Wire Line
	1650 2000 1650 1500
Text Label 1700 1500 0    50   ~ 0
5V
$Comp
L Connector_Generic:Conn_02x03_Odd_Even J?
U 1 1 63504B64
P 1750 2300
F 0 "J?" V 1846 2112 50  0000 R CNN
F 1 "MODULE Connector" V 1755 2112 50  0000 R CNN
F 2 "" H 1750 2300 50  0001 C CNN
F 3 "~" H 1750 2300 50  0001 C CNN
	1    1750 2300
	0    -1   -1   0   
$EndComp
$Comp
L MCU_Module:Arduino_Nano_v3.x A?
U 1 1 635060DB
P 5600 4350
F 0 "A?" H 5600 3261 50  0000 C CNN
F 1 "Arduino_Nano_v3.x" H 5600 3170 50  0000 C CNN
F 2 "Module:Arduino_Nano" H 5600 4350 50  0001 C CIN
F 3 "http://www.mouser.com/pdfdocs/Gravitech_Arduino_Nano3_0.pdf" H 5600 4350 50  0001 C CNN
	1    5600 4350
	1    0    0    -1  
$EndComp
Wire Wire Line
	5500 1500 5500 3350
Wire Wire Line
	1650 2500 1650 6000
Wire Wire Line
	1650 6000 5600 6000
Wire Wire Line
	5600 6000 5600 5350
Text Label 1450 2600 0    50   ~ 0
GND
Wire Wire Line
	1750 2000 1750 1700
Wire Wire Line
	1750 1700 3700 1700
Wire Wire Line
	3700 1700 3700 4750
Wire Wire Line
	3700 4750 5100 4750
Text Label 1750 1700 0    50   ~ 0
SS
Wire Wire Line
	1850 2000 1850 1850
Wire Wire Line
	1850 1850 3600 1850
Wire Wire Line
	3600 1850 3600 4850
Wire Wire Line
	3600 4850 5100 4850
Text Label 1850 1850 0    50   ~ 0
MOSI
Wire Wire Line
	1850 2500 1850 2700
Wire Wire Line
	1850 2700 3500 2700
Wire Wire Line
	3500 2700 3500 4950
Wire Wire Line
	3500 4950 5100 4950
Text Label 1900 2700 0    50   ~ 0
MISO
Wire Wire Line
	1750 2500 1750 2800
Wire Wire Line
	1750 2800 3400 2800
Wire Wire Line
	3400 2800 3400 5050
Wire Wire Line
	3400 5050 5100 5050
Text Label 1800 2800 0    50   ~ 0
CLK
Wire Wire Line
	1650 1500 5500 1500
$Comp
L Device:LED_BAGR D?
U 1 1 6351E6D1
P 7400 2350
F 0 "D?" H 7400 2847 50  0000 C CNN
F 1 "LED_BAGR" H 7400 2756 50  0000 C CNN
F 2 "" H 7400 2300 50  0001 C CNN
F 3 "~" H 7400 2300 50  0001 C CNN
	1    7400 2350
	1    0    0    -1  
$EndComp
Wire Wire Line
	5100 3950 4850 3950
Wire Wire Line
	4850 3950 4850 2550
Wire Wire Line
	4850 2550 7200 2550
Wire Wire Line
	5100 4050 4750 4050
Wire Wire Line
	4750 4050 4750 2350
Wire Wire Line
	4750 2350 7200 2350
Wire Wire Line
	5100 4150 4650 4150
Wire Wire Line
	4650 4150 4650 2150
Wire Wire Line
	4650 2150 7200 2150
Wire Wire Line
	7600 2350 7900 2350
Wire Wire Line
	7900 2350 7900 1500
Wire Wire Line
	7900 1500 5500 1500
Connection ~ 5500 1500
Text Notes 5700 2100 0    50   ~ 0
TODO: Widerstände hinzufügen !!!
$EndSCHEMATC