all: spi-package-controller

spi-package-controller: main.o
	g++ main.o -lbcm2835 -lsockpp -lpthread -o spi-package-controller

main.o: main.cpp server.o spi.o crc.o
	g++ -c main.cpp

server.o: server.cpp
	g++ -c server.cpp

spi.o: spi.cpp
	g++ -c spi.cpp

crc.o: crc.cpp
	g++ -c crc.cpp

clean:
	rm -rf *o spi-package-controller
	rm -rf *o server-test