# Session service — planned P1

Reserved for the authoritative multiplayer service. No server is implemented.

The server will own simulation, cargo, mission clocks, tool state, validated commands, and durable reward receipts. The lobby host owns the campaign. These are different roles. Static web hosting cannot execute this service.

See bible sections 18–20 and GDD NET-01/NET-02. Select hosting only after measuring room CPU, memory, bandwidth, and latency. Never put service credentials in the client or repository.
