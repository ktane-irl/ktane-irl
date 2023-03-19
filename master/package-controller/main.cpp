// SPI Master Interface
#include <bcm2835.h>
#include <stdio.h>

#include <bitset>
#include <cassert>
#include <iostream>
#include <list>
#include <vector>

#include "crc.cpp"
#include "server.cpp"
#include "spi.cpp"

#define MAX_SLAVES 13

using namespace std;

int g_module_pos; // module position for usage across functions
struct package // custom struct for packages
{
    char cmd;
    char len;
    char *data;
    char crc;

    package(char cmd, char len, char *data, char crc)
    {
        this->cmd = cmd;
        this->len = len;
        this->data = data;
        this->crc = crc;
    }
    package(char cmd, char len, char *data)
    {
        this->cmd = cmd;
        this->len = len;
        this->data = data;
        this->crc = calcCRC(cmd, len, data);
    }
};

std::list<package> list_array_miso[MAX_SLAVES] = {}; // List for incoming packages for all slaves
std::list<package> list_array_mosi[MAX_SLAVES] = {}; // List for outgoing packages for all slaves
vector<char> socketInBuffer = {};
vector<char> socketOutBuffer = {};
char connectedModules[5] = {255, 1, 2, 0, 0}; // custom package for connected modules
char prevConnectedModules[5] = {255, 1, 2, 0, 0};

void sendError(char pos, char code) // function to create error codes
{
    socketOutBuffer.push_back(0xFF);
    socketOutBuffer.push_back(0xFE);
    socketOutBuffer.push_back(0x02);
    socketOutBuffer.push_back(pos);
    socketOutBuffer.push_back(code);
}

void socketInToMosi() // convert buffers received via TCP to packages for slaves
{
    if (socketInBuffer.size() == 0)
    {
        return;
    }
    while (socketInBuffer.size() >= 1)
    {
        char slave = socketInBuffer.back(); // extract slave
        socketInBuffer.pop_back();
        char cmd = socketInBuffer.back(); // extract command
        socketInBuffer.pop_back();
        char len = socketInBuffer.back(); // extract length
        socketInBuffer.pop_back();
        char *data;
        if (len == 0)
            data = nullptr;
        if (len > 0)
        {
            data = new char[len];
            for (int i = 0; i < len; i++)
            {
                data[i] = socketInBuffer.back(); // extract data
                socketInBuffer.pop_back();
            }
        }
        package p(cmd, len, data); // create package
        if (slave >= MAX_SLAVES)
        {
            sendError(0xFF, 10);
            cout << "Send Error slave out of range" << endl;
        }
        else
        {
            list_array_mosi[slave].push_back(p); // add package to outgoing buffer for the correct slave
        }
    }
    for (int i = 0; i < MAX_SLAVES; i++)
    {
        list_array_mosi[i].reverse(); // reverse the package order to mirror the received order
    }
}

void misoToSocketOut() // convert packages to vector for TCP
{
    for (int i = 0; i < MAX_SLAVES; i++)
    {
        list_array_miso[i].reverse(); // reverse the package order to mirror the received order
        while (list_array_miso[i].size() > 0)
        {
            package p = list_array_miso[i].back();
            list_array_miso[i].pop_back();
            socketOutBuffer.push_back(i); // add position
            socketOutBuffer.push_back(p.cmd); // add command
            socketOutBuffer.push_back(p.len); // add length
            for (int j = 0; j < p.len; j++) 
            {
                socketOutBuffer.push_back(p.data[j]); // add data
            }
        }
    }
}

const list<package> transmit(const list<package> &packages, int module_pos) // function for SPI exchange
{
    vector<char> outBuffer;
    vector<char> ackBuffer;
    for (auto &p : packages) // convert all packages for client to a vector
    {
        outBuffer.push_back(p.crc);
        for (int i = 0; i < p.len; i++)
        {
            outBuffer.push_back(p.data[p.len - i - 1]);
        }
        outBuffer.push_back(p.len);
        outBuffer.push_back(p.cmd);
        delete[] p.data;
    }
    vector<char> inBuffer; // create buffer for incoming data
    inBuffer.reserve(outBuffer.capacity());

    list<package> packagesIn;

    enum state
    {
        CMD = 0,
        LEN = 1,
        DATA = 2,
        CRC = 3
    };

    state currentState = CMD;
    char len = 0;
    bool end;
    bool error = false;
    int i = 0;
    int iterations = 0;

    do
    {
        end = false;
        char out = 0x00;
        if (outBuffer.size() > 0)
        {
            out = outBuffer.back(); // get last byte from vector
            outBuffer.pop_back();
        }
        char in = bcm2835_spi_transfer(out); // exchange one byte
        iterations++;
        // printf("pos: %x, out: %x, in: %x, state: %x \n", g_module_pos, out, in, currentState); // function to print exchanged data

        if (currentState == CMD) // waiting for command
        {
            if (in == 0x00)
            {
                i++;
                if (i >= 2)
                {
                    end = true;
                }
            }
            else if (in == 0xFF) // error
            {
                end = true;
                error = true;
            }
            else // normal command
            {
                inBuffer.push_back(in);
                currentState = LEN;
            }
        }
        else if (currentState == LEN) // waiting for len
        {
            inBuffer.push_back(in);
            len = in;
            currentState = len ? DATA : CRC;
        }
        else if (currentState == DATA) // waiting for data
        {
            inBuffer.push_back(in);
            len--;
            if (len == 0)
            {
                currentState = CRC;
            }
        }
        else if (currentState == CRC) // waiting for crc
        {
            inBuffer.push_back(in);
            currentState = CMD;

            // check CRC, if correct put ACK in out Buffer, else put CRC Error in out Buffer; clear in buffer
            {
                char cmd = inBuffer.at(0);
                char len = inBuffer.at(1);
                char *data = new char[len];
                for (int i = 0; i < len; i++)
                {
                    data[i] = inBuffer.at(i + 2);
                }
                char crc = inBuffer.at(len + 2);

                if (checkCRC(cmd, len, data, crc) && len > 0)
                {
                    // send ACK to Client
                    ackBuffer.push_back(cmd);
                    ackBuffer.push_back(0x01);
                    ackBuffer.push_back(data[0]); // data
                    ackBuffer.push_back(calcCRC(cmd, 0x01, data));
                    packagesIn.push_back(package(cmd, len, data, crc));
                }
                else if (checkCRC(cmd, len, data, crc))
                {
                    sendError(module_pos, 0x02); // create error command for backend
                    cout << "Send Error len 0" << endl;
                }
                else
                {
                    sendError(module_pos, 0x01); // create error command for backend
                    cout << "Send Error CRC Fail: cmd:" << std::hex << +cmd
                         << " len:" << std::hex << +len
                         << " crc:" << std::hex << +crc << endl;
                }
                inBuffer.clear();
            }
        }
        if (outBuffer.size() == 0 && ackBuffer.size() > 0) // add acknowledges to buffer if there are no more outgoing packages
        {
            while (ackBuffer.size() > 0)
            {
                outBuffer.push_back(ackBuffer.back());
                ackBuffer.pop_back();
            }
        }

        if (iterations > 20 && outBuffer.size() == 0) // forced ending to prevent slave working incorrectly
            end = true;

    } while (outBuffer.size() > 0 || !end);

    return packagesIn;
}

void send_module(char module_gpio, char module_pos)
{
    g_module_pos = module_pos;
    bcm2835_gpio_write(module_gpio, LOW); // Slave Select
    int receive_counter = 0;
    while (receive_counter < 20) // logic for communication initalization
    {
        char ret = bcm2835_spi_transfer(0x00);
        if (ret == 0xFF) // store disconnected module
        {
            if (module_pos < 8)
                connectedModules[4] &= ~(1 << (int)module_pos);
            else if (module_pos < 16)
                connectedModules[3] &= ~(1 << (int)module_pos);
            break;
        }
        else if (ret == 0x5A)
        {
            ret = bcm2835_spi_transfer(0x5A);
            if (ret == 0x7E)
            {
                ret = bcm2835_spi_transfer(0x7E);
                if (bitset<8>(ret).count() > 2)
                {
                    //store connected module
                    if (module_pos < 8)
                        connectedModules[4] |= (1 << (int)module_pos);
                    else if (module_pos < 16)
                        connectedModules[3] |= (1 << (int)module_pos);
                    list_array_miso[module_pos] = transmit(list_array_mosi[module_pos], module_pos);
                    break;
                }
                else
                {
                    receive_counter++;
                }
            }
            else
            {
                receive_counter++;
            }
        }
        else
        {
            receive_counter++;
        }
    }
    bcm2835_gpio_write(module_gpio, HIGH); // Slave Deselect
}

int main()
{
    cout << "Start" << endl;
    if (!spi_init())
        return 1;

    in_port_t port = PORT;
    sockpp::socket_initializer sockInit;
    sockpp::tcp_acceptor acc(port);
    if (!acc)
    {
        cerr << "Error creating TCP acceptor: " << acc.last_error_str() << endl;
    }
    sockpp::inet_address peer;

    int iterations = 0;
    int currentSlave = 0;
    char currentSlaveGPIO[MAX_SLAVES] = {GPIO_M0,
                                         GPIO_M1,
                                         GPIO_M2,
                                         GPIO_M3,
                                         GPIO_M4,
                                         GPIO_M5,
                                         GPIO_M6,
                                         GPIO_M7,
                                         GPIO_M8,
                                         GPIO_M9,
                                         GPIO_M10,
                                         GPIO_M11,
                                         GPIO_M12}; // create list with all Slaves
    auto start = chrono::system_clock::now(); // store time for logging
    sockpp::tcp_socket sock = acc.accept(&peer);
    bool connected = true;
    while (1)
    {
        if (connected == false) // reconnection logic
        {
            cout << "Client disconnected" << endl;
            for (int i = 0; i < MAX_SLAVES; i++) // reset all modules when tcp is disconnected
            {
                bcm2835_gpio_write(currentSlaveGPIO[i], LOW);
                char rst[] = {0xFC, 0x00, 0xE8};
                bcm2835_spi_transfern(rst, 3);
                bcm2835_gpio_write(currentSlaveGPIO[i], HIGH);
            }
            cout << "Waiting for new connection" << endl;
            sock = acc.accept(&peer);
            cout << "New connection" << endl;
            socketOutBuffer.clear();
            socketInBuffer.clear();
            assert(socketOutBuffer.size() == 0);
            assert(socketInBuffer.size() == 0);
            connected = true;
            prevConnectedModules[3] = 0;
            prevConnectedModules[4] = 0;
        }
        misoToSocketOut(); // generate data to send via TCP
        connected = exchangePackages(sock, socketInBuffer, socketOutBuffer); // exchange via TCP
        socketInToMosi(); // generate packages from received TCP data
        socketInBuffer.clear();

        for (int i = 0; i < MAX_SLAVES; i++) // iterate through all slaves and exchange data
        {
            send_module(currentSlaveGPIO[i], i);
            list_array_mosi[i].clear();
        }

        if (prevConnectedModules[3] != connectedModules[3] || prevConnectedModules[4] != connectedModules[4]) // check for changes in connected modules and add package to TCP data if modules changed
        {
            cout << "conn modules changed" << endl;
            for (int i = 0; i < 5; i++)
            {
                socketOutBuffer.push_back(connectedModules[i]);
            }
        }

        for (int i = 0; i < 5; i++)
            prevConnectedModules[i] = connectedModules[i];

        // delay(100);
        iterations++;
        if (iterations % 250 == 0) // print logging each 250 iterations
        {
            auto now = chrono::system_clock::now();
            std::time_t curr_time = std::chrono::system_clock::to_time_t(now);
            std::chrono::duration<double> diff = now - start;
            cout << std::ctime(&curr_time) << diff.count() << " Iterations: " << iterations << endl;
            cout << endl;
            for (int i = 0; i < 5; i++)
            {
                socketOutBuffer.push_back(connectedModules[i]); // send connected modules each 250 iterations
            }
        }
    }
    bcm2835_spi_end(); // end spi connection
    cout << "DONE" << endl;

    return 0;
}
