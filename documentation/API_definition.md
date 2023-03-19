# /api

## /api/status

### /api/connected-modules

> GET

```json
{
    "slot_0": {
        "name": "Case",
        "version": 1,
        "configuration_target_reached": false,
    },
    "slot_1": {
        "name": "ClockModule",
        "version": 1,
        "configuration_target_reached": true
    },
    "slot_2": {
        "name": "TheButton",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_3": {
        "name": "Keypads",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_4": {
        "name": "Wires",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_5": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": true
    },
    "slot_6": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": true
    },
    "slot_7": {
        "name": "TheButton",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_8": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": true
    },
    "slot_9": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": true
    },
    "slot_10": {
        "name": "CapacitorDischarge",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_11": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": true
    },
    "slot_12": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": true
    }   
}
```

### /api/Case/1/[0-12]

> GET

```json
{
  "serialNumber": "AL50F2",
  "indicatorText": ["Empty","SND","CLR","CAR"],
  "indicatorLed": [false, false, false, false, false],
  "batteries": [true,false,true,false,true,false],
  "ports": {
    "DVI_D": false,
    "Parallel": true,
    "PS_2": false,
    "Serial": false,
    "Cinch": false
    }
}
```

> PUT

```json
{
   "indicatorLed": [true, false, true, true, true]
}
```

### /api/ClockModule/1/[0-12]

> GET

```json
{
    "secondsLeft": 20,
    "strikeLed": [true, false]    
}
```

> PUT

```json
{
    "secondsLeft": 20,
    "strikeLed": [true, false]  
}
```

### /api/Wires/1/[0-12]

> GET

<!-- color 0 means not connected -->
<!-- see wires type in common -->

```json
{
    "wiresColor": [0, 1, 2, 4, 5, 6],
    "statusLed": {
        "red": true,
        "green": false
    }
}

> PUT

```json
{   
    "statusLed": {
        "red": false,
        "green": false
    }
}
```

### /api/SimonSays/1/[0-12]

> GET

```json
{
    "led":{
        "red": true,
        "green": false,
        "yellow": false,
        "blue": false
    },
    "button": {
        "red": true,
        "green": false,
        "yellow": false,
        "blue": false
    },
    "statusLed": {
        "red": true,
        "green": false
    }
}
```

> PUT

```json
{
    "led": {
        "red": true,
        "green": false,
        "yellow": false,
        "blue": false
    },
    "statusLed": {
        "red": false,
        "green": false
    }
}
```

### /api/Mazes/1/[0-12]

> GET

```json
{
    "button": {
        "top": true,
        "right": false,
        "bottom": false,
        "left": false
    },
    "wallMatrix": [[true],[false]],
    "special": {
        "circle1": {"x": 1, "y": 2},
        "circle2": {"x": 3, "y": 4},
        "player": {"x": 5, "y": 6},
        "target": {"x": 7, "y": 8}
    },
    "statusLed": {
        "red": true,
        "green": false
    }
}
```

> PUT

```json
{
    "wallMatrix": [[true],[false]],
    "special": {
        "circle1": {"x": 1, "y": 2},
        "circle2": {"x": 3, "y": 4},
        "player": {"x": 5, "y": 6},
        "target": {"x": 7, "y": 8}
    },
    "statusLed": {
        "red": true,
        "green": false
    }
    
}
```

### /api/Button/1/[0-12]

<!-- todo -->

### /api/Keypad/1/[0-12]

<!-- todo -->

### /api/WhosOnFirst/1/[0-12]

<!-- todo -->

### /api/Memory/1/[0-12]

<!-- todo -->

### /api/MorseCode/1/[0-12]

<!-- todo -->

### /api/ComplicatedWires/1/[0-12]

<!-- todo -->

### /api/WireSequences/1/[0-12]

<!-- todo -->

### /api/Passwords/1/[0-12]

<!-- todo -->

### /api/VentingGas/1/[0-12]

<!-- todo -->

### /api/Knobs/1/[0-12]

<!-- todo -->

### /api/CapacitorDischarge/1/[0-12]

<!-- todo -->

## /api/play

### /api/play/config

> PUT

```json
{
    "available_modules": [
        {"name": "Wires", "count": 0},
        {"name": "TheButton", "count": 0},
        {"name": "Keypads", "count": 0},
        {"name": "SimonSays", "count": 1},
        {"name": "WhosOnFirst", "count": 0},
        {"name": "Memory", "count": 1},
        {"name": "MorseCode", "count": 2},
        {"name": "ComplicatedWires", "count": 1},
        {"name": "WireSequences", "count": 2},
        {"name": "Mazes", "count": 0},
        {"name": "Passwords", "count": 2},
        {"name": "VentingGas", "count": 0},
        {"name": "CapacitorDischarge", "count": 0},
        {"name": "Knobs", "count": 0}
    ],
    "count_of_wished_modules": 5,
    "seconds_to_play": 0,
    "severity_level": 1
}
```

(Response of generated configuration)

> GET

```json
["Wires", "SimonSays", "Wires", "TheButton"]
```

### /api/play/config/Case/1/[0-12]

> GET

```json
{
    "caseTarget":{
        "serialNumber": "AL5OF2",
        "indicatorText": ["SND", "CLR", "CAR", "NSA", "SIG"],
        "indicatorLed":[true,false,true,false,false],
        "batteries": [true, false, false, false, false, false],
        "ports": {
            "DVI-D" : false,
            "Parallel": true,
            "PS/2": false,
            "RJ-45" : false,
            "Serial": false,
            "Cinch": false
        }
    },
    "caseState":{
        "serialNumber": "JG0IZ1",
        "indicatorText": ["IND", "MSA", "FRk", "NSA", "SIG"],
        "indicatorLed":[false,false,true,false,false],
        "batteries": [true, true, true, false, false, false],
        "ports": {
            "DVI-D" : true,
            "Parallel": false,
            "PS/2": false,
            "RJ-45" : false,
            "Serial": false,
            "Cinch": false
        }
    }
}
```

### /api/play/config/Wires/1/[0-12]

> GET

```json
// "black" / "blue" / "" / "red" / "white" / "yellow"
{
    "wiresTarget":{

        "statusLed":{
            "red": false,
            "green": false
        },
        "wiresColor":[4,4,1,5,1,3]
    },
    "wiresState":{

        "statusLed":{
            "red": false,
            "green": true
        },
        "wiresColor":[2,3,1,4,5,3]
    }
}
```

### /api/play/config/TheButton/1/[0-12]
<!-- todo -->

### /api/play/config/Keypads/1/[0-12]
<!-- todo -->

### /api/play/config/WhosOnFirst/1/[0-12]
<!-- todo -->

### /api/play/config/Memory/1/[0-12]
<!-- todo -->

### /api/play/config/MorseCode/1/[0-12]
<!-- todo -->

### /api/play/config/ComplicatedWires/1/[0-12]
<!-- todo -->

### /api/play/config/WireSequences/1/[0-12]
<!-- todo -->

### /api/play/config/Mazes/1/[0-12]
<!-- todo -->

### /api/play/config/Passwords/1/[0-12]
<!-- todo -->

### /api/play/config/VentingGas/1/[0-12]
<!-- todo -->

### /api/play/config/CapacitorDischarge/1/[0-12]
<!-- todo -->

### /api/play/config/Knobs/1/[0-12]
<!-- todo -->

### /api/play/SetGameState

**gamemodes**:

* test_idle
* setup
* playing

> PUT

```json
{
    "gamemode": "playing"
}
```

> GET


```json
{
    "gamemode": "playing"
}
```
