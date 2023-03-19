#include <bcm2835.h>
#define GPIO_M0 RPI_V2_GPIO_P1_24
#define GPIO_M1 RPI_V2_GPIO_P1_36
#define GPIO_M2 RPI_V2_GPIO_P1_11
#define GPIO_M3 RPI_V2_GPIO_P1_12
#define GPIO_M4 RPI_V2_GPIO_P1_35
#define GPIO_M5 RPI_V2_GPIO_P1_38
#define GPIO_M6 RPI_V2_GPIO_P1_40
#define GPIO_M7 RPI_V2_GPIO_P1_15
#define GPIO_M8 RPI_V2_GPIO_P1_16
#define GPIO_M9 RPI_V2_GPIO_P1_18
#define GPIO_M10 RPI_V2_GPIO_P1_22
#define GPIO_M11 RPI_V2_GPIO_P1_37
#define GPIO_M12 RPI_V2_GPIO_P1_13

#include <iostream>

using namespace std;

int spi_init()
{
    if (!bcm2835_init()) // initalize bcm library
        return 0;
    if (!bcm2835_spi_begin()) //activate SPI
        return 0;
    bcm2835_spi_setDataMode(BCM2835_SPI_MODE0); // Use CLK, MISO, MOSI Ports of SPI0
    bcm2835_spi_setClockDivider(BCM2835_SPI_CLOCK_DIVIDER_8192); // Clock divider to achieve desired SPI speed

    bcm2835_spi_chipSelect(BCM2835_SPI_CS_NONE); // Disable automatic chip select
    bcm2835_spi_setChipSelectPolarity(BCM2835_SPI_CS0, LOW); // Set Slave Select to LOW signal

    // Define Digital Pins for Slave Selects
    bcm2835_gpio_fsel(GPIO_M0, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M1, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M2, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M3, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M4, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M5, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M6, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M7, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M8, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M9, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M10, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M11, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(GPIO_M12, BCM2835_GPIO_FSEL_OUTP);
    return 1;
}
