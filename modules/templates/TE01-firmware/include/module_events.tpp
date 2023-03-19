/**
 * @file module_events.tpp
 * @author Andreas Forstner, Finn Artmann
 * @brief Event-Handling for modules
 * @version 0.1
 * @date 2023-01-16
 *
 */

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

/**
 * @brief Event class for storing event data. An event consists of a counter which identifies the event and the event data.
 *        The counter should be added to the event by using the get_counter() method of the corresponding EventBuffer class.
 *
 * @tparam DATA_LEN : Length of event data
 */
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

/**
 * @brief EventBuffer class for storing events. The counter is mainly used for identifying events and check if the master correctly acknowledged them.
 *
 * @tparam DATA_LEN: Length of event data
 */
template <uint8_t DATA_LEN>
class EventBuffer {
    /**
     * @brief Counter for identifying events. The counter is incremented every time an event is added to the buffer.
     *
     */
    uint8_t counter_ = 0;

    /**
     * @brief Specific cmd stored in this buffer
     *
     */
    const uint8_t cmd_;

    /**
     * @brief CircularBuffer for storing events
     *
     */
    CircularBuffer<Event<DATA_LEN>, 8> buffer;

   public:
    /**
     * @brief Construct a new Event Buffer object
     *
     * @param cmd : Specific cmd stored in this buffer
     */
    EventBuffer(const uint8_t cmd) : cmd_(cmd){};

    /**
     * @brief Get the Cmd object
     *
     * @return uint8_t : Specific cmd stored in this buffer
     */
    uint8_t get_cmd() const {
        return cmd_;
    }

    /**
     * @brief Get the Counter object
     *
     * @return uint8_t : Counter for identifying events
     */
    uint8_t get_counter() const {
        return counter_;
    }

    /**
     * @brief Increment the counter by 1
     *
     */
    void increment_counter() {
        counter_++;
    }

    /**
     * @brief Get the Len object
     *
     * @return uint8_t : Length of event data
     */
    uint8_t get_len() const {
        return DATA_LEN;
    }

    /**
     * @brief Get the Event Count object
     *
     * @return uint8_t : Number of events stored in buffer
     */
    uint8_t get_event_count() const {
        return buffer.size();
    }

    /**
     * @brief Add an event to the buffer
     *
     * @param event : Event to add
     */
    void add_event(const Event<DATA_LEN> event) {
        buffer.push(event);
        counter_++;
    }

    /**
     * @brief Remove the first event from the buffer
     *
     */
    void remove_first_event() {
        buffer.shift();
    }

    /**
     * @brief Get the first event from the buffer without removing it
     *
     * @return Event<DATA_LEN>
     */
    Event<DATA_LEN> peek_event() const {
        return buffer.first();
    }

    /**
     * @brief Get the event object at the given index
     *
     * @param index : Index of event to get
     * @return Event<DATA_LEN> : Event at given index
     */
    Event<DATA_LEN> get_event(uint8_t index) const {
        return buffer[index];
    }

    /**
     * @brief Check if buffer is empty
     *
     * @return true : Buffer is empty
     * @return false : Buffer is not empty
     */
    bool has_events() const {
        return !buffer.isEmpty();
    }

    /**
     * @brief Check fits in send buffer
     *
     * @param send_buffer : CircularBuffer to check if event fits in
     * @return true : Event fits in send buffer
     * @return false : Event does not fit in send buffer
     */
    bool fits_in_send_buffer(CircularBuffer<uint8_t, 70> &send_buffer) {  // TX-Buffer size changed
        uint8_t total_frame_len = DATA_LEN + 3;
        return send_buffer.available() >= total_frame_len;
    }
};

// TODO: Make 258 in circ buf parameter templated to SEND_BUFFER_SIZE
/**
 * @brief Pushes all events in ev_buf to send_buffer
 *
 * @tparam DATA_LEN : Length of event data
 * @tparam SEND_BUFFER_SIZE : Size of send buffer
 * @param ev_buf : EventBuffer to push events from
 * @param send_buffer : CircularBuffer to push events to
 */
template <uint8_t DATA_LEN, uint8_t SEND_BUFFER_SIZE>
void push_ev_to_send_buf(EventBuffer<DATA_LEN> &ev_buf, CircularBuffer<uint8_t, 70> &send_buffer) {  // TX-Buffer size changed
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
