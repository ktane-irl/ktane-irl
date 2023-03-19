#pragma once
#include <CRC8.h>
#include <CircularBuffer.h>

/**
 * add_event(const uint8_t data[])
 *
 * add_events_to_send_buffer()
 *
 * remove_event(const uint8_t counter)
 *
 *  constructor: template <uint8_t DATA_LEN> EventBuffer(cmd)
 */

// TODO: Add documentation

template <uint8_t DATA_LEN>
class Event {
   public:
    uint8_t data_[DATA_LEN];
    Event() {}
    Event(const uint8_t &counter, const uint8_t (&event_data)[DATA_LEN - 1]) {
        data_[0] = counter;
        for (int i = 1; i < DATA_LEN; i++) {
            data_[i] = event_data[i - 1];
        }
    }
};

template <uint8_t DATA_LEN>
class EventBuffer {
    uint8_t counter_ = 0;
    const uint8_t cmd_;
    CircularBuffer<Event<DATA_LEN>, 8> buffer;

   public:
    EventBuffer(const uint8_t cmd) : cmd_(cmd){};

    uint8_t get_cmd() const {
        return cmd_;
    }

    uint8_t get_counter() const {
        return counter_;
    }

    void increment_counter() {
        counter_++;
    }

    uint8_t get_len() const {
        return DATA_LEN;
    }

    uint8_t get_event_count() const {
        return buffer.size();
    }

    void add_event(const Event<DATA_LEN> event) {
        buffer.push(event);
        counter_++;
    }

    void remove_first_event() {
        buffer.shift();
    }

    Event<DATA_LEN> peek_event() const {
        return buffer.first();
    }

    Event<DATA_LEN> get_event(uint8_t index) const {
        return buffer[index];
    }

    bool has_events() const {
        return !buffer.isEmpty();
    }

    bool fits_in_send_buffer(CircularBuffer<uint8_t, 70> &send_buffer) { //TX-Buffer size changed
        uint8_t total_frame_len = DATA_LEN + 3;
        return send_buffer.available() >= total_frame_len;
    }
};

// TODO: Make 258 in circ buf parameter templated to SEND_BUFFER_SIZE
template <uint8_t DATA_LEN, uint8_t SEND_BUFFER_SIZE>
void push_ev_to_send_buf(EventBuffer<DATA_LEN> &ev_buf, CircularBuffer<uint8_t, 70> &send_buffer) { //TX-Buffer size changed
    if (!ev_buf.has_events()) {
        return;
    }

    if (!ev_buf.fits_in_send_buffer(send_buffer)) {
        // TODO ERROR Handling //Serial.println("Error: Not enough space in send buffer");
        return;
    }

    CRC8 crc;
    uint8_t cmd = ev_buf.get_cmd();
    uint8_t len = ev_buf.get_len();

    // Loop over elements in ev_buf
    for (int i = 0; i < ev_buf.get_event_count(); i++) {
        // Get element at current index
        Event<DATA_LEN> ev = ev_buf.get_event(i);

        // Add event to send buffer
        send_buffer.push(cmd);
        crc.add(cmd);
        send_buffer.push(len);
        crc.add(len);
        for (int i = 0; i < DATA_LEN; i++) {
            send_buffer.push(ev.data_[i]);
            crc.add(ev.data_[i]);
        }
        send_buffer.push(crc.getCRC());
        crc.reset();
    }
}
