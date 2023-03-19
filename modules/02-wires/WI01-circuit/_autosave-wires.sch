EESchema Schematic File Version 5
EELAYER 36 0
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
Comment5 ""
Comment6 ""
Comment7 ""
Comment8 ""
Comment9 ""
$EndDescr
Connection ~ 5500 1500
Connection ~ 5600 6000
Connection ~ 7200 4850
Connection ~ 7200 6000
Connection ~ 7450 4750
Connection ~ 7450 6000
Connection ~ 7700 4650
Connection ~ 7700 6000
Connection ~ 7900 1500
Connection ~ 7950 4550
Connection ~ 7950 6000
Connection ~ 8200 4450
Connection ~ 8200 6000
Connection ~ 8450 4350
Connection ~ 11050 3400
Connection ~ 11050 3750
Connection ~ 11050 4150
Connection ~ 11050 4550
Connection ~ 11050 4900
Wire Wire Line
	1650 1500 5500 1500
Wire Wire Line
	1650 2000 1650 1500
Wire Wire Line
	1650 2500 1650 6000
Wire Wire Line
	1650 6000 5600 6000
Wire Wire Line
	1750 1700 3700 1700
Wire Wire Line
	1750 2000 1750 1700
Wire Wire Line
	1750 2500 1750 2800
Wire Wire Line
	1750 2800 3400 2800
Wire Wire Line
	1850 1850 3600 1850
Wire Wire Line
	1850 2000 1850 1850
Wire Wire Line
	1850 2500 1850 2700
Wire Wire Line
	1850 2700 3500 2700
Wire Wire Line
	3400 2800 3400 5050
Wire Wire Line
	3400 5050 5100 5050
Wire Wire Line
	3500 2700 3500 4950
Wire Wire Line
	3500 4950 5100 4950
Wire Wire Line
	3600 1850 3600 4850
Wire Wire Line
	3600 4850 5100 4850
Wire Wire Line
	3700 1700 3700 4750
Wire Wire Line
	3700 4750 5100 4750
Wire Wire Line
	4650 2150 6550 2150
Wire Wire Line
	4650 4150 4650 2150
Wire Wire Line
	4750 2350 6550 2350
Wire Wire Line
	4750 4050 4750 2350
Wire Wire Line
	4850 2550 4850 3950
Wire Wire Line
	5100 3950 4850 3950
Wire Wire Line
	5100 4050 4750 4050
Wire Wire Line
	5100 4150 4650 4150
Wire Wire Line
	5500 1500 5500 3350
Wire Wire Line
	5600 6000 5600 5350
Wire Wire Line
	5600 6000 7200 6000
Wire Wire Line
	6100 4350 8450 4350
Wire Wire Line
	6100 4450 8200 4450
Wire Wire Line
	6100 4550 7950 4550
Wire Wire Line
	6100 4650 7700 4650
Wire Wire Line
	6100 4750 7450 4750
Wire Wire Line
	6100 4850 7200 4850
Wire Wire Line
	6550 2550 4850 2550
Wire Wire Line
	6850 2150 7200 2150
Wire Wire Line
	6850 2350 7200 2350
Wire Wire Line
	6850 2550 7200 2550
Wire Wire Line
	7200 4850 8900 4850
Wire Wire Line
	7200 5700 7200 4850
Wire Wire Line
	7200 6000 7450 6000
Wire Wire Line
	7450 4750 7450 5700
Wire Wire Line
	7450 4750 9000 4750
Wire Wire Line
	7450 6000 7700 6000
Wire Wire Line
	7600 2350 7900 2350
Wire Wire Line
	7700 4650 7700 5700
Wire Wire Line
	7700 4650 9000 4650
Wire Wire Line
	7700 6000 7950 6000
Wire Wire Line
	7900 1500 5500 1500
Wire Wire Line
	7900 1500 11050 1500
Wire Wire Line
	7900 2350 7900 1500
Wire Wire Line
	7950 4550 7950 5700
Wire Wire Line
	7950 4550 8850 4550
Wire Wire Line
	7950 6000 8200 6000
Wire Wire Line
	8200 4450 8200 5700
Wire Wire Line
	8200 4450 8700 4450
Wire Wire Line
	8200 6000 8450 6000
Wire Wire Line
	8450 4350 8450 5700
Wire Wire Line
	8450 4350 8600 4350
Wire Wire Line
	8600 3400 9700 3400
Wire Wire Line
	8600 4350 8600 3400
Wire Wire Line
	8700 3750 9700 3750
Wire Wire Line
	8700 4450 8700 3750
Wire Wire Line
	8850 4150 9700 4150
Wire Wire Line
	8850 4550 8850 4150
Wire Wire Line
	8900 4850 8900 5250
Wire Wire Line
	8900 5250 9700 5250
Wire Wire Line
	9000 4550 9700 4550
Wire Wire Line
	9000 4650 9000 4550
Wire Wire Line
	9000 4750 9000 4900
Wire Wire Line
	9000 4900 9700 4900
Wire Wire Line
	10100 3400 10350 3400
Wire Wire Line
	10100 3750 10350 3750
Wire Wire Line
	10100 4150 10350 4150
Wire Wire Line
	10100 4550 10350 4550
Wire Wire Line
	10100 4900 10350 4900
Wire Wire Line
	10100 5250 11050 5250
Wire Wire Line
	10650 3400 11050 3400
Wire Wire Line
	10650 3750 11050 3750
Wire Wire Line
	10650 4150 11050 4150
Wire Wire Line
	10650 4550 11050 4550
Wire Wire Line
	10650 4900 11050 4900
Wire Wire Line
	11050 1500 11050 3400
Wire Wire Line
	11050 3400 11050 3750
Wire Wire Line
	11050 3750 11050 4150
Wire Wire Line
	11050 4150 11050 4550
Wire Wire Line
	11050 4550 11050 4900
Wire Wire Line
	11050 4900 11050 5250
Text Notes 5750 1800 0    50   ~ 0
TODO: Widerstandswerte hinzufügen
Text Notes 7350 3100 0    50   ~ 0
Widerstände  um Kabelfarben zu identifizieren:\nJeder Kabelfarbe wird ein Wiederstand und die entsprechende Spannung\nkann dann am Arduino gemessen werden, um die dazugehörige Kabelfarbe zu identifizieren.
Text Label 1450 2600 0    50   ~ 0
GND
Text Label 1700 1500 0    50   ~ 0
5V
Text Label 1750 1700 0    50   ~ 0
SS
Text Label 1800 2800 0    50   ~ 0
CLK
Text Label 1850 1850 0    50   ~ 0
MOSI
Text Label 1900 2700 0    50   ~ 0
MISO
$Comp
L Device:R R?
U 1 1 00000000
P 6700 2150
F 0 "R?" V 6950 2150 50  0000 C CNN
F 1 "R" V 6850 2150 50  0000 C CNN
F 2 "" V 6630 2150 50  0001 C CNN
F 3 "~" H 6700 2150 50  0001 C CNN
	1    6700 2150
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 6700 2350
F 0 "R?" V 6950 2350 50  0000 C CNN
F 1 "R" V 6850 2350 50  0000 C CNN
F 2 "" V 6630 2350 50  0001 C CNN
F 3 "~" H 6700 2350 50  0001 C CNN
	1    6700 2350
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 6700 2550
F 0 "R?" V 6950 2550 50  0000 C CNN
F 1 "R" V 6850 2550 50  0000 C CNN
F 2 "" V 6630 2550 50  0001 C CNN
F 3 "~" H 6700 2550 50  0001 C CNN
	1    6700 2550
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 7200 5850
F 0 "R?" H 7300 5900 50  0000 L CNN
F 1 "10K" H 7300 5800 50  0000 L CNN
F 2 "" V 7130 5850 50  0001 C CNN
F 3 "~" H 7200 5850 50  0001 C CNN
	1    7200 5850
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 7450 5850
F 0 "R?" H 7550 5900 50  0000 L CNN
F 1 "10K" H 7550 5800 50  0000 L CNN
F 2 "" V 7380 5850 50  0001 C CNN
F 3 "~" H 7450 5850 50  0001 C CNN
	1    7450 5850
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 7700 5850
F 0 "R?" H 7800 5900 50  0000 L CNN
F 1 "10K" H 7800 5800 50  0000 L CNN
F 2 "" V 7630 5850 50  0001 C CNN
F 3 "~" H 7700 5850 50  0001 C CNN
	1    7700 5850
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 7950 5850
F 0 "R?" H 8050 5900 50  0000 L CNN
F 1 "10K" H 8050 5800 50  0000 L CNN
F 2 "" V 7880 5850 50  0001 C CNN
F 3 "~" H 7950 5850 50  0001 C CNN
	1    7950 5850
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 8200 5850
F 0 "R?" H 8300 5900 50  0000 L CNN
F 1 "10K" H 8300 5800 50  0000 L CNN
F 2 "" V 8130 5850 50  0001 C CNN
F 3 "~" H 8200 5850 50  0001 C CNN
	1    8200 5850
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 8450 5850
F 0 "R?" H 8550 5900 50  0000 L CNN
F 1 "10K" H 8550 5800 50  0000 L CNN
F 2 "" V 8380 5850 50  0001 C CNN
F 3 "~" H 8450 5850 50  0001 C CNN
	1    8450 5850
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 10500 3400
F 0 "R?" V 10750 3400 50  0000 C CNN
F 1 "40K" V 10650 3400 50  0000 C CNN
F 2 "" V 10430 3400 50  0001 C CNN
F 3 "~" H 10500 3400 50  0001 C CNN
	1    10500 3400
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 10500 3750
F 0 "R?" V 10750 3750 50  0000 C CNN
F 1 "15K" V 10650 3750 50  0000 C CNN
F 2 "" V 10430 3750 50  0001 C CNN
F 3 "~" H 10500 3750 50  0001 C CNN
	1    10500 3750
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 10500 4150
F 0 "R?" V 10750 4150 50  0000 C CNN
F 1 "6K" V 10650 4150 50  0000 C CNN
F 2 "" V 10430 4150 50  0001 C CNN
F 3 "~" H 10500 4150 50  0001 C CNN
	1    10500 4150
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 10500 4550
F 0 "R?" V 10750 4550 50  0000 C CNN
F 1 "2" V 10650 4550 50  0000 C CNN
F 2 "" V 10430 4550 50  0001 C CNN
F 3 "~" H 10500 4550 50  0001 C CNN
	1    10500 4550
	0    -1   -1   0   
$EndComp
$Comp
L Device:R R?
U 1 1 00000000
P 10500 4900
F 0 "R?" V 10750 4900 50  0000 C CNN
F 1 "R" V 10650 4900 50  0000 C CNN
F 2 "" V 10430 4900 50  0001 C CNN
F 3 "~" H 10500 4900 50  0001 C CNN
	1    10500 4900
	0    -1   -1   0   
$EndComp
$Comp
L Switch:SW_SPST SW?
U 1 1 63528297
P 9900 3400
AR Path="/63528297" Ref="SW?"  Part="1" 
AR Path="/63528297" Ref="SW?"  Part="1" 
F 0 "SW?" H 9900 3635 50  0000 C CNN
F 1 "SW_SPST" H 9900 3544 50  0000 C CNN
F 2 "" H 9900 3400 50  0001 C CNN
F 3 "~" H 9900 3400 50  0001 C CNN
	1    9900 3400
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_SPST SW?
U 1 1 635246B6
P 9900 3750
AR Path="/635246B6" Ref="SW?"  Part="1" 
AR Path="/635246B6" Ref="SW?"  Part="1" 
F 0 "SW?" H 9900 3985 50  0000 C CNN
F 1 "SW_SPST" H 9900 3894 50  0000 C CNN
F 2 "" H 9900 3750 50  0001 C CNN
F 3 "~" H 9900 3750 50  0001 C CNN
	1    9900 3750
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_SPST SW?
U 1 1 635231F0
P 9900 4150
AR Path="/635231F0" Ref="SW?"  Part="1" 
AR Path="/635231F0" Ref="SW?"  Part="1" 
F 0 "SW?" H 9900 4385 50  0000 C CNN
F 1 "SW_SPST" H 9900 4294 50  0000 C CNN
F 2 "" H 9900 4150 50  0001 C CNN
F 3 "~" H 9900 4150 50  0001 C CNN
	1    9900 4150
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_SPST SW?
U 1 1 6352676F
P 9900 4550
AR Path="/6352676F" Ref="SW?"  Part="1" 
AR Path="/6352676F" Ref="SW?"  Part="1" 
F 0 "SW?" H 9900 4785 50  0000 C CNN
F 1 "SW_SPST" H 9900 4694 50  0000 C CNN
F 2 "" H 9900 4550 50  0001 C CNN
F 3 "~" H 9900 4550 50  0001 C CNN
	1    9900 4550
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_SPST SW?
U 1 1 63526D93
P 9900 4900
AR Path="/63526D93" Ref="SW?"  Part="1" 
AR Path="/63526D93" Ref="SW?"  Part="1" 
F 0 "SW?" H 9900 5135 50  0000 C CNN
F 1 "SW_SPST" H 9900 5044 50  0000 C CNN
F 2 "" H 9900 4900 50  0001 C CNN
F 3 "~" H 9900 4900 50  0001 C CNN
	1    9900 4900
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_SPST SW?
U 1 1 63527569
P 9900 5250
AR Path="/63527569" Ref="SW?"  Part="1" 
AR Path="/63527569" Ref="SW?"  Part="1" 
F 0 "SW?" H 9900 5485 50  0000 C CNN
F 1 "SW_SPST" H 9900 5394 50  0000 C CNN
F 2 "" H 9900 5250 50  0001 C CNN
F 3 "~" H 9900 5250 50  0001 C CNN
	1    9900 5250
	1    0    0    -1  
$EndComp
$Comp
L Connector_Generic:Conn_02x03_Odd_Even J?
U 1 1 63504B64
P 1750 2300
AR Path="/63504B64" Ref="J?"  Part="1" 
AR Path="/63504B64" Ref="J?"  Part="1" 
F 0 "J?" V 1846 2112 50  0000 R CNN
F 1 "MODULE Connector" V 1755 2112 50  0000 R CNN
F 2 "" H 1750 2300 50  0001 C CNN
F 3 "~" H 1750 2300 50  0001 C CNN
	1    1750 2300
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
$EndSCHEMATC
