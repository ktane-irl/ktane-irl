#include <cassert>
#include <iostream>
#include <vector>

#include "sockpp/tcp_acceptor.h"
#include "sockpp/version.h"

#define PORT 3001
#define BUF_SIZE 10000

using namespace std;

bool exchangePackages(sockpp::tcp_socket &sock, vector<char> &socketInBuffer, vector<char> &socketOutBuffer)
{
    assert(socketInBuffer.size() == 0);
    char buf[BUF_SIZE];
    sock.read_timeout(chrono::milliseconds(1)); // set custom timeout for performance reasons
    int n = sock.read(buf, BUF_SIZE); // get data from TCP
    if (n > 0)
    {
        socketInBuffer.reserve(n);
        for (int i = n - 1; i >= 0; i--)
        {
            socketInBuffer.push_back(buf[i]); // store received data in buffer
        }
    }
    char *buf2 = &socketOutBuffer[0];
    sock.write_n(buf2, socketOutBuffer.size()); // send data via TCP
    socketOutBuffer.clear();
    if (n == 0)
    {
        return false; // return false if tcp lost connection
    }
    return true;
}

int tcp_init(sockpp::tcp_socket &sock)
{
    in_port_t port = PORT;
    sockpp::socket_initializer sockInit;
    sockpp::tcp_acceptor acc(port); // create TCP acceptor
    if (!acc)
    {
        cerr << "Error creating TCP acceptor: " << acc.last_error_str() << endl;
        return 0;
    }
    sockpp::inet_address peer;
    sock = acc.accept(&peer); // accept TCP connection
    if (!sock)
    {
        cerr << "Error accepting incoming connection: " << acc.last_error_str() << endl;
        return 0;
    }
    else
    {
        cout << "Accepted connection from " << peer << endl;
        return 1;
    }
}
