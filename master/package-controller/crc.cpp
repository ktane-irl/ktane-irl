#define WIDTH (8 * sizeof(char))
#define TOPBIT (1 << (WIDTH - 1))
#define POLYNOMIAL 0x07
#define PORT 3001

using namespace std;

unsigned char calcCRC(char cmd, char len, char *data) {
    char temp[len + 2];

    temp[0] = cmd;
    temp[1] = len;
    for (int i = 0; i < len; i++) {
        temp[i + 2] = data[i];
    }

    unsigned char remainder = 0;
    for (int byte = 0; byte < 2 + len; ++byte) {
        remainder ^= (temp[byte] << (WIDTH - 8));
        for (char bit = 8; bit > 0; --bit) {
            if (remainder & TOPBIT) {
                remainder = (remainder << 1) ^ POLYNOMIAL;
            } else {
                remainder = (remainder << 1);
            }
        }
    }
    return remainder;
}

bool checkCRC(char cmd, char len, char *data, char crc) {
    if (crc == calcCRC(cmd, len, data)) {
        return true;
    } else {
        return false;
    }
}